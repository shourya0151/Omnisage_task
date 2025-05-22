import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function HomePage() {
  const [userId, setUserId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // <-- Loading state
  const navigate = useNavigate();

  const handleProceed = async () => {
    if (!userId.trim()) {
      setError("User ID cannot be empty.");
      return;
    }

    setLoading(true);
    try {
      setError("");
      const res = await axios.get(
        `/api/bookings/available-weekdays?user_id=${userId}`
      );
      setLoading(false);
      navigate(`/book-appointment/${userId}`);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.detail);
      } else {
        setError("Something went wrong.");
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Enter User ID to Make an Appointment
        </h1>
        <form
          onSubmit={(e) => {
            e.preventDefault(); // prevent default page reload
            handleProceed(); // call your proceed function
          }}
        >
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Appointment ID"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
          <button
            type="submit"
            className={`w-full text-white font-semibold py-3 rounded-lg transition ${
              loading
                ? "cursor-not-allowed bg-blue-400"
                : "cursor-pointer bg-blue-600 hover:bg-blue-500"
            }`}
            disabled={loading}
          >
            {loading ? "Loading..." : "Proceed"}
          </button>
        </form>

        <p className="mt-4 text-sm text-gray-600 text-center">
          Want to schedule appointments?{" "}
          <span
            className="text-blue-600 font-medium cursor-pointer hover:underline"
            onClick={() => navigate("/create-appointment")}
          >
            Create Appointments
          </span>
        </p>
      </div>
    </div>
  );
}
