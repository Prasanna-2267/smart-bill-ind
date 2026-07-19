import { toast } from "sonner";

export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export function getAuthToken(): string | null {
  return localStorage.getItem("auth_token");
}

export function setAuthToken(token: string) {
  localStorage.setItem("auth_token", token);
}

export function clearAuthToken() {
  localStorage.removeItem("auth_token");
}

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage = `API Error: ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.error) errorMessage = errorData.error;
        if (errorData.message) errorMessage = errorData.message;
      } catch (e) {}
      
      if (response.status === 401 && endpoint !== "/auth/login") {
        clearAuthToken();
        window.location.href = "/login";
      } else {
        toast.error(errorMessage);
      }
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error: any) {
    if (error.message === 'Failed to fetch' || error.message.includes('fetch')) {
      toast.error('Network Error: Could not connect to server.');
    }
    throw error;
  }
}
