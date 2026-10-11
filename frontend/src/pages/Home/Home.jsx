import { Hero } from "../../components/home/Hero";
import { Stats } from "../../components/home/Stats";
import { CategorySection } from "../../components/home/CategorySection";
import { TrendingEvents } from "../../components/home/TrendingEvents";
import { EventCard } from "../../components/events/eventCard";


export function Home() {
    return (
        <>
            <Hero />
            <Stats/>
            <CategorySection/>
            <TrendingEvents/>
            {/* <EventCard /> */}
        </>
    )
}