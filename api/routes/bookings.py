from fastapi import APIRouter, HTTPException, Request, Query
from datetime import datetime, timedelta
from utils.constants import BOOKING_COLLECTION
from models.models import UserCreateRequest, AppointmentRequest



router = APIRouter(prefix="/bookings", tags=["bookings"])


@router.post("/create-appointment")
async def create_user(request:Request,user: UserCreateRequest):
    # Check if user already exists
    collection = request.app.db[BOOKING_COLLECTION]

    if collection.find_one({"user_id": user.user_id}):
        raise HTTPException(status_code=400, detail="User already exists")

    # Prepare document
    user_doc = {
        "user_id": user.user_id,
        "availability": {day: slot.model_dump() for day, slot in user.availability.items()},
        "appointments": [],
        "slot":user.slot_duration_minutes
    }

    # Insert into MongoDB
    collection.insert_one(user_doc)
    return {"message": "User created successfully", "user_id": user.user_id}

DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

def generate_time_slots(start_time: str, end_time: str, duration: int):
    fmt = "%H:%M"
    start = datetime.strptime(start_time, fmt)
    end = datetime.strptime(end_time, fmt)

    slots = []
    while start + timedelta(minutes=duration) <= end:
        slot_str = start.strftime(fmt)
        slots.append(slot_str)
        start += timedelta(minutes=duration)
    return slots

@router.get("/available-slots")
async def get_available_slots(request: Request,user_id: str = Query(...), date: str = Query(...)):  # e.g., 2025-05-22
    # Check if user already exists
    collection = request.app.db[BOOKING_COLLECTION]
    user = collection.find_one({"user_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    try:
        query_date = datetime.strptime(date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")

    weekday = query_date.strftime("%A")
    availability = user["availability"].get(weekday)

    if not availability or not availability["is_available"]:
        return {"available_slots": []}

    # Get booked times for this date
    booked = [
        appt["time"]
        for appt in user.get("appointments", [])
        if appt["date"] == date
    ]

    # Generate all time slots
    all_slots = generate_time_slots(
        availability["start_time"],
        availability["end_time"],
        user["slot"]
    )

    # Filter out booked ones
    available_slots = [slot for slot in all_slots if slot not in booked]

    return {"available_slots": available_slots}

@router.get("/available-weekdays")
def get_available_weekdays(request:Request,user_id: str = Query(...)):
    collection = request.app.db[BOOKING_COLLECTION]
    user = collection.find_one({"user_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="Appointment Id not found")

    availability = user.get("availability", {})

    available_days = [
        day for day, slot in availability.items()
        if slot.get("is_available", False)
    ]

    return {"available_weekdays": available_days}

# --- Booking Endpoint ---
@router.post("/book-appointment")
def book_appointment(request:Request,Apprequest: AppointmentRequest):
     # Check if user already exists
    collection = request.app.db[BOOKING_COLLECTION]

    user = collection.find_one({"user_id": Apprequest.user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Validate date format
    try:
        date_obj = datetime.strptime(Apprequest.date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")

    weekday = date_obj.strftime("%A")
    availability = user["availability"].get(weekday)

    # Check if the user is available on that day
    if not availability or not availability["is_available"]:
        raise HTTPException(status_code=400, detail="User not available on that day")

    # Check if the whole date is blocked
    if "unavailable_dates" in user and Apprequest.date in user["unavailable_dates"]:
        raise HTTPException(status_code=400, detail="User unavailable on this date")

    # Generate valid slots
    valid_slots = generate_time_slots(
        availability["start_time"],
        availability["end_time"],
        user["slot"]
    )

    # Check if requested time is valid
    if Apprequest.time not in valid_slots:
        raise HTTPException(status_code=400, detail="Invalid time slot")

    # Check if already booked
    existing = [
        appt for appt in user.get("appointments", [])
        if appt["date"] == Apprequest.date and appt["time"] == Apprequest.time
    ]
    if existing:
        raise HTTPException(status_code=409, detail="Time slot already booked")

    # Add appointment
    collection.update_one(
        {"user_id": Apprequest.user_id},
        {"$push": {"appointments": {"name":Apprequest.name,
                                    "email":Apprequest.email,
                                    "phone_number":Apprequest.phone_number,
                                    "date": Apprequest.date, 
                                    "time": Apprequest.time}}})

    return {"message": "Appointment booked successfully"}