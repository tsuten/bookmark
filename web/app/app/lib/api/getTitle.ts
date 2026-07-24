import { apiFetch } from "./client";

export async function fetchPageTitle(
  token: string,
  url: string,
): Promise<string | null> {
  const params = new URLSearchParams({ url: url.trim() });
  const response = await apiFetch<{ title: string | null }>(
    `/get-title?${params}`,
    { token },
  );
  return response.title;
}
