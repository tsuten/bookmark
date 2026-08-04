import { RequireAuth } from "~/components/RequireAuth";
import { AppLayout } from "~/components/layout/AppLayout";
import { BetaCautionDialog } from "~/components/layout/BetaCautionDialog";

export default function AuthenticatedLayout() {
  return (
    <RequireAuth>
      <AppLayout />
      <BetaCautionDialog />
    </RequireAuth>
  );
}
