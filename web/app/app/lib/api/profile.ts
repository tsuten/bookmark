import { apiFetch } from "./client";

type Profile = {
  userId: string;
  displayName: string;
  createdAt: string;
  updatedAt: string;
};

export async function ensureProfile(
  token: string,
  body: { displayName?: string } = {},
): Promise<Profile> {
  return apiFetch<Profile>("/profile", {
    token,
    method: "POST",
    body,
  });
}
