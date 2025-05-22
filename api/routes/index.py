from fastapi import APIRouter
from routes.bookings import router as bookings

api_router = APIRouter()

# Include routers with prefixes
api_router.include_router(bookings, prefix="/api", tags=["bookings"])

