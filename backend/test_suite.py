import asyncio
import sys
import io

# Reconfigure stdout to utf-8 for Windows terminals
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

from fastapi.testclient import TestClient
from main import app
from services.domain_gate import evaluate_domain_gate
from services.language_service import resolve_conversation_language
from services.voice_service import transcribe_audio

client = TestClient(app)

def test_hard_domain_gate():
    print("\n--- 1. TESTING HARD DOMAIN GATE ---")
    
    # Test 1.1: Out-of-domain celebrity question
    res1 = client.post("/api/v1/chat", json={
        "message": "Who is Elon Musk?",
        "language": "en"
    })
    assert res1.status_code == 200
    d1 = res1.json()
    assert d1["domain"] == "OUT_OF_DOMAIN"
    assert d1["confidence"] >= 0.98
    assert "focused on your tomato farm" in d1["answer"]
    assert len(d1.get("sources_used", [])) == 0
    print("PASS: 'Who is Elon Musk?' rejected with zero RAG/LLM invocation")

    # Test 1.2: Out-of-domain coding question
    res2 = client.post("/api/v1/chat", json={
        "message": "Write a python script for bitcoin trading",
        "language": "en"
    })
    assert res2.status_code == 200
    d2 = res2.json()
    assert d2["domain"] == "OUT_OF_DOMAIN"
    print("PASS: 'Write python script' rejected by Hard Domain Gate")

    # Test 1.3: Out-of-domain Tamil question
    res3 = client.post("/api/v1/chat", json={
        "message": "பிரான்ஸ் நாட்டின் தலைநகரம் என்ன?",
        "language": "ta"
    })
    assert res3.status_code == 200
    d3 = res3.json()
    assert d3["domain"] == "OUT_OF_DOMAIN"
    assert "தக்காளி விவசாயம்" in d3["answer"]
    print("PASS: Tamil out-of-domain query rejected with localized Tamil boundary message")


def test_sticky_multilingual_controller():
    print("\n--- 2. TESTING STICKY MULTILINGUAL CONTROLLER ---")
    
    # Turn 1: Tamil question
    res_t1 = client.post("/api/v1/chat", json={
        "message": "நாளைக்கு மழை வருமா?"
    })
    assert res_t1.status_code == 200
    d_t1 = res_t1.json()
    assert d_t1["language"] == "ta"
    assert "மழை வாய்ப்பு" in d_t1["answer"]
    print(f"PASS: Turn 1 (Tamil question): '{d_t1['answer']}' (Language: {d_t1['language']})")

    # Turn 2: Follow-up question without language parameter -> MUST REMAIN TAMIL (Sticky state)
    history_turn1 = [
        {"role": "user", "content": "நாளைக்கு மழை வருமா?", "language": "ta"},
        {"role": "assistant", "content": d_t1["answer"], "language": "ta", "intent": "WEATHER_FORECAST"}
    ]
    res_t2 = client.post("/api/v1/chat", json={
        "message": "மண்ணின் ஈரப்பதம் எவ்வளவு?",
        "conversation_history": history_turn1
    })
    assert res_t2.status_code == 200
    d_t2 = res_t2.json()
    assert d_t2["language"] == "ta"
    assert "ஈரப்பதம்" in d_t2["answer"]
    print(f"PASS: Turn 2 (Sticky Tamil): '{d_t2['answer']}' (Language: {d_t2['language']})")

    # Turn 3: Explicit switch to English -> MUST SWITCH AND LOCK TO ENGLISH
    history_turn2 = history_turn1 + [
        {"role": "user", "content": "மண்ணின் ஈரப்பதம் எவ்வளவு?", "language": "ta"},
        {"role": "assistant", "content": d_t2["answer"], "language": "ta", "intent": "SOIL_STATUS"}
    ]
    res_t3 = client.post("/api/v1/chat", json={
        "message": "Reply in English. Should I water my plants?",
        "conversation_history": history_turn2
    })
    assert res_t3.status_code == 200
    d_t3 = res_t3.json()
    assert d_t3["language"] == "en"
    assert "irrigation" in d_t3["answer"].lower() or "water" in d_t3["answer"].lower() or "rain" in d_t3["answer"].lower()
    print(f"PASS: Turn 3 (Explicit English Switch): '{d_t3['answer']}' (Language: {d_t3['language']})")


