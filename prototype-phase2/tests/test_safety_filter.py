import unittest

from safety_filter import SafetyFilterEngine


class SafetyFilterTests(unittest.TestCase):
    def setUp(self) -> None:
        self.engine = SafetyFilterEngine()

    def test_detects_high_risk_topics(self) -> None:
        cases = {
            "Can I take this while pregnant?": "pregnancy_lactation",
            "Will it interact with warfarin?": "medication_interactions",
            "Are gummy vitamins safe for kids?": "pediatric_infant",
            "What should I take for chest pain?": "severe_symptoms_conditions",
            "¿Puedo tomarlo durante el embarazo?": "pregnancy_lactation",
            "¿Es seguro para niños?": "pediatric_infant",
        }
        for query, category in cases.items():
            with self.subTest(query=query):
                result = self.engine.evaluate_query(query)
                self.assertTrue(result.is_high_risk)
                self.assertIn(category, result.matched_categories)
                self.assertIsNotNone(result.disclaimer_text)

    def test_non_high_risk_question_is_not_abstained(self) -> None:
        result = self.engine.evaluate_query("What does ODS say about vitamin D?")
        self.assertFalse(result.is_high_risk)
        self.assertEqual(result.matched_categories, [])
        self.assertIsNone(result.disclaimer_text)

    def test_high_dose_queries_return_the_exact_configured_notice(self) -> None:
        for query, language in (
            ("Is a high-dose vitamin safe?", "English"),
            ("Can I double my pre-workout scoop?", "English"),
            ("What if I take more than the recommended dose?", "English"),
            ("¿Puedo tomar una dosis alta?", "Español"),
            ("¿Es seguro duplicar la dosis?", "Español"),
            ("Tomé una sobredosis", "Español"),
        ):
            with self.subTest(query=query):
                result = self.engine.evaluate_query(query, language)
                self.assertIn("high_dose_usage", result.matched_categories)
                self.assertEqual(result.disclaimer_text, (
                    self.engine.SPANISH_DISCLAIMER if language == "Español"
                    else self.engine.MANDATORY_DISCLAIMER
                ))

    def test_spanish_abstention_notice_is_localized(self) -> None:
        result = self.engine.evaluate_query(
            "¿Puedo tomar esto durante el embarazo?", language="Español"
        )
        self.assertTrue(result.is_high_risk)
        self.assertIn("profesional", result.disclaimer_text)

    def test_empty_query_is_rejected(self) -> None:
        with self.assertRaises(ValueError):
            self.engine.evaluate_query("  ")


if __name__ == "__main__":
    unittest.main()
