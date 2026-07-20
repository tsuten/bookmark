export function validateHttpUrlString(value: unknown) {
  if (typeof value !== "string" || !value.trim()) {
    return { valid: false as const, errorCode: "required" as const };
  }
  try {
    const parsed = new URL(value.trim());
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return { valid: false as const, errorCode: "invalidHttpUrl" as const };
    }
    return { valid: true as const };
  } catch {
    return { valid: false as const, errorCode: "invalidHttpUrl" as const };
  }
}

export function bookmarkUrlErrorMessage(errorCode: string) {
  switch (errorCode) {
    case "required":
      return "Please enter a URL.";
    case "invalidHttpUrl":
      return "Please enter a valid http or https URL.";
    default:
      return "";
  }
}
