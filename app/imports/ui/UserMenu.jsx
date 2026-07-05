import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { CircleUserRound, LogOut } from 'lucide-react';
import { DropdownMenu } from 'radix-ui';
import { logout } from '../api/auth/client/login';

export const UserMenu = () => {
  const navigate = useNavigate();
  const user = useTracker(() => Meteor.user());
  const email = user?.emails?.[0]?.address ?? '';

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('logout failed:', error);
    }
    navigate('/login', { replace: true });
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <CircleUserRound aria-hidden />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content sideOffset={4} align="end">
          <DropdownMenu.Label className="px-2 py-1.5 text-sm text-gray-500">
            {email || 'Signed-in user'}
          </DropdownMenu.Label>
          <DropdownMenu.Separator className="my-1 h-px bg-gray-300" />
          <DropdownMenu.Item
            onSelect={handleLogout}
            className="inline-flex w-full items-center gap-2"
          >
            <LogOut aria-hidden className="w-4 h-4" />
            Log out
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
