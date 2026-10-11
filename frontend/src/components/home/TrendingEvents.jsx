import { EventCard } from "../events/eventCard";
import { useEffect, useState } from "react";
import { getEvents } from "../../services/eventServices";

export function TrendingEvents() {

    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const fetchEvents = async () => {

            try {
                const data = await getEvents();
                

                setEvents(data.events);

            } catch (error) {

                console.error("Failed to fetch events:", error);

            } finally {

                setLoading(false);

            }
        };

        fetchEvents();

    }, []);


    return (
        <section className="bg-indigo-50/40 py-14">

            <div className="mx-auto max-w-6xl px-6">

                <div className="mb-6 flex items-end justify-between">

                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                            Hot right now
                        </p>

                        <h2 className="mt-1 text-2xl font-bold text-slate-900">
                            Trending Events
                        </h2>
                    </div>

                    <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                        View all →
                    </button>

                </div>


                {loading ? (

                    <p className="text-center text-slate-500">
                        Loading events...
                    </p>

                ) : (

                    <div className="grid grid-cols-4 gap-4">

                        {events.map((event) => (
                            <EventCard
                                key={event._id}
                                event={event}
                            />
                        ))}

                    </div>

                )}

            </div>

        </section>
    );
}