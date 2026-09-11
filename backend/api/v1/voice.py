from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
from typing import Optional
from services.voice_service import transcribe_audio, synthesize_speech

router = APIRouter(prefix="/voice", tags=["Voice (STT / TTS)"])

class TTSRequest(BaseModel):
    text: str
    language: Optional[str] = "en"
    voice_gender: Optional[str] = "female"

class TTSResponse(BaseModel):
    status: str = "success"
    audio_base64: Optional[str] = ""
    audio_url: Optional[str] = None
    format: str = "audio/mp3"
    duration_seconds: float = 0.0
    message: Optional[str] = None
    character_count: Optional[int] = 0

class STTResponse(BaseModel):
    transcript: str = ""
    text: Optional[str] = None
    detected_language: str = "en"
    confidence: float = 0.95

@router.post("/transcribe", response_model=STTResponse)
async def voice_to_text(
    audio: UploadFile = File(...),
    language: Optional[str] = Form(None)
) -> STTResponse:
    """
    Speech-to-Text endpoint supporting regional farmer speech (Tamil, Hindi, Telugu, English).
    """
    audio_bytes = await audio.read()
    result = transcribe_audio(audio_bytes, filename=audio.filename or "input.wav")
    text_val = result.get("text", result.get("transcript", ""))
    return STTResponse(
        transcript=text_val,
        text=text_val,
        detected_language=result.get("detected_language", "en"),
        confidence=result.get("confidence", 0.95)
    )

@router.post("/synthesize", response_model=TTSResponse)
async def text_to_voice(req: TTSRequest) -> TTSResponse:
    """
    Text-to-Speech synthesizer generating natural audio responses in farmer's local dialect.
    """
    res = synthesize_speech(req.text, language=req.language or "en")
    return TTSResponse(**res)
