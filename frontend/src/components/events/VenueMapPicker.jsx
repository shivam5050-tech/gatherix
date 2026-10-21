import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const DEFAULT_CENTER = [20.5937, 78.9629];
const SEARCH_URL = "https://photon.komoot.io/api/";
const REVERSE_URL = "https://photon.komoot.io/reverse";

const markerIcon = L.divIcon({
  className: "gatherix-map-marker",
  html: "<span style=\"display:block;width:22px;height:22px;border:4px solid white;border-radius:50% 50% 50% 0;background:#6d28d9;box-shadow:0 2px 8px #334155;transform:rotate(-45deg)\"></span>",
  iconSize: [28, 28],
  iconAnchor: [14, 24],
});

function addressFromProperties(properties = {}) {
  const venue = properties.name && properties.name !== properties.street ? properties.name : "";
  const street = [properties.housenumber, properties.street].filter(Boolean).join(" ");
  const area = properties.district || properties.suburb || properties.county || "";
  const location = [venue || street, venue && street, area]
    .filter(Boolean)
    .join(", ");
  return {
    location: location || properties.name || properties.city || properties.state || "Selected map location",
    city: properties.city || properties.town || properties.village || properties.locality || properties.state || "",
  };
}

function MapClickHandler({ onPick }) {
  useMapEvents({ click: (event) => onPick(event.latlng.lat, event.latlng.lng) });
  return null;
}

function RecenterMap({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo(position, Math.max(map.getZoom(), 15), { duration: 0.5 });
  }, [map, position]);
  return null;
}

