import {
    Music,
    Laptop,
    BriefcaseBusiness,
    Palette,
    Trophy,
    Utensils,
    FlaskConical,
    Heart,
} from "lucide-react";
import { Link } from 'react-router-dom';

const categories = [
    {
        name: "Music",
        events: "420+ Events",
        icon: Music,
    },
    {
        name: "Technology",
        events: "156+ Events",
        icon: Laptop,
    },
    {
        name: "Business & Startup",
        events: "84+ Events",
        icon: BriefcaseBusiness,
    },
    {
        name: "Arts & Culture",
        events: "210+ Events",
        icon: Palette,
    },
    {
        name: "Sports & Fitness",
        events: "137+ Events",
        icon: Trophy,
    },
    {
        name: "Food & Wine",
        events: "80+ Events",
        icon: Utensils,
    },
    {
        name: "Workshops & Labs",
        events: "95+ Events",
        icon: FlaskConical,
    },
    {
        name: "Lifestyle",
        events: "107+ Events",
        icon: Heart,
    },
];

export function CategorySection() {
    return (
        <section className="my-20 mx-10">
            <div className=" flex items-end justify-between ">
                <div>
                    <p className="text-indigo-700 text-sm font-bold">Curated Ecosystem</p>
                    <h1 className="text-3xl font-bold">Browsw by Category</h1>
                </div>
                <div className="ext-sm font-medium text-indigo-600 hover:text-indigo-700">
                    <Link>  View all 24 categories →</Link>
                </div>

            </div>
            <div className="mt-5 grid grid-cols-4 w-full gap-3 ">
                {
                    categories.map((item) => {
                        const Icon = item.icon
                        return (
                            <div className="max-w-xs flex item-center bg-white shadow-xl p-2 ">
                                <div className="flex items-center justify-center mr-2 bg-blue-100 p-3 rounded-lg ">
                                    <Icon className="text-indigo-600 " />
                                </div>
                                <div className="">
                                    <h1 className="text-xl font-bold">{item.name}</h1>
                                    <p className="text-sm">{item.events}</p>
                                </div>
                            </div>
                        )
                    })
                }
            </div>
        </section>
    );
}