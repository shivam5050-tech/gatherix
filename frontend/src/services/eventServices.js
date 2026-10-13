import axios from "axios";
import { authenticatedFetch } from "./api";

const API_URL = "http://localhost:5000/events";

export const getEvents = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

export const getEventById = async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
};

export const createEvent = async (eventData) => {
    const response = await authenticatedFetch("/events", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Could not create the event.");
    }

    return data.event;
};

async function authenticatedEventRequest(path, options = {}) {
    const response = await authenticatedFetch(path, options);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Could not complete the event request.");
    }

    return data;
}

export const getMyEvents = async () => {
    const data = await authenticatedEventRequest("/events/mine");
    return data.events;
};

export const updateEvent = async (id, eventData) => {
    const data = await authenticatedEventRequest(`/events/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
    });

    return data.event;
};

export const deleteEvent = async (id) => {
    await authenticatedEventRequest(`/events/${id}`, {
        method: "DELETE",
    });
};
