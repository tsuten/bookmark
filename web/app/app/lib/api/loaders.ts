import { redirect } from "react-router";
import { getFirebaseAuth, isFirebaseConfigured } from "~/lib/auth/firebase";

export async function getAuthToken(): Promise<string> {
  if (!isFirebaseConfigured()) {
    throw redirect("/login");
  }

  const auth = getFirebaseAuth();
  const user = auth.currentUser;
  if (!user) {
    throw redirect("/login");
  }

  return user.getIdToken();
}
