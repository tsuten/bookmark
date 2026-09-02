import { memo, useCallback, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router";
import { DragDropProvider } from "@dnd-kit/react";
import { isSortable, useSortable } from "@dnd-kit/react/sortable";
import {
  Archive,
  Bookmark,
  CircleUserRound,
  GripVertical,
  List,
  LogOut,
  Pin,
  Search,
  Settings,
  Tag,
} from "lucide-react";
import type { User } from "firebase/auth";
import type { ReactNode } from "react";
import { DropdownMenu } from "radix-ui";
import { InputWithIcon } from "~/components/molecules/InputWithIcon";
import { SettingsDialog } from "~/components/layout/SettingsDialog";
import { useSidebarLabels } from "~/lib/hooks/useSidebarLabels";
import { useAuth } from "~/lib/auth/auth-context";
import { useBookmarkItemsStore } from "~/stores/bookmarkItemsStore";
import logo from "~/assets/logo.svg";

function arrayMove<T>(items: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) {
    return items;
  }
  const next = items.slice();
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

function reorderPinnedLabels(
  pinned: string[],
  labels: string[],
  from: number,
  to: number,
): string[] {
  const labelSet = new Set(labels);
  const visible = pinned.filter((label) => labelSet.has(label));
  const hidden = pinned.filter((label) => !labelSet.has(label));
  return [...arrayMove(visible, from, to), ...hidden];
}

function filterLabels(labels: string[], query: string): string[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return labels;
  }

  return labels.filter((label) =>
    label.toLowerCase().includes(normalizedQuery),
  );
}

type SidebarItemProps = {
  to: string;
  label: string;
  icon: ReactNode;
  isActive: boolean;
};

function SidebarItem({ to, label, icon, isActive }: SidebarItemProps) {
  return (
    <Link to={to} className="block min-w-0">
      <li
        className={`m-1 flex min-w-0 flex-row items-center gap-2 rounded-md p-1 pl-3 hover:bg-bg-sub-hover ${isActive ? "bg-bg-sub-hover" : ""}`}
      >
        <span className="inline-flex shrink-0 items-center justify-center [&_svg]:size-4 [&_svg]:shrink-0">
          {icon}
        </span>
        <span className="min-w-0 flex-1 truncate">{label}</span>
      </li>
    </Link>
  );
}

function SidebarLabelRow({
  label,
  count,
  isPinned,
  preventNavigation,
  handleRef,
  showGripIcon,
  onTogglePin,
}: {
  label: string;
  count: number;
  isPinned: boolean;
  preventNavigation?: boolean;
  handleRef?: (element: Element | null) => void;
  showGripIcon?: boolean;
  onTogglePin: (label: string) => void;
}) {
  return (
    <>
      <Link
        to={`/tags/${encodeURIComponent(label)}`}
        className="sidebar-label-link"
        onClick={(event) => {
          if (preventNavigation) {
            event.preventDefault();
          }
        }}
      >
        <span
          ref={handleRef}
          className={`sidebar-label-icon ${showGripIcon ? "is-sortable" : ""}`}
          aria-hidden={showGripIcon ? undefined : true}
          aria-label={showGripIcon ? `Reorder ${label}` : undefined}
        >
          <Tag className="sidebar-label-icon-tag h-4 w-4" />
          {showGripIcon ? (
            <GripVertical className="sidebar-label-icon-grip h-4 w-4" />
          ) : null}
        </span>
        <span className="min-w-0 flex-1 truncate">{label}</span>
        <span className="sidebar-label-count">{count}</span>
      </Link>
      <button
        type="button"
        className={`sidebar-label-pin ${isPinned ? "is-pinned" : ""}`}
        aria-label={isPinned ? `Unpin ${label}` : `Pin ${label}`}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onTogglePin(label);
        }}
      >
        <Pin className={`h-3.5 w-3.5 ${isPinned ? "fill-current" : ""}`} />
      </button>
    </>
  );
}

