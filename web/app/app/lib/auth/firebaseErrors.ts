const MESSAGES: Record<string, string> = {
  "auth/popup-closed-by-user": "Sign-in was cancelled.",
  "auth/popup-blocked":
    "The sign-in popup was blocked. Please check your browser settings.",
  "auth/cancelled-popup-request":
    "Sign-in is already in progress. Please wait a moment.",
  "auth/account-exists-with-different-credential":
    "This email address is registered with a different sign-in method.",
  "auth/too-many-requests":
    "Too many attempts. Please wait a moment and try again.",
  "auth/network-request-failed": "A network error occurred.",
};

export function firebaseErrorMessage(error: unknown): string {
  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    typeof error.code === "string" &&
    MESSAGES[error.code]
  ) {
    return MESSAGES[error.code];
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}
