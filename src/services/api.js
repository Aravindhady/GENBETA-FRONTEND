import { BACKEND_ORIGIN } from "../config.js";

export const apiRequest = async (url, method = "GET", body, token) => {
  try {
    const base = BACKEND_ORIGIN || "";
    const res = await fetch(`${base}${url}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: body ? JSON.stringify(body) : null
    });

    const data = await res.json();

    if (!res.ok) {
      const error = new Error(data.message || "API Error");
      error.response = { data, status: res.status };
      throw error;
    }

    return data;
  } catch (error) {
    // If it's already our custom error, rethrow it
    if (error.response) {
      throw error;
    }
    // Otherwise, wrap network errors
    throw new Error(error.message || "Network error. Please check your connection.");
  }
};
