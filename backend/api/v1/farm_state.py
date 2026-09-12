from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import asyncio
import json
import time

router = APIRouter(prefix="/farm-state", tags=["Farm Simulation State"])

class FarmStateRequest(BaseModel):
    mode: str  # "NORMAL" | "DRY" | "WET"

# In-memory shared state store
CURRENT_FARM_STATE: Dict[str, Any] = {
    "mode": "NORMAL",
    "last_updated": time.strftime("%H:%M:%S"),
    "updated_at": time.time()
}

# Active SSE subscribers
subscribers: List[asyncio.Queue] = []

@router.get("")
@router.get("/")
def get_current_farm_state():
    """Returns the single source of truth farm simulation state."""
    return CURRENT_FARM_STATE

@router.post("")
@router.post("/")
async def set_farm_state(req: FarmStateRequest):
    """
    Sets the simulation farm state (NORMAL, DRY, WET)
    and immediately broadcasts it to all connected devices.
    """
    mode = req.mode.upper().strip()
    if mode not in ["NORMAL", "DRY", "WET"]:
        raise HTTPException(status_code=400, detail="Invalid mode. Must be NORMAL, DRY, or WET.")

    CURRENT_FARM_STATE["mode"] = mode
    CURRENT_FARM_STATE["last_updated"] = time.strftime("%H:%M:%S")
    CURRENT_FARM_STATE["updated_at"] = time.time()

    # Notify all active SSE subscribers
    payload = json.dumps(CURRENT_FARM_STATE)
    dead_queues = []
    for q in subscribers:
        try:
            q.put_nowait(payload)
        except Exception:
            dead_queues.append(q)
    for dq in dead_queues:
        if dq in subscribers:
            subscribers.remove(dq)

    return {
        "success": True,
        "mode": CURRENT_FARM_STATE["mode"],
        "last_updated": CURRENT_FARM_STATE["last_updated"]
    }

@router.get("/stream")
async def stream_farm_state(request: Request):
    """
    Server-Sent Events (SSE) stream for real-time <10ms synchronization
    between Phone 1 (Farmer App) and Phone 2 (Farm Demo Controller).
    """
    queue = asyncio.Queue()
    subscribers.append(queue)

    async def event_generator():
        # Send initial state immediately on connect
        initial_data = json.dumps(CURRENT_FARM_STATE)
        yield f"data: {initial_data}\n\n"
        try:
            while True:
                if await request.is_disconnected():
                    break
                try:
                    data = await asyncio.wait_for(queue.get(), timeout=15.0)
                    yield f"data: {data}\n\n"
                except asyncio.TimeoutError:
                    # Heartbeat keep-alive
                    yield f": keepalive\n\n"
        finally:
            if queue in subscribers:
                subscribers.remove(queue)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )
