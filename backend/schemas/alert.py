from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class AlertItem(BaseModel):
    id: str = "alert-001"
    field_id: Optional[str] = "field-001"
    type: str = "warning"  # "critical" | "warning" | "info"
    alert_type: Optional[str] = None
    severity: str = "Moderate"  # "High" | "Moderate" | "Low" | "CRITICAL" | "WARNING" | "INFO"
    tier: str = "🟡 Watch"  # "🔴 Alert" | "🟡 Watch" | "🟢 Normal"
    category: str = "Irrigation"
    title: str
    message: Optional[str] = None
    shortDesc: str = ""
    recommended_action: Optional[str] = None
    time: str = "Just now"
    currentVal: str = "--"
    targetVal: str = "--"
    growthStage: str = "Flowering"
    status: Optional[str] = "UNREAD"
    acknowledged: bool = False

class AlertDetailResponse(BaseModel):
    alert: AlertItem
    whyHappened: List[str] = Field(default_factory=list)
    fastSolution: Dict[str, Any] = Field(default_factory=dict)
    organicSolution: Dict[str, Any] = Field(default_factory=dict)
    precautions: List[str] = Field(default_factory=list)
    actionSteps: List[str] = Field(default_factory=list)
    verification: Dict[str, Any] = Field(default_factory=dict)
    triggering_metrics: Optional[Dict[str, Any]] = None
    historical_occurrences: Optional[int] = 1
    mitigation_checklist: Optional[List[str]] = None
