export function PopularEvents() {
    const events = [
        {
            id: 1,
            title: "Indie & Underground",
            location: "San Francisco",
            date: "Nov 18",
            price: "From $25",
            image:
                "https://images.unsplash.com/photo-1506157786151-b8491531f063",
        },
        {
            id: 2,
            title: "Blue Note Lounge Sessions",
            location: "Los Angeles",
            date: "Nov 20",
            price: "From $30",
            image:
                "https://images.unsplash.com/photo-1516280440614-37939bbacd81",
        },
        {
            id: 3,
            title: "Skyline Rooftop Vinyl",
            location: "New York",
            date: "Nov 22",
            price: "From $20",
            image:
                "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f",
        },
    ];

    return (
        <section className="bg-slate-50 py-14">

            <div className="mx-auto max-w-6xl px-6">

                {/* Heading */}
                <div className="mb-6 flex items-end justify-between">

                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                            Hyper-local discovery
                        </p>

                        <h2 className="mt-1 text-2xl font-bold text-slate-900">
                            Popular Near You
                        </h2>
                    </div>

                    {/* Filters */}
                    <div className="flex items-center gap-2">
                        <button className="rounded-full bg-indigo-600 px-4 py-2 text-xs font-medium text-white">
                            Tonight
                        </button>

                        <button className="rounded-full bg-white px-4 py-2 text-xs font-medium text-slate-500 border border-slate-200">
                            This Weekend
                        </button>

                        <button className="rounded-full bg-white px-4 py-2 text-xs font-medium text-slate-500 border border-slate-200">
                            Under $50
                        </button>

                        <button className="rounded-full bg-white px-4 py-2 text-xs font-medium text-slate-500 border border-slate-200">
                            Outdoor & Festivals
                        </button>
                    </div>

                </div>

                {/* Event Cards */}
                <div className="grid grid-cols-3 gap-4">

                    {events.map((event) => (

                        <div
                            key={event.id}
                            className="flex overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                        >

                            {/* Image */}
                            <div className="h-28 w-32 shrink-0">
                                <img
                                    src={event.image}
                                    alt={event.title}
                                    className="h-full w-full object-cover"
                                />
                            </div>

                            {/* Content */}
                            <div className="flex flex-1 flex-col justify-between p-3">

                                <div>
                                    <p className="text-[10px] font-medium text-indigo-600">
                                        {event.date}
                                    </p>

                                    <h3 className="mt-1 text-sm font-semibold text-slate-800">
                                        {event.title}
                                    </h3>

                                    <p className="mt-1 text-[11px] text-slate-400">
                                        📍 {event.location}
                                    </p>
                                </div>

                                <div className="mt-2 flex items-center justify-between">

                                    <span className="text-xs font-semibold text-slate-800">
                                        {event.price}
                                    </span>

                                    <button className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700">
                                        Get Ticket →
                                    </button>

                                </div>

                            </div>

                        </div>

                    ))}

                </div>

            </div>

        </section>
    );
}