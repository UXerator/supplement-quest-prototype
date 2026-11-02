"""
rag_engine.py - Constrained RAG Engine for SupplementQuest
Ingests NIH Office of Dietary Supplements (ODS) fact sheets into ChromaDB and 
strictly constrains query retrieval and generation to authoritative ODS passages.
"""

import hashlib
import json
import re
import uuid
from pathlib import Path
from typing import Any, List, Literal
from pydantic import BaseModel, ConfigDict, Field, HttpUrl, field_validator

import chromadb
from langchain_text_splitters import RecursiveCharacterTextSplitter

from evidence_classifier import EvidenceLevel


class ODSClaimChunk(BaseModel):
    """Data model for a single ODS fact sheet passage chunk with traceability."""
    chunk_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    master_claim_id: str = Field(description="Unique claim ID, e.g., CLM-ASH-001")
    supplement_name: str = Field(description="Name of dietary supplement (e.g., Ashwagandha)")
    section_title: str = Field(description="Section title (e.g., Health Effects, Safety)")
    passage_text: str = Field(description="Exact ODS source passage text")
    evidence_level: str = Field(description="Supported | Limited Evidence | Not Addressed")
    ods_url: str = Field(description="Official NIH ODS reference URL")


class ODSRetrievalResult(BaseModel):
    """Data model representing the RAG retrieval output for prompt grounding."""
    query: str
    retrieved_chunks: List[ODSClaimChunk]
    grounded_prompt: str


class NIHODSRAGEngine:
    """Vector database manager and constrained RAG query engine."""

    def __init__(self, db_path: str = "./ods_chroma_db", collection_name: str = "nih_ods_factsheets"):
        """Initialize ChromaDB local client and collection."""
        self.db_path = db_path
        self.collection_name = collection_name
        self.client = chromadb.PersistentClient(path=self.db_path)
        self.collection = self.client.get_or_create_collection(name=self.collection_name)

    def ingest_sample_ods_data(self) -> int:
        """Reject legacy sample seeding: sample prose is not verified ODS evidence."""
        raise RuntimeError(
            "Unverified sample seeding is disabled. Use ODSRAGEngine with official local sources."
        )

    def retrieve_passages(self, query: str, n_results: int = 3) -> ODSRetrievalResult:
        """Search vector database for passages matching user query."""
        results = self.collection.query(
            query_texts=[query],
            n_results=n_results
        )

        retrieved_chunks: List[ODSClaimChunk] = []

        if results and results["documents"] and results["documents"][0]:
            for i in range(len(results["documents"][0])):
                doc_text = results["documents"][0][i]
                meta = results["metadatas"][0][i]
                chunk_id = results["ids"][0][i]

                retrieved_chunks.append(
                    ODSClaimChunk(
                        chunk_id=chunk_id,
                        master_claim_id=meta.get("master_claim_id", "CLM-UNKNOWN"),
                        supplement_name=meta.get("supplement_name", "General"),
                        section_title=meta.get("section_title", "General"),
                        passage_text=doc_text,
                        evidence_level=meta.get("evidence_level", "Not Addressed"),
                        ods_url=meta.get("ods_url", "https://ods.od.nih.gov/")
                    )
                )

        grounded_prompt = self._build_constrained_prompt(query, retrieved_chunks)

        return ODSRetrievalResult(
            query=query,
            retrieved_chunks=retrieved_chunks,
            grounded_prompt=grounded_prompt
        )

    def _build_constrained_prompt(self, query: str, chunks: List[ODSClaimChunk]) -> str:
        """Construct a strict RAG prompt barring external knowledge."""
        context_block = ""
        for idx, chunk in enumerate(chunks, 1):
            context_block += (
                f"\n--- PASSAGE {idx} ---\n"
                f"Master Claim ID: {chunk.master_claim_id}\n"
                f"Supplement: {chunk.supplement_name}\n"
                f"Section: {chunk.section_title}\n"
                f"Evidence Level: {chunk.evidence_level}\n"
                f"Source Text: {chunk.passage_text}\n"
                f"ODS URL: {chunk.ods_url}\n"
            )

        prompt = (
            "You are the SupplementQuest AI engine grounded EXCLUSIVELY in NIH Office of Dietary Supplements (ODS) fact sheets.\n"
            "STRICT CONSTRAINTS:\n"
            "1. Answer the user query strictly using the provided ODS passages below.\n"
            "2. Do NOT use outside medical or general knowledge.\n"
            "3. If the passage does not support the claim, explicitly categorize as 'Limited Evidence' or 'Not Addressed'.\n"
            "4. Include Master Claim IDs (CLM-xxx) for all statements.\n\n"
            f"USER QUERY: {query}\n\n"
            f"RETRIEVED ODS PASSAGES:{context_block if context_block else ' No matching ODS passages found.'}\n"
        )
        return prompt


