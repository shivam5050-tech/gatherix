import { useState } from "react";
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";

function Navbar() {
    const navigate = useNavigate();

    return (
        <nav className="border-slate-200 bg-white">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

                <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-lg font-bold text-white">
                        G
                    </div>

                    <span className="text-xl font-bold text-slate-900">
                        Gatherix
                    </span>
                </div>

                <div className="flex gap-4">
                    <Link
                        to="/"
                        className="font-medium text-slate-700 hover:text-indigo-600"
                    >
                        Home
                    </Link>
                    <Link
                        to="/explore"
                        className="font-medium text-slate-700 hover:text-indigo-600"
                    >
                        Explore Evenmts
                    </Link>
                    <Link
                        to="/about"
                        className="font-medium text-slate-700 hover:text-indigo-600"
                    >
                        About
                    </Link>
                    <Link
                        to="/contact"
                        className="font-medium text-slate-700 hover:text-indigo-600"
                    >
                        Contact
                    </Link>
                </div>

                <div className="flex gap-4">
                    <button className="bg-indigo-600 p-2 rounded-lg text-white" onClick={() => navigate('/login')}>
                        Login
                    </button>
                    <button className="bg-indigo-600 p-2 rounded-lg text-white" onClick={() => navigate('/signup')}>
                        Sign up
                    </button>
                </div>

            </div>
        </nav>
    );
}

export default Navbar;