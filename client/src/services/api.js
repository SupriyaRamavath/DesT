import axios from "axios";
import { API_BASE_URL, API_TIMEOUT } from "../utils/constants";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("decisiontrace_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API request failed:", error.response?.data?.message || error.message);
    return Promise.reject(error);
  }
);

export default api;
