import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export const SidebarDrawer = ({ open, onClose, children }) => {
  const closeButtonRef = useRef(null);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="sidebar-drawer" role="presentation">
      <button
        type="button"
        className="sidebar-drawer-backdrop"
        aria-label="Close navigation menu"
        onClick={onClose}
      />
      <aside
        className="sidebar-drawer-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
      >
        <div className="sidebar-drawer-header">
          <span className="text-sm font-medium text-gray-700">Menu</span>
          <button
            ref={closeButtonRef}
            type="button"
            className="rounded-sm p-1 text-gray-500 hover:bg-gray-200"
            aria-label="Close navigation menu"
            onClick={onClose}
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>
        <div className="sidebar-drawer-body min-h-0 flex-1 overflow-y-auto">
          {children}
        </div>
      </aside>
    </div>
  );
};
