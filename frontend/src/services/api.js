
const API_URL = "http://localhost:5000";

export async function authenticatedFetch(path, options = {}) {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
            ...options.headers,
            ...(token
                ? { Authorization: `Bearer ${token}` }
                : {})
        }
    });

    return response;
}
