"""Fail-closed safety screening for high-risk supplement questions."""

import re
from typing import ClassVar

from pydantic import BaseModel, Field


class SafetyEvaluationResult(BaseModel):
    """Outcome of screening a query before any evidence retrieval."""

    is_high_risk: bool
    matched_categories: list[str] = Field(default_factory=list)
    disclaimer_text: str | None = None
    retained_query: str


class SafetyFilterEngine:
    """Identify queries that must be referred to a clinician without retrieval."""

    HIGH_RISK_PATTERNS: ClassVar[dict[str, tuple[str, ...]]] = {
        "pregnancy_lactation": (
            r"\bpregnan\w*\b",
            r"\bbreast[\s-]?feed\w*\b",
            r"\blactat\w*\b",
            r"\bprenatal\b",
            r"\btrimester\b",
            r"\bfertilit\w*\b",
            r"\btrying to conceiv\w*\b",
            r"\bexpecting\b",
            r"\bembarazad[ao]s?\b",
            r"\bembarazo\b",
            r"\bdar el pecho\b",
            r"\blactancia\b",
            r"\bamamant\w*\b",
        ),
        "medication_interactions": (
            r"\binteract\w*\b",
            r"\bprescription(s)?\b",
            r"\bmedicat\w*\b",
            r"\bdrug interactions?\b",
            r"\bblood thinner(s)?\b",
            r"\bwarfarin\b",
            r"\baspirin\b",
            r"\bstatins?\b",
            r"\banti[- ]?depressants?\b",
            r"\bssri(s)?\b",
            r"\bcontraindicat\w*\b",
            r"\bmedicamento(s)?\b",
            r"\bmedicina(s)?\b",
            r"\breceta médica\b",
            r"\binteracción(es)?\b",
            r"\bwarfarina\b",
        ),
        "pediatric_infant": (
            r"\binfant(s)?\b",
            r"\bbab(y|ies)\b",
            r"\btoddler(s)?\b",
            r"\bnewborn(s)?\b",
            r"\bunder[- ]?\d+\b",
            r"\bpediatric(s)?\b",
            r"\bchild(ren)?\b",
            r"\bkid(s)?\b",
            r"\bteen(?:s|age(?:r|rs)?)?\b",
            r"\bbebé(s)?\b",
            r"\bniñ[oa]s?\b",
            r"\badolescente(s)?\b",
            r"\binfantil(es)?\b",
        ),
        "severe_symptoms_conditions": (
            r"\bcancer\b",
            r"\btumou?r(s)?\b",
            r"\bchemo(?:therapy)?\b",
            r"\bkidney disease\b",
            r"\bliver disease\b",
            r"\bheart disease\b",
            r"\bliver failure\b",
            r"\bheart failure\b",
            r"\bdiabet(?:es|ic)?\b",
            r"\bstroke\b",
            r"\bautoimmune\b",
            r"\bsevere pain\b",
            r"\bblood pressure crisis\b",
            r"\bchest pain\b",
            r"\btrouble breathing\b",
            r"\bdifficulty breathing\b",
            r"\bcáncer\b",
            r"\bdiabetes\b",
            r"\benfermedad (?:renal|hepática|cardíaca)\b",
            r"\binsuficiencia (?:renal|hepática|cardíaca)\b",
            r"\bdolor intenso\b",
            r"\bdolor en el pecho\b",
            r"\bdificultad para respirar\b",
        ),
        "high_dose_usage": (
            r"\b(?:high|large|mega)[\s-]?dose(?:s|d)?\b",
            r"\bmegados(?:e|es|ing)\b",
            r"\boverdos\w*\b",
            r"\b(?:double|triple|doubling|tripling)\b.{0,40}\b(?:dose|dosage|serving|scoop|pill|tablet)s?\b",
            r"\b(?:more|above|exceed\w*)\b.{0,40}\b(?:recommended|label|limit|dose|dosage)\b",
            r"\b(?:dosis (?:alta|altas|elevada|elevadas)|megadosis|sobredosis)\b",
            r"\b(?:doblar|duplicar|triplicar|doble|triple)\b.{0,40}\b(?:dosis|porción|porciones|pastillas?)\b",
            r"\b(?:más de|superar|exceder)\b.{0,40}\b(?:dosis|recomendad\w*|límite)\b",
        ),
    }

    MANDATORY_DISCLAIMER: ClassVar[str] = (
        "Educational notice: SupplementQuest provides general education, not "
        "medical advice, diagnosis, or treatment. This high-risk question was "
        "not sent to the evidence engine. Please speak with a qualified "
        "healthcare professional or pharmacist before starting, stopping, or "
        "combining supplements."
    )
    SPANISH_DISCLAIMER: ClassVar[str] = (
        "Aviso educativo: SupplementQuest ofrece información general, no "
        "consejos médicos, diagnósticos ni tratamientos. Esta pregunta de alto "
        "riesgo no se envió al motor de evidencia. Consulta con un profesional "
        "de la salud o farmacéutico antes de empezar, suspender o combinar "
        "suplementos."
    )

    def evaluate_query(
        self, query: str, language: str = "English"
    ) -> SafetyEvaluationResult:
        """Return matched safety categories; do not retrieve or generate content."""
        clean_query = query.strip()
        if not clean_query:
            raise ValueError("Query must not be empty.")
        if language not in {"English", "Español"}:
            raise ValueError("language must be 'English' or 'Español'.")

        matched_categories = [
            category
            for category, patterns in self.HIGH_RISK_PATTERNS.items()
            if any(re.search(pattern, clean_query, re.IGNORECASE) for pattern in patterns)
        ]
        disclaimer = (
            self.SPANISH_DISCLAIMER if language == "Español" else self.MANDATORY_DISCLAIMER
        )
        return SafetyEvaluationResult(
            is_high_risk=bool(matched_categories),
            matched_categories=matched_categories,
            disclaimer_text=disclaimer if matched_categories else None,
            retained_query=clean_query,
        )
