import asyncio
import httpx
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_root():
    res = client.get("/")
    assert res.status_code == 200
    assert res.json()["status"] == "operational"
    print("PASS: Root endpoint")

def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"
    print("PASS: Health endpoint")

def test_domain_gating_and_chat():
    # 1. Out of domain query
    res_ood = client.post("/api/v1/chat", json={
        "message": "Who is the president of the United States?",
        "language": "en"
    })
    assert res_ood.status_code == 200
    ood_data = res_ood.json()
    assert ood_data["domain"] in ["OUT_OF_DOMAIN", "NON_AGRICULTURE"]
    assert ood_data["intent"] in ["OUT_OF_DOMAIN", "GENERAL_CHAT"]
    print("PASS: Out-of-Domain Gating Rejected Off-Topic Query properly")

    # 2. Agricultural query in English
    res_agri = client.post("/api/v1/chat", json={
        "message": "Should I irrigate my tomato plants today? Soil moisture is 35%",
        "field_id": "field_001",
        "language": "en"
    })
    assert res_agri.status_code == 200
    agri_data = res_agri.json()
    assert agri_data["domain"] in ["AGRICULTURE", "AGRICULTURAL"]
    assert "reply" in agri_data
    assert len(agri_data.get("suggested_actions", [])) > 0
    print(f"PASS: Agri Chat (Intent: {agri_data['intent']})")

    # 3. Tamil agricultural query
    res_ta = client.post("/api/v1/chat", json={
        "message": "தக்காளி இலையில் மஞ்சள் புள்ளி தெரிகிறது என்ன செய்வது?",
        "language": "ta"
    })
    assert res_ta.status_code == 200
    ta_data = res_ta.json()
    assert ta_data["domain"] in ["AGRICULTURE", "AGRICULTURAL"]
    print(f"PASS: Tamil Query Routing & Response (Intent: {ta_data['intent']})")

def test_sensors_and_telemetry():
    # Ingest telemetry
    res_ingest = client.post("/api/v1/devices/dev_alpha_01/telemetry", json={
        "device_id": "dev_alpha_01",
        "soil_moisture": 38.2,
        "temperature": 32.5,
        "humidity": 88.0,
        "soil_n": 120.0,
        "soil_p": 25.0,
        "soil_k": 140.0,
        "soil_ph": 6.3,
        "battery_pct": 92.0
    })
    assert res_ingest.status_code == 200
    
    # Get current sensor status
    res_curr = client.get("/api/v1/fields/field_001/sensors/current")
    assert res_curr.status_code == 200
    curr_data = res_curr.json()
    assert "soil_moisture" in curr_data
    assert "value" in curr_data["soil_moisture"]
    print("PASS: Sensor Telemetry Ingest & Current Query")

    # Get history
    res_hist = client.get("/api/v1/fields/field_001/sensors/history?range=24h&interval=1h")
    assert res_hist.status_code == 200
    assert len(res_hist.json()["data"]) > 0
    print("PASS: Sensor Time-series History")

def test_motor_actuation():
    res = client.post("/api/v1/devices/dev_alpha_01/motor", json={
        "state": "ON",
        "duration_minutes": 25,
        "source": "test_agent"
    })
    assert res.status_code == 200
    assert res.json()["state"] == "ON"
    print("PASS: Motor Actuation Relay")

def test_weather():
    res_curr = client.get("/api/v1/fields/field_001/weather/current")
    assert res_curr.status_code == 200
    assert "temperature" in res_curr.json()
    print("PASS: Current Weather (Open-Meteo)")

    res_fc = client.get("/api/v1/fields/field_001/weather/forecast?days=7")
    assert res_fc.status_code == 200
    assert len(res_fc.json()["forecast"]) == 7
    print("PASS: Weather 7-Day Forecast")

def test_fertilizer_and_irrigation():
    # Fertilizer
    res_fert = client.post("/api/v1/fertilizer/recommend", json={
        "crop": "Tomato",
        "growth_stage": "Flowering",
        "nitrogen": 25.0,
        "phosphorus": 20.0,
        "potassium": 30.0,
        "soil_ph": 6.2
    })
    assert res_fert.status_code == 200
    fert_data = res_fert.json()
    assert fert_data["status"] == "success"
    assert "chemical_solution" in fert_data
    assert "organic_solution" in fert_data
    print("PASS: Fertilizer Recommendation Engine")

    # Irrigation
    res_irr = client.post("/api/v1/irrigation/decision", json={
        "crop": "Tomato",
        "growth_stage": "fruiting",
        "soil_moisture": 32.0,
        "rain_probability_next_24h": 10
    })
    assert res_irr.status_code == 200
    irr_data = res_irr.json()
    assert irr_data["action"] == "IRRIGATE"
    print("PASS: Contextual Irrigation Decision Engine")

def test_alerts_and_voice():
    # Alerts
    res_alerts = client.get("/api/v1/fields/field_001/alerts")
    assert res_alerts.status_code == 200
    print("PASS: Field Active Alerts")

    # Voice TTS
    res_tts = client.post("/api/v1/voice/synthesize", json={
        "text": "Watering scheduled for tomorrow morning.",
        "language": "en"
    })
    assert res_tts.status_code == 200
    assert "audio_base64" in res_tts.json()
    print("PASS: Voice Synthesis (TTS)")

if __name__ == "__main__":
    print("\n================= RUNNING APISENSE / CROPPILOT V1 TEST SUITE =================\n")
    test_root()
    test_health()
    test_domain_gating_and_chat()
    test_sensors_and_telemetry()
    test_motor_actuation()
    test_weather()
    test_fertilizer_and_irrigation()
    test_alerts_and_voice()
    print("\n================= ALL V1 CONTRACT TESTS PASSED SUCCESSFULLY! =================\n")
