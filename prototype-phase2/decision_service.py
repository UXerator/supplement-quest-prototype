"""Shared safety-first query workflow for the Streamlit UI and FastAPI backend."""

from pathlib import Path

from decision_card import DecisionCard, build_decision_card, matches_reviewed_claim
from evidence_classifier import EvidenceClassifier
from evidence_classifier import EvidenceLevel
from rag_engine import ODSRAGEngine
from safety_filter import SafetyFilterEngine


class SupplementQuestService:
    """Screen queries, retrieve local ODS passages, and assemble Decision Cards."""

    def __init__(
        self, data_dir: Path, database_dir: Path, trusted_sources: bool = True
    ) -> None:
        self.safety_filter = SafetyFilterEngine()
        self.evidence_classifier = EvidenceClassifier()
        self.rag_engine = ODSRAGEngine(data_dir, database_dir, trusted_sources=trusted_sources)
        self.rag_engine.ingest_directory()

    def review(self, query: str, language: str = "English") -> DecisionCard:
        """Return an abstention immediately for high-risk input; otherwise retrieve locally."""
        safety_result = self.safety_filter.evaluate_query(query, language)
        if safety_result.is_high_risk:
            return build_decision_card(
                query=query,
                passages=[],
                evidence_level=self.evidence_classifier.classify([]),
                safety_result=safety_result,
                language=language,
            )

        passages = self.rag_engine.retrieve(query, language=language)
        reviewed_labels = [
            passage.evidence_level
            if matches_reviewed_claim(query, passage)
            else EvidenceLevel.NOT_ADDRESSED
            for passage in passages
        ]
        evidence_level = self.evidence_classifier.classify(
            reviewed_labels
        )
        return build_decision_card(
            query, passages, evidence_level, safety_result, language=language
        )
