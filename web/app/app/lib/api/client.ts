import type { ApiErrorResponse } from "./types";

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function getApiUrl(): string {
  const url = import.meta.env.VITE_API_URL;
  if (!url) {
    throw new ApiError(
      "api-not-configured",
      "VITE_API_URL is not configured.",
      0,
    );
  }
  return url.replace(/\/$/, "");
}

type ApiFetchOptions = {
  token: string;
  method?: string;
  body?: unknown;
};

export async function apiFetch<T>(
  path: string,
  { token, method = "GET", body }: ApiFetchOptions,
): Promise<T> {
  const response = await fetch(`${getApiUrl()}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const data = (await response.json().catch(() => null)) as
    | T
    | ApiErrorResponse
    | null;

  if (!response.ok) {
    const error = data as ApiErrorResponse | null;
    throw new ApiError(
      error?.error ?? "unknown-error",
      error?.message ?? "Request failed.",
      response.status,
    );
  }

  return data as T;
}