function SortablePinnedLabel({
  label,
  count,
  index,
  isActive,
  sortable,
  onTogglePin,
}: {
  label: string;
  count: number;
  index: number;
  isActive: boolean;
  sortable: boolean;
  onTogglePin: (label: string) => void;
}) {
  const { ref, handleRef, isDragging } = useSortable({
    id: label,
    index,
    group: "pinned-tags",
    disabled: !sortable,
  });

  return (
    <li
      ref={ref}
      className={`sidebar-label-row m-1 ${isActive ? "is-active" : ""} ${isDragging ? "is-dragging is-sortable-hover" : ""}`}
    >
      <SidebarLabelRow
        label={label}
        count={count}
        isPinned
        preventNavigation={isDragging}
        handleRef={sortable ? handleRef : undefined}
        showGripIcon={sortable}
        onTogglePin={onTogglePin}
      />
    </li>
  );
}

function UnpinnedLabel({
  label,
  count,
  isActive,
  onTogglePin,
}: {
  label: string;
  count: number;
  isActive: boolean;
  onTogglePin: (label: string) => void;
}) {
  return (
    <li className={`sidebar-label-row m-1 ${isActive ? "is-active" : ""}`}>
      <SidebarLabelRow
        label={label}
        count={count}
        isPinned={false}
        onTogglePin={onTogglePin}
      />
    </li>
  );
}

function SidebarLogo() {
  return (
    <div className="sidebar-logo">
      <img src={logo} alt="" className="sidebar-logo-image" />
      <span className="sidebar-logo-text">leafee</span>
    </div>
  );
}

function SidebarUserSection({ user }: { user: User }) {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const displayName = user.displayName?.trim();
  const email = user.email ?? "";
  const primaryLabel = displayName || email || "Signed-in user";
  const secondaryLabel = displayName && email ? email : null;

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("logout failed:", error);
    }
  };

  return (
    <footer className="sidebar-user">
      <DropdownMenu.Root>
        <DropdownMenu.Trigger className="sidebar-user-trigger">
          <span className="sidebar-user-avatar" aria-hidden>
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt=""
                className="sidebar-user-avatar-image"
              />
            ) : (
              <CircleUserRound className="h-5 w-5" />
            )}
          </span>
          <div className="sidebar-user-info">
            <p className="sidebar-user-name">{primaryLabel}</p>
            {secondaryLabel ? (
              <p className="sidebar-user-email">{secondaryLabel}</p>
            ) : null}
          </div>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className="sidebar-user-menu-content"
            side="top"
            align="start"
            sideOffset={4}
          >
            <DropdownMenu.Item
              className="sidebar-user-menu-item"
              onSelect={() => void handleLogout()}
            >
              <LogOut aria-hidden className="h-4 w-4" />
              Log out
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
      <SettingsDialog
        user={user}
        trigger={
          <button
            type="button"
            className="sidebar-user-settings"
            aria-label="Settings"
          >
            <Settings className="h-4 w-4" />
          </button>
        }
      />
    </footer>
  );
}

const SidebarFixedNav = memo(function SidebarFixedNav({
  pathname,
}: {
  pathname: string;
}) {
  return (
    <>
      <SidebarItem
        to="/"
        label="All Bookmarks"
        icon={<Bookmark className="h-4 w-4" />}
        isActive={pathname === "/"}
      />
      <SidebarItem
        to="/uncategorized"
        label="Uncategorized"
        icon={<List className="h-4 w-4" />}
        isActive={pathname === "/uncategorized"}
      />
      <SidebarItem
        to="/archived"
        label="Archived"
        icon={<Archive className="h-4 w-4" />}
        isActive={pathname === "/archived"}
      />
    </>
  );
});

