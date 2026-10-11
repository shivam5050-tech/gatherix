import bg from '../../assets/bg.jpg'
import { Search, Tag, MapPin, CalendarDays } from "lucide-react";

export function Hero() {


    return (
        <div className='relative'>
            <img src={bg} alt="" className='h-screen w-screen object-cover' />
            <div className='absolute inset-0 bg-white/80'></div>
            <div className='absolute inset-0 top-20 flex flex-col items-center'>
                <h1 className="text-center text-5xl font-bold text-slate-900">
                    <span className='text-[#0F172A] text-7xl font-bold '>Discover Amazing Events</span><br />
                    <span className='text-6xl bg-gradient-to-r from-[#4F46E5] to-[#EC4899] bg-clip-text text-transparent '>Around You</span><br />
                    <span></span>
                </h1>
                <p className='mt-4 max-w-2xl text-center text-lg leading-relaxed text-slate-600'>
                    From underground concerts to global tech summits, find, book, and
                    experience unforgettable moments with ultra-fast digital ticketing.
                </p>

                {/* Search area  */}

                <div className="mt-20 w-full max-w-5xl rounded-2xl bg-white p-6 shadow-xl">
                    <div className="flex items-center gap-3">
                        {/* Looking for  */}
                        <div className='flex flex-1 items-center gap-2 bg-blue-50 rounded-lg p-2'>
                            <button className='text-blue-400'>
                                <Search size={20} />
                            </button>
                            <div>
                                <label htmlFor="search" className='font-medium text-slate-800'>Looking For</label>
                                <input
                                    id="search"
                                    type="text"
                                    placeholder="Search events, artists, or venues..."
                                    className="w-full bg-transparent text-slate-800 outline-none placeholder:text-slate-400 text-lg"
                                />
                            </div>
                        </div>

                        {/* Category */}
                        <div className="flex items-center gap-3 rounded-xl bg-blue-50 px-4 py-3">

                            <div className="text-blue-400">
                                <Tag size={22} />
                            </div>

                            <div>
                                <label
                                    htmlFor="category"
                                    className="block text-sm font-medium text-slate-500"
                                >
                                    Category
                                </label>

                                <select
                                    id="category"
                                    className="bg-transparent text-lg text-slate-800 outline-none"
                                >
                                    <option value="">All Events</option>
                                    <option value="music">Music</option>
                                    <option value="technology">Technology</option>
                                    <option value="sports">Sports</option>
                                    <option value="business">Business</option>
                                    <option value="workshops">Workshops</option>
                                    <option value="comedy">Comedy</option>
                                    <option value="food">Food & Drinks</option>
                                </select>
                            </div>

                        </div>

                        {/* Location */}
                        <div className="flex items-center gap-3 rounded-xl bg-blue-50 px-4 py-3">

                            <div className="text-blue-400">
                                <MapPin size={22} />
                            </div>

                            <div>
                                <label
                                    htmlFor="location"
                                    className="block text-sm font-medium text-slate-500"
                                >
                                    Location
                                </label>

                                <select
                                    id="location"
                                    className="text-lg text-slate-800 outline-none"
                                >
                                    <option value="">Anywhere</option>
                                    <option value="delhi">Delhi</option>
                                    <option value="mumbai">Mumbai</option>
                                    <option value="bangalore">Bangalore</option>
                                    <option value="hyderabad">Hyderabad</option>
                                    <option value="chandigarh">Chandigarh</option>
                                    <option value="pune">Pune</option>
                                </select>
                            </div>

                        </div>

                        {/* Date */}
                        <div className="flex items-center gap-3 rounded-xl bg-blue-50 px-4 py-3">

                            <div className="text-blue-400">
                                <CalendarDays size={22} />
                            </div>

                            <div>
                                <label
                                    htmlFor="date"
                                    className="block text-sm font-medium text-slate-500"
                                >
                                    Date
                                </label>

                                <input
                                    id="date"
                                    type="date"
                                    className="bg-transparent text-lg text-slate-800 outline-none"
                                />
                            </div>

                        </div>
                    </div>
                    <div className="my-5 border-t border-slate-100"></div>

                    <div className="flex items-center justify-between">

                        <p className="text-sm font-medium text-slate-600">
                            🛡 Buyer Protection with instant barcode pass
                        </p>

                        <button
                            type="button"
                            className="rounded-xl bg-gradient-to-r from-[#3727CF] to-[#A31C82] px-8 py-4 font-semibold text-white transition hover:opacity-90"
                        >
                            Explore Events
                        </button>

                    </div>
                    
                </div>
            </div>
        </div>
    )
}