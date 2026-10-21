import Navbar from "./components/layout/Navbar"
import './index.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home/Home";
import { Footer } from "./components/layout/Footer";
import { Login } from "./pages/Login/Login";
import { ForgotPassword } from "./pages/Login/ForgotPassword";
import { Signup } from "./pages/Login/Signup";
import { EventDetails } from "./pages/Events/EventDetails";
import { ExploreEvents } from "./pages/Events/ExploreEvents";
import { BookingPage } from "./pages/Events/BookingPage";
import { Profile } from "./pages/Profile";
import { MyBookings } from "./pages/MyBookings";
import { OrganizerDashboard } from "./pages/Organizer/OrganizerDashboard";
import { CreateEvent } from "./pages/Organizer/CreateEvent";
import { EventBookings } from "./pages/Organizer/EventBookings";
import { About } from "./pages/About";
import { AdminRoute } from "./pages/Admin/AdminRoute";
import { AdminDashboard } from "./pages/Admin/AdminDashboard";
import { AdminUsers } from "./pages/Admin/AdminUsers";
import { AdminEvents } from "./pages/Admin/AdminEvents";
import { AdminBookings } from "./pages/Admin/AdminBookings";
import { TicketVerify } from "./pages/TicketVerify";


function App() {

  return (
    <BrowserRouter>
      <>
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/my-bookings" element={<MyBookings />} />
            <Route path="/tickets/verify" element={<TicketVerify />} />
            <Route path="/organizer/create" element={<CreateEvent />} />
            <Route path="/organizer/events/:eventId/bookings" element={<EventBookings />} />
            <Route path="/organizer" element={<OrganizerDashboard />} />
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
            <Route path="/admin/events" element={<AdminRoute><AdminEvents /></AdminRoute>} />
            <Route path="/admin/bookings" element={<AdminRoute><AdminBookings /></AdminRoute>} />
            <Route path="/explore" element={<ExploreEvents />} />
            <Route path="/about" element={<About />} />
            <Route path="/events/:id/book" element={<BookingPage />} />
            <Route path="/events/:id" element={<EventDetails />} />
          </Routes>
        </main>
        <Footer />
      </>
    </BrowserRouter>
  )
}

export default App