if __name__ == "__main__":
    engine = NIHODSRAGEngine()
    count = engine.ingest_sample_ods_data()
    print(f"✅ Successfully ingested {count} ODS sample claim chunks into ChromaDB.")

    test_query = "Does Ashwagandha boost testosterone?"
    res = engine.retrieve_passages(test_query)
    print(f"\nQuery: {res.query}")
    print(f"Passages Found: {len(res.retrieved_chunks)}")
    print("\nGenerated Constrained Prompt Preview:\n")
    print(res.grounded_prompt[:600] + "...")


class ODSClaimRecord(BaseModel):
    """Human-curated JSON record linking an ODS passage to an evidence tier."""

    model_config = ConfigDict(extra="forbid")

    master_claim_id: str = Field(pattern=r"^CLM-\d{3,}$")
    claim: str = Field(min_length=1)
    evidence_level: EvidenceLevel
    text: str = Field(min_length=1)
    source_title: str = Field(min_length=1)
    source_url: HttpUrl | None = None
    practical_guidance: str | None = None
    food_first_alternative: str | None = None
    language: Literal["English", "Español"] | None = None

    @field_validator("source_url")
    @classmethod
    def require_official_url(cls, value: HttpUrl | None) -> HttpUrl | None:
        """Reject non-ODS attribution rather than presenting it as trusted evidence."""
        if value and (value.scheme != "https" or value.host != "ods.od.nih.gov"):
            raise ValueError("Source URL must use HTTPS on ods.od.nih.gov.")
        return value

    @field_validator("master_claim_id", "claim", "text", "source_title", mode="before")
    @classmethod
    def reject_blank_strings(cls, value: Any) -> Any:
        """Prevent whitespace-only content from entering the evidence index."""
        if isinstance(value, str) and not value.strip():
            raise ValueError("This field must not be blank.")
        return value.strip() if isinstance(value, str) else value


class RetrievedPassage(BaseModel):
    """A local ODS passage returned by the vector index."""

    master_claim_id: str
    claim: str | None = None
    text: str
    source_title: str
    source_path: str
    source_url: str | None = None
    language: Literal["English", "Español"] | None = None
    evidence_level: EvidenceLevel = EvidenceLevel.NOT_ADDRESSED
    practical_guidance: str | None = None
    food_first_alternative: str | None = None
    distance: float = Field(ge=0)


def _embedding(text: str, dimensions: int = 384) -> list[float]:
    """Create a stable local feature-hash vector without downloading a model."""
    vector = [0.0] * dimensions
    for token in re.findall(r"\w+", text.casefold(), flags=re.UNICODE):
        digest = hashlib.sha256(token.encode("utf-8")).digest()
        bucket = int.from_bytes(digest[:4], "big") % dimensions
        vector[bucket] += 1.0 if digest[4] & 1 else -1.0
    magnitude = sum(value * value for value in vector) ** 0.5
    return [value / magnitude for value in vector] if magnitude else vector


def _stable_claim_id(source_path: str, index: int, text: str) -> str:
    """Return a stable provisional reference for a source passage."""
    digest = hashlib.sha256(f"{source_path}:{index}:{text}".encode("utf-8")).hexdigest()
    return f"CLM-{int(digest[:8], 16):010d}"


