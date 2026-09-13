import unittest
import json
from backend.database import get_db_connection, init_db
from backend.server import calculate_competency, get_level_info, app
from fastapi.testclient import TestClient

class TestMineARExtended(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        init_db()
        cls.client = TestClient(app)

    def setUp(self):
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("UPDATE workers SET xp = 120, level = 1, progress_pct = 28, competency_score = 78.5 WHERE id = 'suresh_01'")
        cur.execute("DELETE FROM activity_attempts WHERE trainee_id = 'suresh_01' AND id LIKE 'test_act_%'")
        conn.commit()
        conn.close()

    def test_activity_attempt_history_never_overwrites(self):
        # Attempt #1: Wrong answer
        payload1 = {
            "trainee_id": "suresh_01",
            "activity_id": "act_fire_extinguisher",
            "selected_answer": "Water Extinguisher / Spray",
            "time_taken_sec": 7.5
        }
        resp1 = self.client.post("/api/v1/activities/act_fire_extinguisher/attempt", json=payload1)
        self.assertEqual(resp1.status_code, 200)
        res1 = resp1.json()
        self.assertFalse(res1["is_correct"])
        self.assertEqual(res1["xp_delta"], -10)
        first_attempt_num = res1["attempt_number"]

        # Attempt #2: Correct answer
        payload2 = {
            "trainee_id": "suresh_01",
            "activity_id": "act_fire_extinguisher",
            "selected_answer": "Dry Chemical Powder (DCP - IS 2171)",
            "time_taken_sec": 4.8
        }
        resp2 = self.client.post("/api/v1/activities/act_fire_extinguisher/attempt", json=payload2)
        self.assertEqual(resp2.status_code, 200)
        res2 = resp2.json()
        self.assertTrue(res2["is_correct"])
        self.assertEqual(res2["xp_delta"], 15)
        second_attempt_num = res2["attempt_number"]

        # Verify second attempt number incremented
        self.assertEqual(second_attempt_num, first_attempt_num + 1)

        # Verify both attempts exist in history
        hist_resp = self.client.get("/api/v1/trainees/suresh_01/activities/history")
        self.assertEqual(hist_resp.status_code, 200)
        history = hist_resp.json()
        self.assertGreaterEqual(len(history), 2)

        # Check filter for incorrect
        incorrect_resp = self.client.get("/api/v1/trainees/suresh_01/activities/history?status=incorrect")
        self.assertTrue(all(not a["is_correct"] for a in incorrect_resp.json()))

    def test_supervisor_only_certificate_issuing(self):
        # Trainee attempts to issue certificate -> 403 Forbidden!
        issue_payload = {
            "trainee_id": "suresh_01",
            "supervisor_id": "trainee_impersonator",
            "notes": "Trying to issue own cert"
        }
        trainee_resp = self.client.post(
            "/api/v1/supervisor/certificates/issue",
            json=issue_payload,
            headers={"X-User-Role": "trainee"}
        )
        self.assertEqual(trainee_resp.status_code, 403)

        # Supervisor issues certificate -> 200 Success & Audit recorded!
        supervisor_resp = self.client.post(
            "/api/v1/supervisor/certificates/issue",
            json={
                "trainee_id": "suresh_01",
                "supervisor_id": "supervisor_admin",
                "notes": "Reviewed training history, approved for DGMS certification."
            },
            headers={"X-User-Role": "supervisor"}
        )
        self.assertEqual(supervisor_resp.status_code, 200)
        cert_res = supervisor_resp.json()
        self.assertEqual(cert_res["certificate"]["status"], "ISSUED")

        # Verify audit log was created
        audit_resp = self.client.get("/api/v1/audit-logs")
        self.assertEqual(audit_resp.status_code, 200)
        logs = audit_resp.json()
        self.assertTrue(any(l["action"] == "CERTIFICATE_ISSUED" and l["target_id"] == "suresh_01" for l in logs))

    def test_daily_progress_endpoint(self):
        resp = self.client.get("/api/v1/trainees/suresh_01/daily-progress")
        self.assertEqual(resp.status_code, 200)
        dp = resp.json()
        self.assertGreaterEqual(len(dp), 5)
        self.assertEqual(dp[0]["day_name"], "Mon")

if __name__ == "__main__":
    unittest.main()
