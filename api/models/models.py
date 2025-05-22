from pydantic import BaseModel, Field
from typing import Dict

# TimeSlot model with is_available
class TimeSlot(BaseModel):
    is_available: bool
    start_time: str  # Format: "HH:MM"
    end_time: str    # Format: "HH:MM"

class UserCreateRequest(BaseModel):
    user_id: str
    availability: Dict[str, TimeSlot]  # e.g., "Monday": {..}
    slot_duration_minutes: int = Field(..., gt=0, description="Slot duration in minutes, e.g., 30")



# --- Request Schema ---
class AppointmentRequest(BaseModel):
    user_id: str
    date: str       # format: "YYYY-MM-DD"
    time: str       # format: "HH:MM"
    name: str
    email: str
    phone_number: str
