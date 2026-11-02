"""Pydantic response models and builder for the internal Decision Card."""

import re
from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from evidence_classifier import (
    EvidenceLevel,
    SPANISH_UNCERTAINTY_LANGUAGE,
    UNCERTAINTY_LANGUAGE,
)
from rag_engine import RetrievedPassage
from safety_filter import SafetyEvaluationResult


class SourceCitation(BaseModel):
    """Verbatim passage and attribution for progressive source disclosure."""

    master_claim_id: str
    title: str
    text: str
    url: str | None = None
    language: str | None = None


class DecisionCard(BaseModel):
    """Structured, source-traceable decision support returned for each query."""

    model_config = ConfigDict(use_enum_values=True)

    claim_reviewed: str
    master_claim_id: str = Field(pattern=r"^CLM-\d{3,}$")
    claim_mapping_reviewed: bool = False
    evidence_level: EvidenceLevel
    ods_traceability_snippet: str
    safety_note: str
    practical_guidance: str
    food_first_alternative: str | None = None
    confidence_check_prompt: dict[str, Any]
    secondary_share_card_data: dict[str, str] | None = None
    is_abstention: bool = False
    matched_safety_categories: list[str] = Field(default_factory=list)
    sources: list[SourceCitation] = Field(default_factory=list)


def matches_reviewed_claim(query: str, passage: RetrievedPassage) -> bool:
    """Require the query to match curated claim wording before using claim metadata."""
    return bool(passage.claim) and re.findall(r"\w+", query.casefold()) == re.findall(
        r"\w+", (passage.claim or "").casefold()
    )


def build_decision_card(
    query: str,
    passages: list[RetrievedPassage],
    evidence_level: EvidenceLevel,
    safety_result: SafetyEvaluationResult,
    language: str = "English",
) -> DecisionCard:
    """Construct a Decision Card using only retrieved text and reviewed metadata."""
    if safety_result.is_high_risk:
        return DecisionCard(
            claim_reviewed=query,
            master_claim_id="CLM-000",
            evidence_level=EvidenceLevel.NOT_ADDRESSED,
            ods_traceability_snippet=(
                "La búsqueda ODS se omitió porque esta pregunta activó una regla de seguridad."
                if language == "Español"
                else "ODS retrieval was skipped because this question matched a high-risk safety rule."
            ),
            safety_note=safety_result.disclaimer_text or "",
            practical_guidance=(
                "Consulta con un profesional de la salud o farmacéutico para recibir "
                "orientación individualizada."
                if language == "Español"
                else "Please consult a qualified healthcare professional or pharmacist "
                "for individualized guidance."
            ),
            confidence_check_prompt={
                "question": (
                    "¿Te gustaría hablar de esto con un profesional de la salud?"
                    if language == "Español"
                    else "Would you like to discuss this with a healthcare professional?"
                ),
                "options": (
                    ["Sí", "Ya lo hice", "Aún no"]
                    if language == "Español"
                    else ["Yes", "I already have", "Not yet"]
                ),
            },
            is_abstention=True,
            matched_safety_categories=safety_result.matched_categories,
        )

    trace_parts = []
    for passage in passages:
        source_reference = (
            f" ({passage.source_url})"
            if passage.source_url
            else (
                f" [Archivo fuente: {passage.source_path}]"
                if language == "Español"
                else f" [Source file: {passage.source_path}]"
            )
        )
        claim_label = "Afirmación revisada" if language == "Español" else "Reviewed claim"
        reviewed_claim = f"{claim_label}: {passage.claim}\n" if passage.claim else ""
        trace_parts.append(
            f"[{passage.master_claim_id}] {passage.source_title}{source_reference}\n"
            f"{reviewed_claim}{passage.text}"
        )
    trace = "\n\n".join(trace_parts)
    primary = passages[0] if passages else None
    reviewed_match = bool(primary and matches_reviewed_claim(query, primary))
    if not trace:
        trace = (
            "Ningún pasaje NIH ODS local coincide con esta pregunta. No se afirma ninguna conclusión."
            if language == "Español"
            else "No local NIH ODS passage matched this question. No evidence claim is made."
        )

    if primary and reviewed_match and primary.practical_guidance:
        guidance = primary.practical_guidance
    elif not primary:
        guidance = (
            "No se encontró un pasaje ODS local; por eso no se puede ofrecer una recomendación."
            if language == "Español"
            else "No local ODS passage was found, so no evidence-based recommendation can be made."
        )
    else:
        guidance = (
            "Esta herramienta no ofrece recomendaciones personales sobre suplementos. "
            "Usa el pasaje citado como información general y consulta a un profesional "
            "de la salud sobre decisiones individuales."
            if language == "Español"
            else "This tool does not make a personal supplement recommendation. Use the cited "
            "passage as general education and discuss individual decisions with a healthcare "
            "professional."
        )
    uncertainty_language = (
        SPANISH_UNCERTAINTY_LANGUAGE[evidence_level]
        if language == "Español"
        else UNCERTAINTY_LANGUAGE[evidence_level]
    )
    educational_boundary = (
        "Información educativa; no es consejo médico."
        if language == "Español"
        else "Educational information only, not medical advice."
    )
    return DecisionCard(
        claim_reviewed=query,
        sources=[
            SourceCitation(
                master_claim_id=passage.master_claim_id,
                title=passage.source_title,
                text=passage.text,
                url=passage.source_url,
                language=passage.language,
            )
            for passage in passages
        ],
        master_claim_id=primary.master_claim_id if primary else "CLM-000",
        claim_mapping_reviewed=reviewed_match,
        evidence_level=evidence_level,
        ods_traceability_snippet=trace,
        safety_note=f"{educational_boundary} {uncertainty_language}",
        practical_guidance=guidance,
        food_first_alternative=primary.food_first_alternative if primary and reviewed_match else None,
        confidence_check_prompt={
            "question": (
                "¿Qué tan seguro/a te sientes sobre tu próximo paso?"
                if language == "Español"
                else "How confident do you feel about your next step?"
            ),
            "options": (
                ["No estoy seguro/a", "Algo seguro/a", "Seguro/a"]
                if language == "Español"
                else ["Not sure", "Somewhat confident", "Confident"]
            ),
        },
    )
