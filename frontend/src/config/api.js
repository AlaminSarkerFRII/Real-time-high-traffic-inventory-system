import axios from "axios";

// Get backend URL from environment variable
// In development: http://localhost:4000
// In production: Set via Vercel environment variables (e.g., https://your-app.railway.app)
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

// Create axios instance with base URL
const api = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
export { BACKEND_URL };
