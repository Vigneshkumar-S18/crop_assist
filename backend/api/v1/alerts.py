from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import datetime, timezone
from schemas.alert import AlertItem, AlertDetailResponse
from services.sensor_service import get_latest_sensor_data

router = APIRouter(tags=["Alerts"])

@router.get("/fields/{field_id}/alerts", response_model=List[AlertItem])
async def get_field_alerts(
    field_id: str,
    severity: Optional[str] = Query(None, description="Filter: CRITICAL, WARNING, INFO")
) -> List[AlertItem]:
    """
    Get all active threshold alerts, sensor warnings, and weather risks for a field.
    """
    alerts = []
    sens = get_latest_sensor_data(field_id=field_id)
    
    # Check sensor values vs physiological crop safety thresholds
    if sens.soil_moisture.value < 40.0:
        alerts.append(AlertItem(
            id="alert_moist_01",
            field_id=field_id,
            type="critical",
            alert_type="SOIL_MOISTURE_LOW",
            severity="High",
            tier="🔴 Alert",
            category="Irrigation & Soil",
            title="Low Soil Moisture Detected",
            shortDesc=f"Moisture is {sens.soil_moisture.value}%, below the 40% physiological safety threshold.",
            message=f"Soil moisture dropped to {sens.soil_moisture.value}%.",
            currentVal=f"{sens.soil_moisture.value}%",
            targetVal="60–80%",
            growthStage="Flowering",
            recommended_action="Start drip irrigation cycle for 30 minutes.",
            time="10 min ago",
            acknowledged=False
        ))
    if sens.temperature.value > 34.0:
        alerts.append(AlertItem(
            id="alert_temp_01",
            field_id=field_id,
            type="warning",
            alert_type="HEAT_STRESS_WARNING",
            severity="Moderate",
            tier="🟡 Watch",
            category="Canopy Climate",
            title="Elevated Canopy Temperature",
            shortDesc=f"Temperature reached {sens.temperature.value}°C, raising blossom drop risk.",
            message=f"Temperature reached {sens.temperature.value}°C.",
            currentVal=f"{sens.temperature.value}°C",
            targetVal="20–30°C",
            growthStage="Flowering",
            recommended_action="Ensure root hydration and deploy shade nets.",
            time="25 min ago",
            acknowledged=False
        ))
    if sens.humidity.value > 85.0:
        alerts.append(AlertItem(
            id="alert_hum_01",
            field_id=field_id,
            type="warning",
            alert_type="FUNGAL_RISK",
            severity="Moderate",
            tier="🟡 Watch",
            category="Pathology & Humidity",
            title="High Relative Humidity (>85%)",
            shortDesc=f"Current humidity is {sens.humidity.value}%. Prolonged dampness favors early blight.",
            message=f"Humidity is {sens.humidity.value}%.",
            currentVal=f"{sens.humidity.value}%",
            targetVal="60–80%",
            growthStage="Flowering",
            recommended_action="Inspect foliage and maintain row spacing.",
            time="1 hr ago",
            acknowledged=False
        ))
        
    # Default info alert if no anomalies
    if not alerts:
        alerts.append(AlertItem(
            id="alert_info_01",
            field_id=field_id,
            type="info",
            alert_type="SYSTEM_OPTIMAL",
            severity="Low",
            tier="🟢 Normal",
            category="System Health",
            title="All Sensors Normal",
            shortDesc="All micro-climate and soil nutrient parameters are within healthy limits.",
            message="Optimal crop health conditions.",
            currentVal="Optimal",
            targetVal="Optimal",
            growthStage="Flowering",
            recommended_action="Continue standard monitoring schedule.",
            time="Just now",
            acknowledged=True
        ))
        
    if severity:
        alerts = [a for a in alerts if a.severity.lower() == severity.lower() or a.type.lower() == severity.lower()]
        
    return alerts

@router.get("/alerts/{alert_id}", response_model=AlertDetailResponse)
async def get_alert_detail(alert_id: str) -> AlertDetailResponse:
    """
    Get detailed breakdown, timeline, and mitigation checklist for an alert.
    """
    alert_obj = AlertItem(
        id=alert_id,
        field_id="field-001",
        type="critical",
        alert_type="SOIL_MOISTURE_LOW",
        severity="High",
        tier="🔴 Alert",
        category="Irrigation",
        title="Low Soil Moisture Alert",
        shortDesc="Soil moisture dropped below safety limits.",
        currentVal="38.0%",
        targetVal="60–80%",
        growthStage="Flowering",
        recommended_action="Initiate drip irrigation",
        time="Just now"
    )
    return AlertDetailResponse(
        alert=alert_obj,
        whyHappened=[
            "High daytime evapotranspiration (ET0 = 4.2 mm/day)",
            "Delayed irrigation schedule by 18 hours",
            "Elevated canopy temperature (31°C)"
        ],
        fastSolution={
            "name": "Targeted Drip Irrigation",
            "action": "Run pump for 25-35 minutes",
            "expected_response": "Moisture will recover to 65% in ~45 minutes"
        },
        organicSolution={
            "name": "Straw Mulching & Compost Top-dressing",
            "action": "Apply 5-7cm dry straw layer around base",
            "expected_response": "Reduces moisture evaporation by up to 40%"
        },
        precautions=[
            "Do not overhead sprinkle during midday sun",
            "Ensure drippers are not clogged with silt"
        ],
        actionSteps=[
            "Turn on Irrigation Motor Relay",
            "Set timer to 30 minutes",
            "Verify pressure gauge is ~1.5 bar",
            "Re-check ESP32 moisture telemetry in 1 hour"
        ],
        verification={
            "metric": "Soil Moisture",
            "target": ">60%",
            "recheck_window": "60 minutes"
        },
        triggering_metrics={"soil_moisture": 38.0, "threshold_min": 40.0},
        historical_occurrences=2,
        mitigation_checklist=[
            "Verify irrigation pump electrical power",
            "Inspect field valve 2 for clogs or leaks",
            "Confirm drip emitter pressure",
            "Run 30-min replenishment cycle"
        ]
    )