export function VenueMapPicker({ location, city, latitude, longitude, onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState("");
  const [searchError, setSearchError] = useState("");
  const [locating, setLocating] = useState(false);
  const [selectionMessage, setSelectionMessage] = useState("");
  const [mapPosition, setMapPosition] = useState(null);
  const reverseRequest = useRef(null);
  const position = useMemo(() => Number.isFinite(latitude) && Number.isFinite(longitude)
    ? [latitude, longitude]
    : null, [latitude, longitude]);
  const mapCenter = useMemo(() => position || mapPosition || DEFAULT_CENTER, [position, mapPosition]);

  useEffect(() => {
    const cleanQuery = query.trim();
    if (cleanQuery.length < 3) {
      setResults([]);
      setSearching(false);
      setSearchError("");
      setMessage(cleanQuery ? "Enter at least 3 characters to search." : "");
      return undefined;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setSearching(true);
      setSearchError("");
      setMessage("");
      try {
        const params = new URLSearchParams({ q: cleanQuery, limit: "5", lang: "en" });
        const response = await fetch(`${SEARCH_URL}?${params}`, { signal: controller.signal });
        if (!response.ok) throw new Error("search unavailable");
        const data = await response.json();
        const features = Array.isArray(data.features) ? data.features : [];
        setResults(features);
        setMessage(features.length ? "Choose a result to place the venue pin." : "No matching places found. Try a nearby address or click the map.");
      } catch (error) {
        if (error.name !== "AbortError") {
          setResults([]);
          setSearchError("Venue search is temporarily unavailable. You can still click the map or enter the address manually.");
        }
      } finally {
        if (!controller.signal.aborted) setSearching(false);
      }
    }, 500);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  async function selectCoordinates(lat, lon) {
    if (!Number.isFinite(lat) || lat < -90 || lat > 90 || !Number.isFinite(lon) || lon < -180 || lon > 180) return;
    reverseRequest.current?.abort();
    const controller = new AbortController();
    reverseRequest.current = controller;
    setMapPosition([lat, lon]);
    setSelectionMessage("Looking up the selected address...");
    setSearchError("");
    onSelect({ location: location || "", city: city || "", latitude: lat, longitude: lon });
    let details = { location: location || "", city: city || "" };
    try {
      const params = new URLSearchParams({ lat: String(lat), lon: String(lon), lang: "en" });
      const response = await fetch(`${REVERSE_URL}?${params}`, { signal: controller.signal });
      if (!response.ok) throw new Error("reverse lookup unavailable");
      const data = await response.json();
      if (controller.signal.aborted) return;
      if (data.features?.[0]?.properties) details = addressFromProperties(data.features[0].properties);
      setSelectionMessage("Pin selected. Check the venue and city fields before saving.");
    } catch {
      if (controller.signal.aborted) return;
      setSelectionMessage("Pin selected. Address lookup failed; enter the venue and city in the fields above.");
    }
    onSelect({ ...details, latitude: lat, longitude: lon });
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setSelectionMessage("Location is unavailable in this browser. Search or click the map instead.");
      return;
    }
    setLocating(true);
    setSelectionMessage("Requesting your location. This will only set a starting pin; confirm the actual venue on the map.");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocating(false);
        selectCoordinates(coords.latitude, coords.longitude);
      },
      (error) => {
        setLocating(false);
        setSelectionMessage(error.code === error.PERMISSION_DENIED
          ? "Location permission was denied. Search for the venue or click the map instead."
          : error.code === error.TIMEOUT
            ? "Location request timed out. Try again or search/click the map instead."
            : "Your location is unavailable. Search for the venue or click the map instead.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }

  function selectSearchResult(feature) {
    const coordinates = feature?.geometry?.coordinates;
    if (!Array.isArray(coordinates) || coordinates.length < 2
        || !Number.isFinite(coordinates[0]) || !Number.isFinite(coordinates[1])
        || Math.abs(coordinates[0]) > 180 || Math.abs(coordinates[1]) > 90) return;
    reverseRequest.current?.abort();
    const [lon, lat] = coordinates;
    const details = addressFromProperties(feature.properties);
    setQuery("");
    setResults([]);
    setMapPosition([lat, lon]);
    setSelectionMessage("Venue selected. Adjust the pin or edit the address fields before saving.");
    onSelect({ ...details, latitude: lat, longitude: lon });
  }

  return (
    <section className="rounded-2xl border border-indigo-100 bg-[#faf9ff] p-4 sm:p-5" aria-labelledby="venue-map-heading">
      <div className="mb-4">
        <h2 className="mb-1 text-lg font-extrabold" id="venue-map-heading">Select Venue on Map</h2>
        <p className="mb-0 text-sm text-slate-600">Search for a venue or address, use the map, or set a starting point from your current location. You can move the pin to the actual venue.</p>
      </div>
      <div className="mb-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
        <label className="text-sm font-semibold text-slate-700">Search venue or address
          <input autoComplete="off" className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 font-normal outline-none focus:border-brand-primary" onChange={(event) => setQuery(event.target.value)} placeholder="Venue, street, or city" value={query} />
        </label>
        <button className="self-end rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:bg-violet-50 disabled:opacity-60" disabled={locating} onClick={useCurrentLocation} type="button">{locating ? "Finding location..." : "Use My Current Location"}</button>
      </div>
      {searching && <p className="mb-2 text-sm text-slate-600" role="status">Searching places...</p>}
      {message && <p className="mb-2 text-sm text-slate-600" role="status">{message}</p>}
      {searchError && <p className="mb-2 text-sm text-rose-700" role="alert">{searchError}</p>}
      {results.length > 0 && <ul className="mb-3 max-h-52 overflow-y-auto rounded-xl border border-slate-200 bg-white" aria-label="Venue search results">
        {results.map((feature, index) => {
          const details = addressFromProperties(feature.properties);
          const [lon, lat] = feature.geometry.coordinates;
          return <li key={`${feature.properties.osm_type || "place"}-${feature.properties.osm_id || index}-${lat}-${lon}`}>
            <button className="w-full border-b border-slate-100 px-4 py-3 text-left text-sm last:border-0 hover:bg-violet-50" onClick={() => selectSearchResult(feature)} type="button"><span className="block font-bold text-slate-800">{details.location}</span><span className="block text-xs text-slate-500">{[details.city, feature.properties.country].filter(Boolean).join(", ")}</span></button>
          </li>;
        })}
      </ul>}
      <div className="h-72 overflow-hidden rounded-xl border border-slate-200 sm:h-80" aria-label="Venue map">
        <MapContainer center={mapCenter} zoom={position ? 15 : 5} scrollWheelZoom className="h-full w-full">
          <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapClickHandler onPick={selectCoordinates} />
          <RecenterMap position={position || mapPosition} />
          {position && <Marker draggable icon={markerIcon} eventHandlers={{ dragend: (event) => {
            const markerPosition = event.target.getLatLng();
            selectCoordinates(markerPosition.lat, markerPosition.lng);
          } }} position={position} />}
        </MapContainer>
      </div>
      <p className="mb-0 mt-2 text-xs leading-5 text-slate-500">Map data &copy; OpenStreetMap contributors. Search uses Photon, an OpenStreetMap-based public service; requests are debounced and limited to five results.</p>
      {position && <p className="mb-0 mt-2 text-xs text-slate-600">Selected coordinates: {position[0].toFixed(6)}, {position[1].toFixed(6)}</p>}
      {selectionMessage && <p className="mb-0 mt-2 text-sm text-violet-800" role="status">{selectionMessage}</p>}
    </section>
  );
}
