import sys
import os

# Ensure backend app is in sys.path
sys.path.insert(0, os.path.abspath("."))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_full_user_flow():
    print("--- 1. Testing Root Endpoint ---")
    resp = client.get("/")
    assert resp.status_code == 200
    print("Root response:", resp.json())

    print("\n--- 2. Registering User ---")
    reg_payload = {
        "name": "Dr. Alex Vance",
        "email": "alex.vance@example.com",
        "password": "securepassword123"
    }
    resp = client.post("/api/auth/register", json=reg_payload)
    if resp.status_code == 400: # If already exists
        print("User already registered, logging in...")
        resp = client.post("/api/auth/login", json={"email": reg_payload["email"], "password": reg_payload["password"]})
    
    assert resp.status_code == 200 or resp.status_code == 201
    token = resp.json()["access_token"]
    print("Obtained JWT Access Token:", token[:25] + "...")

    headers = {"Authorization": f"Bearer {token}"}

    print("\n--- 3. Testing Authenticated /api/auth/me ---")
    resp = client.get("/api/auth/me", headers=headers)
    assert resp.status_code == 200
    user_data = resp.json()
    print("Authenticated user:", user_data["name"], f"({user_data['email']})")

    print("\n--- 4. Creating New Research ---")
    res_payload = {
        "topic": "Impact of Artificial Intelligence on Modern Healthcare Systems",
        "depth": "standard",
        "source_preference": "all",
        "additional_instructions": "Focus on diagnostic accuracy and patient privacy."
    }
    resp = client.post("/api/research", json=res_payload, headers=headers)
    assert resp.status_code == 201
    research_id = resp.json()["id"]
    print(f"Created Research #{research_id} successfully.")

    print("\n--- 5. Polling Research Progress & Agent Execution ---")
    import time
    for _ in range(15):
        time.sleep(1)
        progress_resp = client.get(f"/api/research/{research_id}/progress", headers=headers)
        data = progress_resp.json()
        print(f"Progress: {data['progress_percentage']}% | Step: {data['current_step']}")
        if data["completed"]:
            break

    assert data["status"] == "completed"
    print("Research agent pipeline execution completed 100%!")

    print("\n--- 6. Retrieving Research Report ---")
    report_resp = client.get(f"/api/research/{research_id}/report", headers=headers)
    assert report_resp.status_code == 200
    report = report_resp.json()
    print("Report Title:", report["title"])
    print("Report Length:", len(report["content"]), "characters.")

    print("\n--- 7. Testing PDF Download Export ---")
    pdf_resp = client.get(f"/api/research/{research_id}/download", headers=headers)
    assert pdf_resp.status_code == 200
    assert pdf_resp.headers["content-type"] == "application/pdf"
    print("PDF Report Download Generated! Size:", len(pdf_resp.content), "bytes.")

    print("\n--- 8. Testing Follow-up Q&A ---")
    followup_resp = client.post(
        f"/api/research/{research_id}/follow-up",
        json={"message": "What are the primary ethical concerns regarding patient privacy?"},
        headers=headers
    )
    assert followup_resp.status_code == 200
    followup_data = followup_resp.json()
    print("Follow-up Assistant Reply:", followup_data["assistant_message"][:150] + "...")

    print("\n--- 9. Testing Dashboard Analytics ---")
    dash_resp = client.get("/api/dashboard", headers=headers)
    assert dash_resp.status_code == 200
    dash_data = dash_resp.json()
    print("Dashboard Metrics:", f"Total: {dash_data['total_research']} | Completed: {dash_data['completed_research']} | Saved: {dash_data['saved_reports']}")

    print("\n==========================================")
    print("SUCCESS: ALL BACKEND ENDPOINTS & WORKFLOWS VERIFIED 100% WORKING!")
    print("==========================================")

if __name__ == "__main__":
    test_full_user_flow()