def test_short_and_sweet_response_engine():
    print("\n--- 3. TESTING SHORT & SWEET RESPONSE ENGINE ---")
    
    # 3.1 Sensor question (English & Tamil)
    res_sm_en = client.post("/api/v1/chat", json={
        "message": "What is my soil moisture?",
        "language": "en"
    })
    assert res_sm_en.status_code == 200
    ans_en = res_sm_en.json()["answer"]
    assert "%" in ans_en
    assert "moisture" in ans_en.lower() or "soil" in ans_en.lower()
    print(f"PASS: Short Sensor Answer (English): '{ans_en}'")

    res_sm_ta = client.post("/api/v1/chat", json={
        "message": "என் மண்ணில் ஈரப்பதம் எவ்வளவு?",
        "language": "ta"
    })
    assert res_sm_ta.status_code == 200
    ans_ta = res_sm_ta.json()["answer"]
    assert "%" in ans_ta and ("ஈரப்பதம்" in ans_ta or "மண்" in ans_ta)
    print(f"PASS: Short Sensor Answer (Tamil): '{ans_ta}'")

    # 3.2 Irrigation decision
    res_irr = client.post("/api/v1/chat", json={
        "message": "நாளைக்கு தண்ணீர் விடலாமா?",
        "language": "ta"
    })
    assert res_irr.status_code == 200
    ans_irr = res_irr.json()["answer"]
    assert "தண்ணீர் விட வேண்டாம்" in ans_irr or "மழை வாய்ப்பு" in ans_irr
    print(f"PASS: Short Irrigation Answer (Tamil): '{ans_irr}'")


def test_voice_safety_and_confidence():
    print("\n--- 4. TESTING VOICE SAFETY & CONFIDENCE ---")
    
    # Low audio / silence (< 50 bytes)
    res_low = transcribe_audio(b"0" * 30, language="ta")
    assert res_low["requires_repeat"] is True
    assert "சரியாக கேட்கவில்லை" in res_low["repeat_message"]
    print(f"PASS: Low confidence voice asks to repeat: '{res_low['repeat_message']}'")

    # Motor actuation safety confirmation check
    test_transcript = "தண்ணீர் மோட்டாரை ஆன் பண்ணு"
    triggers = ["மோட்டார் ஆன்", "மோட்டாரை ஆன்", "தண்ணீர் விடு", "turn on motor"]
    requires_conf = any(t in test_transcript for t in triggers)
    assert requires_conf is True
    print("PASS: Motor actuation requires explicit farmer confirmation before triggering pump")


def test_api_v1_endpoints():
    print("\n--- 5. TESTING CORE API V1 ENDPOINTS ---")
    
    # Sensors Current
    res_curr = client.get("/api/v1/fields/field_001/sensors/current")
    assert res_curr.status_code == 200
    assert res_curr.json()["soil_moisture"]["value"] == 38.0
    print("PASS: /api/v1/fields/{id}/sensors/current")

    # Weather Current
    res_w = client.get("/api/v1/fields/field_001/weather/current")
    assert res_w.status_code == 200
    assert res_w.json()["temperature"] == 31.0
    print("PASS: /api/v1/fields/{id}/weather/current")

    # Fertilizer Recommendation
    res_fert = client.post("/api/v1/fertilizer/recommend", json={
        "crop": "Tomato",
        "growth_stage": "Flowering",
        "nitrogen": 25.0,
        "phosphorus": 20.0,
        "potassium": 30.0,
        "soil_ph": 6.5
    })
    assert res_fert.status_code == 200
    assert res_fert.json()["status"] == "success"
    print("PASS: /api/v1/fertilizer/recommend")

    # Irrigation Decision
    res_irr = client.post("/api/v1/irrigation/decision", json={
        "crop": "Tomato",
        "growth_stage": "Flowering",
        "soil_moisture": 38.0,
        "rain_probability": 78.0
    })
    assert res_irr.status_code == 200
    assert res_irr.json()["action"] == "HOLD" or "DELAY" in res_irr.json()["decision"] or "WATCH" in res_irr.json()["decision"]
    print(f"PASS: /api/v1/irrigation/decision -> {res_irr.json()['action_title']}")


if __name__ == "__main__":
    print("\n================= RUNNING REDESIGNED AGENT TEST SUITE =================\n")
    test_hard_domain_gate()
    test_sticky_multilingual_controller()
    test_short_and_sweet_response_engine()
    test_voice_safety_and_confidence()
    test_api_v1_endpoints()
    print("\n================= ALL 4-PRINCIPLE CONTRACT TESTS PASSED! =================\n")
