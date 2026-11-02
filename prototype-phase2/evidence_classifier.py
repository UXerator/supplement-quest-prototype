"""Conservative evidence-tier classification from human-curated ODS metadata."""

from collections.abc import Iterable
from enum import StrEnum


class EvidenceLevel(StrEnum):
    """The three evidence labels displayed by SupplementQuest."""

    SUPPORTED = "Supported"
    LIMITED_EVIDENCE = "Limited Evidence"
    NOT_ADDRESSED = "Not Addressed"


UNCERTAINTY_LANGUAGE: dict[EvidenceLevel, str] = {
    EvidenceLevel.SUPPORTED: (
        "The cited ODS material supports this claim in the context described; "
        "it does not establish that the supplement is right for every person."
    ),
    EvidenceLevel.LIMITED_EVIDENCE: (
        "Evidence is limited or uncertain. The cited material does not support "
        "a confident conclusion for this claim."
    ),
    EvidenceLevel.NOT_ADDRESSED: (
        "The retrieved ODS material does not establish an evidence level for "
        "this claim. No conclusion is being inferred."
    ),
}

SPANISH_UNCERTAINTY_LANGUAGE: dict[EvidenceLevel, str] = {
    EvidenceLevel.SUPPORTED: (
        "El material ODS citado respalda esta afirmación en el contexto descrito; "
        "no demuestra que el suplemento sea adecuado para todas las personas."
    ),
    EvidenceLevel.LIMITED_EVIDENCE: (
        "La evidencia es limitada o incierta. El material citado no permite "
        "llegar a una conclusión firme sobre esta afirmación."
    ),
    EvidenceLevel.NOT_ADDRESSED: (
        "El material ODS recuperado no establece un nivel de evidencia para "
        "esta afirmación. No se está infiriendo ninguna conclusión."
    ),
}


class EvidenceClassifier:
    """Use only explicit, reviewed source labels; never infer a tier from prose."""

    _PRECEDENCE: tuple[EvidenceLevel, ...] = (
        EvidenceLevel.NOT_ADDRESSED,
        EvidenceLevel.LIMITED_EVIDENCE,
        EvidenceLevel.SUPPORTED,
    )

    def classify(self, labels: Iterable[str | EvidenceLevel]) -> EvidenceLevel:
        """Combine labels conservatively, defaulting to ``Not Addressed``."""
        normalized: set[EvidenceLevel] = set()
        for label in labels:
            try:
                normalized.add(EvidenceLevel(label))
            except ValueError:
                normalized.add(EvidenceLevel.NOT_ADDRESSED)

        if not normalized:
            return EvidenceLevel.NOT_ADDRESSED
        if EvidenceLevel.NOT_ADDRESSED in normalized:
            return EvidenceLevel.NOT_ADDRESSED
        if EvidenceLevel.LIMITED_EVIDENCE in normalized:
            return EvidenceLevel.LIMITED_EVIDENCE
        return EvidenceLevel.SUPPORTED

    def uncertainty_language(self, level: EvidenceLevel, language: str = "English") -> str:
        """Return the standard plain-language qualification for a tier."""
        if language == "Español":
            return SPANISH_UNCERTAINTY_LANGUAGE[level]
        if language != "English":
            raise ValueError("language must be 'English' or 'Español'.")
        return UNCERTAINTY_LANGUAGE[level]
