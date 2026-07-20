import { RequireAuth } from "~/components/RequireAuth";
import { AppLayout } from "~/components/layout/AppLayout";

export default function AuthenticatedLayout() {
  return (
    <RequireAuth>
      <AppLayout />
    </RequireAuth>
  );
}
