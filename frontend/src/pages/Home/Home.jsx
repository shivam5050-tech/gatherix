import { useEffect, useMemo, useState } from "react";
import { getEvents } from "../../services/eventServices";
import { CategorySection } from "../../components/home/CategorySection";
import { Features } from "../../components/home/Features";
import { Hero } from "../../components/home/Hero";
import { Newsletter } from "../../components/home/Newsletter";
import { OrganizerCTA } from "../../components/home/OrganizerCTA";
import { PopularEvents } from "../../components/home/PopularEvents";
import { Testimonials } from "../../components/home/Testimonials";
import { TrendingEvents } from "../../components/home/TrendingEvents";

function eventMatchesText(event, query) {
  if (!query.trim()) return true;
  const searchable = [event.title, event.description, event.category, event.location, event.city]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase();
  return searchable.includes(query.trim().toLocaleLowerCase());
}

function toLocalDateString(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("");
  const [date, setDate] = useState("");

  const loadEvents = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getEvents();
      setEvents(Array.isArray(response?.events) ? response.events : []);
    } catch (fetchError) {
      console.error("Failed to fetch events:", fetchError);
      setError("We couldn’t load events right now. Check your connection and try again.");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const cities = useMemo(
    () => [...new Set(events.map((event) => event.city).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
    [events]
  );
  const categories = useMemo(
    () => [...new Set(events.map((event) => event.category).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
    [events]
  );

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesCategory = !category || String(event.category || "").trim().toLocaleLowerCase() === category.trim().toLocaleLowerCase();
      const matchesCity = !city || String(event.city || "").trim().toLocaleLowerCase() === city.trim().toLocaleLowerCase();
      const matchesDate = !date || toLocalDateString(event.date) === date;
      return matchesCategory && matchesCity && matchesDate && eventMatchesText(event, query);
    });
  }, [events, query, category, city, date]);

  const resetFilters = () => {
    setQuery("");
    setCategory("");
    setCity("");
    setDate("");
  };

  return (
    <>
      <Hero
        query={query}
        onQueryChange={setQuery}
        category={category}
        onCategoryChange={setCategory}
        city={city}
        onCityChange={setCity}
        date={date}
        onDateChange={setDate}
        onClearFilters={resetFilters}
        categories={categories}
        cities={cities}
      />
      <CategorySection
        selectedCategory={category}
        onSelectCategory={setCategory}
      />
      <TrendingEvents
        events={filteredEvents}
        loading={loading}
        error={error}
        onRetry={loadEvents}
        onClearFilters={resetFilters}
      />
      <PopularEvents
        events={filteredEvents}
        city={city}
        loading={loading}
        error={error}
        onRetry={loadEvents}
      />
      <Features />
      <OrganizerCTA />
      <Testimonials />
      <Newsletter />
    </>
  );
}
