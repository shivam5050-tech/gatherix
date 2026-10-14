import Navbar from "./components/layout/Navbar"
import './index.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home/Home";
import { Footer } from "./components/layout/Footer";
import { Login } from "./pages/Login/Login";
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


function App() {

  return (
    <BrowserRouter>
      <>
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/my-bookings" element={<MyBookings />} />
            <Route path="/organizer/create" element={<CreateEvent />} />
            <Route path="/organizer/events/:eventId/bookings" element={<EventBookings />} />
            <Route path="/organizer" element={<OrganizerDashboard />} />
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
