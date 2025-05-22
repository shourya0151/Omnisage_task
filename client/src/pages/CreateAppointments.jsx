import React, { useState } from "react";
import SuccessMessage from "../components/Success";
import axios from "axios";

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function CreateAppointments() {
  const [userId, setUserId] = useState("");
  const [slotDuration, setSlotDuration] = useState("");
  const [loading, setLoading] = useState(false);
  const [appointmentSuccess, setAppointmentSuccess] = useState(false);
  const [error, setError] = useState("");
  const [availability, setAvailability] = useState(
    daysOfWeek.reduce(
      (acc, day) => ({
        ...acc,
        [day]: { available: false, startTime: "", endTime: "" },
      }),
      {}
    )
  );

  const handleDayChange = (day, field, value) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: field === "available" ? !prev[day].available : value,
      },
    }));
  };

  const handleSubmit = async () => {
    setAppointmentSuccess(false);
    setLoading(false);
    setError(null);
    // Basic field validations
    if (!userId.trim()) {
      setError("Appointment ID cannot be empty.");
      return;
    }

    if (!slotDuration || slotDuration <= 0) {
      setError("Slot duration must be a positive number.");
      return;
    }

    for (const [day, data] of Object.entries(availability)) {
      if (data.available && data.startTime >= data.endTime) {
        setError(`Start time must be earlier than end time for ${day}.`);
        return;
      }
    }

    setError(""); // Clear previous error

    const formatted = {
      user_id: userId,
      slot_duration_minutes: slotDuration,
      availability: Object.entries(availability).reduce((acc, [day, data]) => {
        acc[day] = {
          is_available: data.available,
          start_time: data.startTime,
          end_time: data.endTime,
        };
        return acc;
      }, {}),
    };
    setLoading(true);
    try {
      const response = await axios.post(
        "/api/bookings/create-appointment", // endpoint
        formatted,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setAppointmentSuccess(true);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.detail || "Failed to create appointment.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {appointmentSuccess ? (
        <SuccessMessage
          message={`Availability saved! Share your Appointment ID (${userId}) with others to let them book a slot.`}
        />
      ) : (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-10">
          <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-4xl">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
              Create Appointment Availability
            </h2>

            {/* User ID */}
            <div className="mb-6">
              <label className="block text-gray-700 text-lg font-medium mb-2">
                Enter Appointment Id
              </label>
              <input
                type="text"
                placeholder="Appointment Id"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Days Availability */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {daysOfWeek.map((day) => (
                <div
                  key={day}
                  className=" rounded-xl p-4 shadow-sm border border-gray-300"
                >
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold text-blue-700">
                      {day}
                    </h3>
                    <button
                      onClick={() => handleDayChange(day, "available")}
                      className={`px-3 py-1 rounded-full text-sm font-semibold transition ${
                        availability[day].available
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      {availability[day].available
                        ? "Available"
                        : "Unavailable"}
                    </button>
                  </div>

                  {availability[day].available && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-700 font-medium mb-1 block">
                          Start
                        </label>
                        <input
                          type="time"
                          value={availability[day].startTime}
                          onChange={(e) =>
                            handleDayChange(day, "startTime", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-700 font-medium mb-1 block">
                          End
                        </label>
                        <input
                          type="time"
                          value={availability[day].endTime}
                          onChange={(e) =>
                            handleDayChange(day, "endTime", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Slot Duration */}
            <div className="mb-6">
              <label className="block text-gray-700 text-lg font-medium mb-2">
                Slot Duration (in minutes)
              </label>
              <input
                type="number"
                placeholder="e.g., 30"
                value={slotDuration}
                onChange={(e) => setSlotDuration(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {error && <p className="text-red-500 mb-2">{error}</p>}

            {/* Save Button */}
            <button
              onClick={handleSubmit}
              className={`w-full py-3 text-white font-semibold rounded-lg transition ${
                loading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-500 cursor-pointer"
              }`}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Availability"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
