"""Mobile API contracts and same-origin SPA routing."""

import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from fastapi.testclient import TestClient

import api
from decision_service import SupplementQuestService


class MobileAPITests(unittest.TestCase):
    def test_mobile_routes_return_cards_and_reject_blank_queries(self) -> None:
        with patch("decision_service.ODSRAGEngine"):
            service = SupplementQuestService(Path("unused"), Path("unused"))
            service.rag_engine.retrieve.return_value = []
            service.rag_engine.collection.count.return_value = 0
            with patch.object(api, "get_service", return_value=service):
                with TestClient(api.app, raise_server_exceptions=False) as client:
                    self.assertEqual(client.get("/api/health").status_code, 200)
                    response = client.post("/api/decision", json={
                        "query": "Are gummy vitamins safe for kids?", "language": "English",
                    })
                    self.assertEqual(response.status_code, 200)
                    self.assertTrue(response.json()["is_abstention"])
                    service.rag_engine.retrieve.assert_not_called()
                    response = client.post("/api/decision", json={
                        "query": "What foods provide magnesium?", "language": "English",
                    })
                    self.assertFalse(response.json()["is_abstention"])
                    self.assertEqual(response.json()["evidence_level"], "Not Addressed")
                    self.assertEqual(
                        client.post("/api/decision", json={"query": "   "}).status_code, 422,
                    )
                    self.assertEqual(
                        client.post("/api/decision", json={
                            "query": "Test", "language": "unsupported",
                        }).status_code, 422,
                    )
                    self.assertEqual(client.get("/api/unknown").status_code, 404)
                    self.assertEqual(client.get("/assets/missing.js").status_code, 404)
                    service.rag_engine.retrieve.side_effect = RuntimeError("Index unavailable")
                    self.assertEqual(client.post("/api/decision", json={
                        "query": "What foods provide magnesium?",
                    }).status_code, 500)
                service.rag_engine.close.assert_called_once()

    def test_client_side_routes_serve_only_the_built_app(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "index.html").write_text("<html>SupplementQuest</html>", encoding="utf-8")
            with patch.object(api, "FRONTEND_DIR", root):
                client = TestClient(api.app)
                response = client.get("/decision-card")
                self.assertEqual(response.status_code, 200)
                self.assertEqual(response.headers["cache-control"], "no-store")
                self.assertIn("SupplementQuest", client.get("/").text)
                self.assertEqual(client.get("/manifest.webmanifest").status_code, 503)


if __name__ == "__main__":
    unittest.main()
