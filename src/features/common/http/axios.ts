import { ACCESS_TOKEN_KEY } from "@/features/auth/constants/credentials";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const GuestHttp = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const AuthenticatedHttp = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const getToken = () => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);

  if (!token) {
    return null;
  }

  try {
    jwtDecode(token);
  } catch (e) {
    return null;
  }

  return token;
};

AuthenticatedHttp.interceptors.request.use(async (config) => {
  const token = await getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export { AuthenticatedHttp, GuestHttp };
