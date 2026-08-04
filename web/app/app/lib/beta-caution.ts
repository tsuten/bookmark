const STORAGE_KEY = "is_beta_caution_accepted";

export function isBetaCautionAccepted(): boolean {
  try {
    if (typeof window === "undefined" || !window.localStorage) return false;
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function acceptBetaCaution(): void {
  try {
    localStorage.setItem(STORAGE_KEY, "true");
  } catch {
    // private mode, quota, etc.
  }
}
