import axios from 'axios';

/**
 * Axios instance configured once so every request hits the same backend URL.
 * Falls back to the typical Laravel Sail port if an env override is missing.
 */
const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json' },
});

export default http;

