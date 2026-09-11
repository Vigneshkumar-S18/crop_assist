const getBaseUrl = () => {
  if (typeof window !== "undefined" && window.location.hostname) {
    return `http://${window.location.hostname}:8000`;
  }
  return "http://localhost:8000";
};

export async function sendChatMessage(message, contextData = {}) {
  const response = await fetch(`${getBaseUrl()}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message,
      language: contextData.language || "en",
      sensor_data: contextData.sensors || {
        soil_moisture: 28,
        temperature: 31,
        humidity: 76,
        water_quality: "Good"
      },
      weather_data: contextData.weather || {
        rain_probability_6h: 82,
        rain_probability_24h: 91,
        location: contextData.locationName || "Coimbatore, Tamil Nadu"
      },
      latest_scan: contextData.latestScan || null,
      crop_history: contextData.cropHistory || null,
      conversation_history: contextData.conversationHistory || []
    })
  });

  if (!response.ok) {
    throw new Error("Failed to communicate with AgriSense Assistant");
  }

  return response.json();
}

export async function transcribeVoiceAudio(audioBlob, language = "en") {
  const formData = new FormData();
  formData.append("audio", audioBlob, "recording.webm");
  if (language) {
    formData.append("language", language);
  }

  const response = await fetch(`${getBaseUrl()}/api/v1/voice/transcribe`, {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    throw new Error("Voice transcription failed");
  }

  return response.json();
}

export async function synthesizeVoiceSpeech(text, language = "en") {
  const response = await fetch(`${getBaseUrl()}/api/v1/voice/synthesize`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      text,
      language
    })
  });

  if (!response.ok) {
    throw new Error("Voice synthesis failed");
  }

  return response.json();
}