export function Sidebar() {
  const { tag: routeTag } = useParams();
  const { pathname } = useLocation();
  const { getIdToken, user } = useAuth();
  const listVersion = useBookmarkItemsStore((state) => state.version);
  const [labelFilterQuery, setLabelFilterQuery] = useState("");
  const { labels, pinned, updatePinned } = useSidebarLabels(
    user?.uid,
    getIdToken,
    listVersion,
  );

  const labelNames = useMemo(() => labels.map((label) => label.name), [labels]);
  const labelCountByName = useMemo(
    () => new Map(labels.map((label) => [label.name, label.count])),
    [labels],
  );
  const labelSet = useMemo(() => new Set(labelNames), [labelNames]);
  const pinnedSet = useMemo(() => new Set(pinned), [pinned]);
  const visiblePinned = useMemo(
    () => pinned.filter((label) => labelSet.has(label)),
    [pinned, labelSet],
  );
  const unpinned = useMemo(
    () => labelNames.filter((label) => !pinnedSet.has(label)),
    [labelNames, pinnedSet],
  );
  const filteredPinned = useMemo(
    () => filterLabels(visiblePinned, labelFilterQuery),
    [visiblePinned, labelFilterQuery],
  );
  const filteredUnpinned = useMemo(
    () => filterLabels(unpinned, labelFilterQuery),
    [unpinned, labelFilterQuery],
  );
  const sortable = labelFilterQuery.trim() === "";

  const handleTogglePin = useCallback(
    (label: string) => {
      updatePinned((current) =>
        current.includes(label)
          ? current.filter((pinnedLabel) => pinnedLabel !== label)
          : [...current, label],
      );
    },
    [updatePinned],
  );

  const showEmpty = labels.length === 0;
  const showNoMatch =
    !showEmpty && filteredPinned.length === 0 && filteredUnpinned.length === 0;

  return (
    <div className="sidebar flex min-h-0 flex-col overflow-x-hidden">
      <SidebarLogo />
      <nav className="min-h-0 flex-1 overflow-y-auto">
        <ul className="min-w-0">
          <SidebarFixedNav pathname={pathname} />
          <li className="sidebar-labels-section list-none">
            <p className="sidebar-labels-heading">Labels</p>
            <InputWithIcon
              icon={<Search className="h-4 w-4" />}
              placeholder="Filter labels"
              value={labelFilterQuery}
              onChange={(event) => setLabelFilterQuery(event.target.value)}
            />
          </li>
          {showEmpty ? (
            <li className="sidebar-labels-empty list-none">
              No labels yet. Add labels to bookmarks first.
            </li>
          ) : showNoMatch ? (
            <li className="sidebar-labels-empty list-none">
              No labels match your search.
            </li>
          ) : (
            <>
              {filteredPinned.length > 0 ? (
                <DragDropProvider
                  onDragEnd={(event) => {
                    if (event.canceled) {
                      return;
                    }
                    const { source } = event.operation;
                    if (!isSortable(source)) {
                      return;
                    }
                    const { initialIndex, index } = source;
                    if (initialIndex === index) {
                      return;
                    }
                    updatePinned((current) =>
                      reorderPinnedLabels(
                        current,
                        labelNames,
                        initialIndex,
                        index,
                      ),
                    );
                  }}
                >
                  {filteredPinned.map((label, index) => (
                    <SortablePinnedLabel
                      key={label}
                      label={label}
                      count={labelCountByName.get(label) ?? 0}
                      index={index}
                      isActive={routeTag === label}
                      sortable={sortable}
                      onTogglePin={handleTogglePin}
                    />
                  ))}
                </DragDropProvider>
              ) : null}
              {filteredUnpinned.map((label) => (
                <UnpinnedLabel
                  key={label}
                  label={label}
                  count={labelCountByName.get(label) ?? 0}
                  isActive={routeTag === label}
                  onTogglePin={handleTogglePin}
                />
              ))}
            </>
          )}
        </ul>
      </nav>
      {user ? <SidebarUserSection user={user} /> : null}
    </div>
  );
}
