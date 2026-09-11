from fastapi import APIRouter
from schemas.chat import ChatRequest, ChatResponse
from services.response_generator import generate_chat_response

router = APIRouter(prefix="/chat", tags=["Chat"])

@router.post("", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest) -> ChatResponse:
    """
    Main Query-Aware Agricultural Agent endpoint.
    Performs domain gating, intent routing, scoped context retrieval (sensors, weather, disease history),
    decision engine reasoning, and multilingual generation with structured action suggestions.
    """
    return await generate_chat_response(request)
