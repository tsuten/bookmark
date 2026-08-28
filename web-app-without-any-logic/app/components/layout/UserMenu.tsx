import { Link } from "react-router";
import { CircleUserRound, LogOut } from "lucide-react";
import { DropdownMenu } from "radix-ui";
import { MOCK_USER } from "~/data/mockBookmarks";

export function UserMenu() {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger aria-label="User menu">
        <CircleUserRound aria-hidden />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content sideOffset={4} align="end">
          <DropdownMenu.Label className="px-2 py-1.5 text-sm text-gray-500">
            {MOCK_USER.email}
          </DropdownMenu.Label>
          <DropdownMenu.Separator className="my-1 h-px bg-gray-300" />
          <DropdownMenu.Item asChild className="inline-flex w-full items-center gap-2">
            <Link to="/login">
              <LogOut aria-hidden className="h-4 w-4" />
              Log out
            </Link>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
