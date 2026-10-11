export function Footer() {
    return (
        <footer className="bg-blue-50 ">

            <div className="mx-auto max-w-7xl px-6 py-14">

                <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">

                    <div className="lg:col-span-2">

                        <div className="flex items-center gap-2 text-indigo-600">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-[#3727CF] to-[#A31C82] text-xl font-bold">
                                G
                            </div>

                            <span className="text-2xl font-bold">
                                Gatherix
                            </span>
                            
                        </div>

                        <p className="mt-4 max-w-sm text-sm leading-6 text-slate-400">
                            Discover amazing events, book your tickets, and
                            experience unforgettable moments with Gatherix.
                        </p>

                        <div className="mt-6 flex gap-3">

                            <a
                                href="#"
                                className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-sm text-slate-400 transition hover:bg-white/10 hover:text-white"
                            >
                                f
                            </a>

                            <a
                                href="#"
                                className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-sm text-slate-400 transition hover:bg-white/10 hover:text-white"
                            >
                                X
                            </a>

                            <a
                                href="#"
                                className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-sm text-slate-400 transition hover:bg-white/10 hover:text-white"
                            >
                                in
                            </a>

                            <a
                                href="#"
                                className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-sm text-slate-400 transition hover:bg-white/10 hover:text-white"
                            >
                                ◎
                            </a>

                        </div>

                    </div>

                    {/* Explore */}
                    <div>
                        <h3 className="text-sm font-semibold">
                            Explore
                        </h3>

                        <ul className="mt-4 space-y-3 text-sm text-slate-400">

                            <li>
                                <a href="#" className="transition hover:text-black">
                                    Discover Events
                                </a>
                            </li>

                            <li>
                                <a href="#" className="transition hover:text-black">
                                    Categories
                                </a>
                            </li>

                            <li>
                                <a href="#" className="transition hover:text-black">
                                    Trending Events
                                </a>
                            </li>

                            <li>
                                <a href="#" className="transition hover:text-black">
                                    Popular Near You
                                </a>
                            </li>

                        </ul>
                    </div>

                    {/* For Organizers */}
                    <div>
                        <h3 className="text-sm font-semibold">
                            For Organizers
                        </h3>

                        <ul className="mt-4 space-y-3 text-sm text-slate-400">

                            <li>
                                <a href="#" className="transition hover:text-black">
                                    Create an Event
                                </a>
                            </li>

                            <li>
                                <a href="#" className="transition hover:text-black">
                                    Organizer Dashboard
                                </a>
                            </li>

                            <li>
                                <a href="#" className="transition hover:text-black">
                                    Pricing
                                </a>
                            </li>

                            <li>
                                <a href="#" className="transition hover:text-black">
                                    Resources
                                </a>
                            </li>

                        </ul>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold">
                            Company
                        </h3>

                        <ul className="mt-4 space-y-3 text-sm text-slate-400">

                            <li>
                                <a href="#" className="transition hover:text-black">
                                    About Gatherix
                                </a>
                            </li>

                            <li>
                                <a href="#" className="transition hover:text-black">
                                    Contact Us
                                </a>
                            </li>

                            <li>
                                <a href="#" className="transition hover:text-black">
                                    Help Center
                                </a>
                            </li>

                            <li>
                                <a href="#" className="transition hover:text-black">
                                    Careers
                                </a>
                            </li>

                        </ul>
                    </div>

                </div>

            </div>

            <div className="border-t border-white/10">

                <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-5 text-sm text-black-500 md:flex-row md:items-center md:justify-between">

                    <p>
                        © 2026 Gatherix. All rights reserved.
                    </p>

                    <div className="flex gap-6">

                        <a href="#" className="transition hover:text-white">
                            Privacy Policy
                        </a>

                        <a href="#" className="transition hover:text-white">
                            Terms of Service
                        </a>

                        <a href="#" className="transition hover:text-white">
                            Cookie Policy2
                        </a>

                    </div>

                </div>

            </div>

        </footer>
    )
}
