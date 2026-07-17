import { Outlet } from "react-router";
import { RequireAuth } from "~/components/RequireAuth";

export default function AuthenticatedLayout() {
  return (
    <RequireAuth>
      <Outlet />
    </RequireAuth>
  );
}
