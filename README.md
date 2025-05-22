#  Appointment Booking System


Appointment Booking System
This web application allows users to create, view, and manage appointments efficiently. It features a simple three-page interface along with a robust backend API to handle appointment creation, availability lookup, and booking functionality.

## Tech Stack
1. Frontend: React.js
2. Backend: FastAPI (Python Framework)

### 1. Clone the Repository

## Pages Overview

### Page 1: Enter Appointment ID
Users can input an existing appointment_id to proceed with booking an appointment. This is the entry point for those who have received a booking link or are trying to manage an existing appointment.

1. Validates the ID.

2. Navigates users to available slot selection.

3. Ensures that only valid appointment links are used.

### Page 2: View Available Slots
Once a valid appointment ID is submitted, users are taken to the Available Slots page. This page retrieves data using the backend APIs to show:

1. Available dates (/api/bookings/available-weekdays)

2. Available time slots on a selected date (/api/bookings/available-slots)

3. Real-time updates based on current bookings

### Page 3: Create Appointment Link
This page is primarily for admins or users who want to share an appointment form with others.

1. Users can generate an appointment creation link using /api/bookings/create-appointment.

2. This creates a unique appointment session ID.

3. The ID can be shared with others so they can book appointments using the interface from Page 1.

##  Project Setup
```bash
git clone <your-repo-url>
cd <your-project-folder>
```
## Back-end setup 
```bash
cd api
```
### 1. Create a Virtual Environment
```bash
python -m venv venv
```

### 2. Activate the Virtual Environment
```bash
source venv\Scripts\activate
```
### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Setup .env file inside api directory
```bash
MONGO_URI = <YOUR_MONGODB_URI>
```
### 5. Run
```bash
uvicorn main:app --reload
```

## Front-end setup 
```bash
cd client
```
### 1. Install the dependencies
```bash
npm install
```
### 2. Run
```bash
npm run dev
```







