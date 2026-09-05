export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export function getToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("contextiq_token") || "";
}

export function setToken(token: string) {
  localStorage.setItem("contextiq_token", token);
}

export function clearToken() {
  localStorage.removeItem("contextiq_token");
}

function getErrorMessage(data: any, status: number): string {
  const fallback = `Request failed (${status})`;

  if (!data) {
    return fallback;
  }

  // FastAPI detail as a normal string
  if (typeof data.detail === "string") {
    return data.detail;
  }

  // FastAPI validation errors
  if (Array.isArray(data.detail)) {
    return data.detail
      .map((item: any) => {
        if (typeof item === "string") return item;

        if (item?.msg) {
          const location = Array.isArray(item.loc)
            ? item.loc.join(" → ")
            : "";

          return location
            ? `${location}: ${item.msg}`
            : item.msg;
        }

        return JSON.stringify(item);
      })
      .join(" ");
  }

  // detail returned as an object
  if (data.detail && typeof data.detail === "object") {
    if (data.detail.message) {
      return String(data.detail.message);
    }

    if (data.detail.error) {
      return String(data.detail.error);
    }

    return JSON.stringify(data.detail);
  }

  // Generic API message
  if (typeof data.message === "string") {
    return data.message;
  }

  if (typeof data.error === "string") {
    return data.error;
  }

  if (typeof data === "string") {
    return data;
  }

  return fallback;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers);

  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const token = getToken();

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    cache: "no-store",
  });

  if (!res.ok) {
    let data: any = null;

    try {
      const text = await res.text();

      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          data = text;
        }
      }
    } catch {
      data = null;
    }

    const message = getErrorMessage(data, res.status);

    if (
      res.status === 401 &&
      typeof window !== "undefined"
    ) {
      clearToken();
    }

    throw new Error(message);
  }

  // Handle empty responses safely
  const text = await res.text();

  if (!text) {
    return undefined as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return text as T;
  }
}

export async function apiBlob(path: string) {
  const token = getToken();

  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {},
  });

  if (!res.ok) {
    let message = "Download failed.";

    try {
      const data = await res.json();
      message = getErrorMessage(data, res.status);
    } catch {
      // Keep fallback message
    }

    throw new Error(message);
  }

  return res.blob();
}