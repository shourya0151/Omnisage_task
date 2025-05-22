import { Calendar } from "@heroui/react";
import {
  today,
  getLocalTimeZone,
  isWeekend,
  getDayOfWeek,
} from "@internationalized/date";
import { useLocale } from "@react-aria/i18n";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Success from "../components/Success";

export default function Bookings() {
  let now = today(getLocalTimeZone());
  const [selectedDate, setSelectedDate] = useState(now);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [slotsAvailable, setSlotsAvailable] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  let { locale } = useLocale();
  // let isDateUnavailable = (date) => isWeekend(date, locale);
  const navigate = useNavigate();
  const { userId } = useParams(); // assuming route is /:userId
  const [availableWeekdays, setAvailableWeekdays] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(null);

  useEffect(() => {
    const fetchWeekdays = async () => {
      try {
        // 2. Then fetch available weekdays
        const res = await axios.get(
          `/api/bookings/available-weekdays?user_id=${userId}`
        );
        const weekdays = res.data.available_weekdays; //  extract from object
        setAvailableWeekdays(weekdays);
      } catch (err) {
        navigate("/"); // redirect if user is invalid or API fails
      }
    };

    fetchWeekdays();
  }, [userId, navigate]);

  // 3. Mark unavailable dates
  const isDateUnavailable = (date) => {
    if (!availableWeekdays) return false; // All days are available if not specified
    if (date.compare(now) < 0) return true;

    const weekdayIndex = getDayOfWeek(date, "en-US"); // 0 = Sunday, 6 = Saturday

    const weekdayMap = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const weekday = weekdayMap[weekdayIndex];
    return !availableWeekdays.includes(weekday); // Mark as unavailable if not in allowed list
  };

  // Fetch slots on initial render and when selectedDate changes
  useEffect(() => {
    if (!selectedDate) return;

    const fetchSlots = async () => {
      try {
        const response = await axios.get(
          `/api/bookings/available-slots?user_id=${userId}&date=${selectedDate}`
        );
        setSlotsAvailable(response.data["available_slots"]); // adjust based on your API response
        setError("");
        setSelectedSlot(null);
      } catch (err) {
        setError("Failed to fetch slots");
      }
    };

    fetchSlots();
  }, [selectedDate]);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClick = async () => {
    // Field validations
    if (!userId.trim()) {
      setFormError("User ID is required.");
      return;
    }
    if (!selectedDate?.year || !selectedDate?.month || !selectedDate?.day) {
      setFormError("Please select a valid date.");
      return;
    }
    if (!selectedSlot) {
      setFormError("Please select a time slot.");
      return;
    }
    if (!formData.fullName.trim()) {
      setFormError("Full name is required.");
      return;
    }
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      setFormError("Valid email is required.");
      return;
    }
    if (!formData.phone.trim() || !/^\d{10}$/.test(formData.phone)) {
      setFormError("Valid 10-digit phone number is required.");
      return;
    }

    // Clear previous errors and start loading
    setFormError("");
    setBookingSuccess(false);
    setLoading(true);

    const payload = {
      user_id: userId,
      date: `${selectedDate.year}-${String(selectedDate.month).padStart(
        2,
        "0"
      )}-${String(selectedDate.day).padStart(2, "0")}`, // format: "YYYY-MM-DD"
      time: selectedSlot, // format: "HH:mm"
      name: formData.fullName,
      email: formData.email,
      phone_number: formData.phone,
    };

    try {
      const response = await axios.post(
        "/api/bookings/book-appointment",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            accept: "application/json",
          },
        }
      );

      setBookingSuccess(true);
      // Optionally reset the form here
    } catch (error) {
      setBookingSuccess(false);
      setLoading(false);
      setFormError(
        error.response?.data?.detail ||
          "Something went wrong. Please try again."
      );
    }
  };

  const formatTo12Hour = (time24) => {
    const [hour, minute] = time24.split(":").map(Number);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;
    return `${hour12}:${minute.toString().padStart(2, "0")} ${ampm}`;
  };

  return (
    <>
      {bookingSuccess ? (
        <Success
          message={`You have scheduled the meet for ${selectedDate} at ${formatTo12Hour(
            selectedSlot
          )}.`}
        />
      ) : (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
          <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Left: Personal Details */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  Your Details
                </h2>
                <form className="space-y-4">
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Full Name"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Selected Date"
                    value={selectedDate}
                    readOnly
                    className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </form>
              </div>

              {/* Middle: Calendar */}
              <div className="flex justify-center">
                <Calendar
                  aria-label="Date (Unavailable)"
                  isDateUnavailable={isDateUnavailable}
                  calendarWidth={300}
                  classNames={{
                    base: "text-base",
                    grid: "gap-2",
                    gridHeaderRow: "flex mr-1 ",
                    gridHeaderCell: "text-lg font-semibold w-9 text-center",
                    cell: "h-9 w-9 cursor-pointer",
                    cellButton: "text-md cursor-pointer",
                    title: "text-xl font-bold mb-2",
                    pickerItem: "text-md",
                  }}
                  value={selectedDate}
                  onChange={setSelectedDate}
                />
              </div>

              {/* Right: Slots */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  Select a Time Slot
                </h2>
                <div className="h-64 overflow-y-auto pr-2">
                  <div className="grid grid-cols-2 gap-3">
                    {slotsAvailable.map((slot) => {
                      const formattedTime = new Date(
                        `1970-01-01T${slot}`
                      ).toLocaleTimeString([], {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      });

                      return (
                        <button
                          key={slot}
                          className={`cursor-pointer border border-blue-500 text-blue-600 font-medium 
        py-2 rounded-md hover:bg-blue-100 transition ${
          selectedSlot === slot ? "bg-blue-200" : ""
        }`}
                          onClick={() => setSelectedSlot(slot)}
                        >
                          {formattedTime}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
            {formError && <p className="text-red-500 mb-2">{formError}</p>}
            {bookingSuccess && (
              <p className="text-green-600 mb-2">Booking successful!</p>
            )}

            {/* Bottom: Book Button */}
            <div className="mt-8 flex justify-center">
              <button
                onClick={handleClick}
                className={`w-full py-3 text-white font-semibold rounded-lg transition ${
                  loading
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-500 cursor-pointer"
                }`}
                disabled={loading}
              >
                {loading ? "Booking..." : "Book Appointment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
