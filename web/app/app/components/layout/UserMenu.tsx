import { useNavigate } from "react-router";
import { CircleUserRound, LogOut } from "lucide-react";
import { DropdownMenu } from "radix-ui";
import { useAuth } from "~/lib/auth/auth-context";

export function UserMenu() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const email = user?.email ?? "";

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("logout failed:", error);
    }
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className="h-8 w-8 rounded-full">
        <CircleUserRound aria-hidden />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content sideOffset={4} align="end">
          <DropdownMenu.Label className="px-2 py-1.5 text-sm text-gray-500">
            {email || "Signed-in user"}
          </DropdownMenu.Label>
          <DropdownMenu.Separator className="my-1 h-px bg-gray-300" />
          <DropdownMenu.Item
            onSelect={handleLogout}
            className="inline-flex w-full items-center gap-2"
          >
            <LogOut aria-hidden className="h-4 w-4" />
            Log out
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
