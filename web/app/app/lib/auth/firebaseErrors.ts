const MESSAGES: Record<string, string> = {
  "auth/invalid-credential": "The email address or password is incorrect.",
  "auth/user-not-found": "The email address or password is incorrect.",
  "auth/wrong-password": "The email address or password is incorrect.",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/email-already-in-use": "This email address is already registered.",
  "auth/weak-password": "Please enter a password with at least 6 characters.",
  "auth/missing-password": "Please enter a password.",
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
