import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { configureFirebase, getFirebaseAuth, isFirebaseConfigured } from "./firebase";
import type { FirebasePublicConfig } from "~/lib/env/firebase-config";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
  firebaseConfig,
}: {
  children: ReactNode;
  firebaseConfig: FirebasePublicConfig | null;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    configureFirebase(firebaseConfig);

    if (!isFirebaseConfigured()) {
      setUser(null);
      setLoading(false);
      return;
    }

    const auth = getFirebaseAuth();
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });

    return unsubscribe;
  }, [firebaseConfig]);

  const signOut = useCallback(async () => {
    if (!isFirebaseConfigured()) {
      return;
    }

    await firebaseSignOut(getFirebaseAuth());
  }, []);

  const getIdToken = useCallback(async () => {
    if (!user) {
      return null;
    }

    return user.getIdToken();
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      loading,
      signOut,
      getIdToken,
    }),
    [user, loading, signOut, getIdToken],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