class ODSRAGEngine:
    """Index and retrieve local fact-sheet passages without web or LLM access."""

    COLLECTION_NAME = "supplementquest_ods"

    def __init__(
        self,
        data_dir: Path,
        database_dir: Path,
        chunk_size: int = 900,
        chunk_overlap: int = 120,
        trusted_sources: bool = False,
    ) -> None:
        """Initialize a persistent Chroma collection and local text splitter."""
        if chunk_overlap < 0 or chunk_size <= chunk_overlap:
            raise ValueError("chunk_size must be greater than non-negative chunk_overlap.")
        self.data_dir = data_dir
        self.trusted_sources = trusted_sources
        self.client = chromadb.PersistentClient(path=str(database_dir))
        self.collection = self.client.get_or_create_collection(
            name=self.COLLECTION_NAME,
            metadata={"hnsw:space": "cosine"},
        )
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            add_start_index=True,
        )

    def close(self) -> None:
        """Close the Chroma client and release its file handles."""
        self.client.close()

    def ingest_directory(self) -> int:
        """Index Markdown and curated JSON files under the configured source directory."""
        if not self.data_dir.exists():
            return 0

        records: list[dict[str, Any]] = []
        paths = sorted(
            (*self.data_dir.rglob("*.md"), *self.data_dir.rglob("*.json")),
            key=lambda path: str(path).casefold(),
        )
        for path in paths:
            if path.name.lower() != "readme.md":
                records.extend(self._records_from_file(path))

        existing_ids = self.collection.get(include=[])["ids"]
        if existing_ids:
            self.collection.delete(ids=existing_ids)
        if records:
            self.collection.upsert(
                ids=[record["id"] for record in records],
                documents=[record["text"] for record in records],
                embeddings=[_embedding(record["text"]) for record in records],
                metadatas=[record["metadata"] for record in records],
            )
        return len(records)

    def retrieve(
        self, query: str, limit: int = 3, language: str | None = None
    ) -> list[RetrievedPassage]:
        """Return relevant local passages ordered by cosine distance."""
        clean_query = query.strip()
        if not clean_query:
            raise ValueError("Query must not be empty.")
        if limit < 1:
            raise ValueError("limit must be at least 1.")
        if language not in {None, "English", "Español"}:
            raise ValueError("language must be 'English' or 'Español'.")

        count = self.collection.count()
        if count == 0:
            return []
        result = self.collection.query(
            query_embeddings=[_embedding(clean_query)],
            n_results=count,
            include=["documents", "metadatas", "distances"],
        )
        documents = result.get("documents") or [[]]
        metadatas = result.get("metadatas") or [[]]
        distances = result.get("distances") or [[]]
        passages: list[RetrievedPassage] = []
        stop_words = {
            "what", "does", "do", "is", "are", "the", "a", "an", "i", "my", "about",
            "say", "says", "ods", "nih", "provide", "provides", "foods", "food",
            "contain", "contains", "and", "or", "for", "of", "in", "to", "help",
            "qué", "que", "dice", "sobre", "la", "el", "los", "las", "un", "una",
            "son", "es", "de", "del", "en", "y", "o", "para", "alimentos",
            "contienen", "contiene", "fuente", "fuentes", "ayuda", "me", "mi",
        }
        query_terms = set(re.findall(r"\w+", clean_query.casefold())) - stop_words
        if not query_terms:
            return []
        for document, metadata, distance in zip(documents[0], metadatas[0], distances[0]):
            if not document or metadata is None or distance is None:
                continue
            if 1.0 - float(distance) < 0.05:
                continue
            if language and metadata.get("language") not in {None, language}:
                continue
            source_terms = set(re.findall(r"\w+", str(document).casefold()))
            if not query_terms.issubset(source_terms):
                continue
            passages.append(
                RetrievedPassage(
                    master_claim_id=str(metadata.get("master_claim_id", "CLM-000")),
                    claim=metadata.get("claim"),
                    text=str(document),
                    source_title=str(metadata.get("source_title", "NIH ODS fact sheet")),
                    source_path=str(metadata.get("source_path", "")),
                    source_url=metadata.get("source_url"),
                    language=metadata.get("language"),
                    evidence_level=metadata.get(
                        "evidence_level", EvidenceLevel.NOT_ADDRESSED.value
                    ),
                    practical_guidance=metadata.get("practical_guidance"),
                    food_first_alternative=metadata.get("food_first_alternative"),
                    distance=float(distance),
                )
            )
            if len(passages) == limit:
                break
        return passages

    def _records_from_file(self, path: Path) -> list[dict[str, Any]]:
        """Parse one supported source file into Chroma-compatible records."""
        relative_path = str(path.relative_to(self.data_dir))
        if path.suffix.lower() == ".json":
            payload = json.loads(path.read_text(encoding="utf-8"))
            if not isinstance(payload, dict) or not isinstance(payload.get("claims"), list):
                raise ValueError(f"{path} must contain an object with a 'claims' array.")
            claims = [ODSClaimRecord.model_validate(item) for item in payload["claims"]]
            if self.trusted_sources and any(
                not claim.source_url or not claim.language for claim in claims
            ):
                raise ValueError(f"{path} must give every claim an official source URL and language.")
            return [
                self._record(
                    text=claim.text,
                    source_path=relative_path,
                    claim_id=claim.master_claim_id,
                    title=claim.source_title,
                    source_url=str(claim.source_url) if claim.source_url else None,
                    evidence_level=claim.evidence_level.value,
                    practical_guidance=claim.practical_guidance,
                    food_first_alternative=claim.food_first_alternative,
                    claim=claim.claim,
                    language=claim.language,
                )
                for claim in claims
            ]

        content = path.read_text(encoding="utf-8").strip()
        if not content:
            return []
        title_match = re.search(r"^\s*#\s+(.+)$", content, re.MULTILINE)
        title = title_match.group(1).strip() if title_match else path.stem.replace("-", " ")
        source_url_match = re.search(r"^Source URL:\s*(\S+)\s*$", content, re.MULTILINE)
        source_url = None
        language_match = re.search(r"^Language:\s*(English|Español)\s*$", content, re.MULTILINE)
        language = language_match.group(1) if language_match else None
        if self.trusted_sources and (not source_url_match or not language):
            raise ValueError(f"{path} must include an official Source URL and Language header.")
        if source_url_match:
            parsed_url = HttpUrl(source_url_match.group(1))
            if parsed_url.scheme != "https" or parsed_url.host != "ods.od.nih.gov":
                raise ValueError(f"{path} must cite an HTTPS NIH ODS source URL.")
            source_url = str(parsed_url)
            first_section = re.search(r"^##\s+", content, re.MULTILINE)
            if first_section:
                content = content[first_section.start():]
        return [
            self._record(
                text=chunk,
                source_path=relative_path,
                claim_id=_stable_claim_id(relative_path, index, chunk),
                title=title,
                source_url=source_url,
                evidence_level=EvidenceLevel.NOT_ADDRESSED.value,
                practical_guidance=None,
                food_first_alternative=None,
                index=index,
                language=language,
            )
            for index, chunk in enumerate(self.splitter.split_text(content))
        ]

    @staticmethod
    def _record(
        text: str,
        source_path: str,
        claim_id: str,
        title: str,
        source_url: str | None,
        evidence_level: str,
        practical_guidance: str | None,
        food_first_alternative: str | None,
        index: int = 0,
        claim: str | None = None,
        language: str | None = None,
    ) -> dict[str, Any]:
        """Normalize a source passage and its attribution for storage."""
        metadata: dict[str, str | int] = {
            "source_path": source_path,
            "source_title": title,
            "master_claim_id": claim_id,
            "evidence_level": evidence_level,
            "chunk_index": index,
        }
        for key, value in (
            ("source_url", source_url),
            ("practical_guidance", practical_guidance),
            ("food_first_alternative", food_first_alternative),
            ("claim", claim),
            ("language", language),
        ):
            if value:
                metadata[key] = value
        record_id = hashlib.sha256(f"{source_path}:{claim_id}".encode()).hexdigest()
        return {"id": record_id, "text": text, "metadata": metadata}