import unittest

from evidence_classifier import EvidenceClassifier, EvidenceLevel


class EvidenceClassifierTests(unittest.TestCase):
    def setUp(self) -> None:
        self.classifier = EvidenceClassifier()

    def test_empty_or_unknown_labels_default_to_not_addressed(self) -> None:
        self.assertEqual(self.classifier.classify([]), EvidenceLevel.NOT_ADDRESSED)
        self.assertEqual(
            self.classifier.classify(["not a tier"]),
            EvidenceLevel.NOT_ADDRESSED,
        )

    def test_limited_evidence_takes_precedence_over_supported(self) -> None:
        self.assertEqual(
            self.classifier.classify(
                [EvidenceLevel.SUPPORTED, EvidenceLevel.LIMITED_EVIDENCE]
            ),
            EvidenceLevel.LIMITED_EVIDENCE,
        )

    def test_not_addressed_takes_precedence(self) -> None:
        self.assertEqual(
            self.classifier.classify(
                [EvidenceLevel.SUPPORTED, EvidenceLevel.NOT_ADDRESSED]
            ),
            EvidenceLevel.NOT_ADDRESSED,
        )


if __name__ == "__main__":
    unittest.main()
