import { Loader2 } from "lucide-react";
import { Navigate } from "react-router";
import { useAuth } from "~/lib/auth/auth-context";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-500">
        <Loader2 aria-hidden className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export function RedirectIfAuthenticated({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-500">
        <Loader2 aria-hidden className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
}
