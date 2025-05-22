from fastapi import FastAPI
 # Import the single instance
from utils.constants import DB_NAME
from routes.index import api_router
from lib.database import db_instance
from fastapi.middleware.cors import CORSMiddleware



async def lifespan(app: FastAPI):
    app.db = db_instance.client[DB_NAME]# Assign the DB class instance to FastAPI
    yield  # Keeps the connection alive
    db_instance.close()  # Closes the connection when shutting down


app = FastAPI(lifespan=lifespan)

origins = [
    "http://localhost:5173",  # Adjust the port if your frontend runs on a different one
    "http://127.0.0.1:5173",
    "https://appointment-scheduling-1-4h4e.onrender.com"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins from the list
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

app.include_router(api_router)

@app.get("/")
def root():
    return {"message": "hello World"}