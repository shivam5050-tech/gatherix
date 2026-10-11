// import bg from '../../assets/bg.jpg'

// export function EventCard() {
//     return (
//         <div>
//             <div className='h-44'>
//                 <img src={bg} alt="" className='object-cover' />
//             </div>
//             <div>
//                 <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Tenetur provident vel vero iste nobis delectus obcaecati assumenda aperiam. Placeat nostrum optio odit, perferendis dolores quod maxime consequatur officiis fugiat quia?</p>
//             </div>
//         </div>
//     )
// }







export function EventCard({ event }) {
    return (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">

            <div className="relative h-44 ">
                <img
                    src={event.image}
                    alt={event.title}
                    className="h-full w-full object-cover"
                />

                <div className="absolute top-0 m-1 p-1 bg-white rounded-xl">
                    <p className="">
                        {new Date(event.date)
                            .toLocaleDateString("en-US", {
                                month: "short"
                            })
                            .toUpperCase()}
                    </p>
                    <p className="text-xl -mt-2 font-bold ">
                        {new Date(event.date).getDate()}
                    </p>

                </div>
            </div>

            <div className="p-4">

                <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-slate-900">
                    {event.title}
                </h3>

                <p className="mt-2 text-xs text-slate-500">
                    📍 {event.location}
                </p>

                <div className="mt-4 flex items-center justify-between">

                    <div>
                        <p className="text-[10px] text-slate-400">
                            Tickets
                        </p>

                        <p className="text-sm font-semibold text-slate-800">
                            From ₹{event.price}
                        </p>
                    </div>

                    <button className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700">
                        Book Now
                    </button>

                </div>

            </div>
        </div>
    );
}