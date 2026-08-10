import axios from "axios";
import { auth } from "../firebase";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
});

// Attach the current Firebase ID token to every outgoing request so the
// backend can verify identity + role (see backend/app/core/security.py).
client.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Surface backend error details in a consistent shape for UI toasts.
client.interceptors.response.use(
  (response) => response,
  (error) => {
    const detail =
      error?.response?.data?.detail || error?.message || "Something went wrong. Please try again.";
    return Promise.reject(new Error(detail));
  }
);

export default client;
