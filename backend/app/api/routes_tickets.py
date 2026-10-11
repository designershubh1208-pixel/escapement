import logging
from pydantic import BaseModel
from fastapi import APIRouter
from app.services.ticket_service import TicketSniperService

logger = logging.getLogger("defai.api.tickets")
router = APIRouter(prefix="/api/tickets", tags=["Ticket Sniper"])

class TicketSimulationRequest(BaseModel):
    event_name: str
    ticket_count: int = 2
    max_budget_paise: int = 300000  # ₹3,000

@router.post("/simulate")
def simulate_ticket_drop(body: TicketSimulationRequest):
    allowed, details = TicketSniperService.simulate_ticket_drop(
        event_name=body.event_name,
        ticket_count=body.ticket_count,
        max_budget_paise=body.max_budget_paise
    )
    return {
        "status": "AVAILABLE" if allowed else "BUDGET_EXCEEDED",
        "details": details,
        "is_executable": allowed
    }
