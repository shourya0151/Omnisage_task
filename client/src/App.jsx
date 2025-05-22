import { BrowserRouter, Routes, Route } from "react-router-dom";
import Bookings from "./pages/Bookings";
import CreateAppointments from "./pages/CreateAppointments";
import HomePage from "./pages/Home";
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/book-appointment/:userId" element={<Bookings />} />
        <Route path="/create-appointment" element={<CreateAppointments />} />
      </Routes>
    </BrowserRouter>
  );
}
