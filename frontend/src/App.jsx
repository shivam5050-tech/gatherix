import Navbar from "./components/layout/navbar"
import './index.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home/Home";
import { Footer } from "./components/layout/Footer";
import { Login } from "./pages/Login/Login";
import { Signup } from "./pages/Login/Signup";


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
          </Routes>
        </main>
        <Footer />
      </>
    </BrowserRouter>
  )
}

export default App
