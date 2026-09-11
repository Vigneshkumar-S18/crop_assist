from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class ChatRequest(BaseModel):
    message: str
    language: Optional[str] = None
    conversation_id: Optional[str] = None
    field_id: Optional[str] = "field-001"
    sensor_data: Optional[Dict[str, Any]] = None
    weather_data: Optional[Dict[str, Any]] = None
    latest_scan: Optional[Dict[str, Any]] = None
    crop_history: Optional[Dict[str, Any]] = None
    conversation_history: Optional[List[Dict[str, Any]]] = None

class RouterOutput(BaseModel):
    domain: str = "AGRICULTURE"
    intent: str
    confidence: float = 0.95
    entities: Dict[str, Any] = Field(default_factory=dict)
    required_sources: List[str] = Field(default_factory=list)
    optional_sources: List[str] = Field(default_factory=list)
    requires_decision_engine: bool = False
    requires_clarification: bool = False
    detected_language: str = "en"

class ChatResponse(BaseModel):
    conversation_id: Optional[str] = "conv-001"
    domain: Optional[str] = "AGRICULTURAL"
    intent: str = "GENERAL_AGRICULTURE"
    confidence: float = 0.95
    answer: str
    reply: Optional[str] = None
    language: str = "en"
    sources_used: List[str] = Field(default_factory=list)
    data: Optional[Dict[str, Any]] = None
    recommendation: Optional[Dict[str, Any]] = None
    actions: List[Dict[str, Any]] = Field(default_factory=list)
    suggested_actions: List[str] = Field(default_factory=list)
    follow_up_suggestions: List[str] = Field(default_factory=list)
