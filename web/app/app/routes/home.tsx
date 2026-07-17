import { useNavigate } from "react-router";
import { useState } from "react";
import { useAuth } from "~/lib/auth/auth-context";

export default function HomePage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const email = user?.email ?? "Signed-in user";

  const handleLogout = async () => {
    setSubmitting(true);
    try {
      await signOut();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("logout failed:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-md bg-white p-8 shadow">
        <h1 className="mb-2 text-xl font-semibold text-gray-900">Bookmark</h1>
        <p className="mb-6 text-sm text-gray-600">Signed in as {email}</p>
        <button
          type="button"
          onClick={handleLogout}
          disabled={submitting}
          className="rounded-sm bg-blue-500 px-3 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
        >
          {submitting ? "Logging out..." : "Log out"}
        </button>
      </div>
    </div>
  );
}
