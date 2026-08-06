import { memo, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams, useRevalidator } from "react-router";
import {
  Archive,
  Bookmark,
  CircleUserRound,
  List,
  Search,
  Settings,
  Tag,
} from "lucide-react";
import type { User } from "firebase/auth";
import type { ReactNode } from "react";
import { InputWithIcon } from "~/components/molecules/InputWithIcon";
import { fetchBookmarkTags } from "~/lib/api/bookmarks";
import { useAuth } from "~/lib/auth/auth-context";
import logo from "~/assets/logo.svg";

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
        className={`m-1 flex min-w-0 flex-row items-center gap-2 rounded-md p-1 pl-3 hover:bg-gray-200 ${isActive ? "bg-gray-200" : ""}`}
      >
        <span className="inline-flex shrink-0 items-center justify-center [&_svg]:size-4 [&_svg]:shrink-0">
          {icon}
        </span>
        <span className="min-w-0 flex-1 truncate">{label}</span>
      </li>
    </Link>
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
  const displayName = user.displayName?.trim();
  const email = user.email ?? "";
  const primaryLabel = displayName || email || "Signed-in user";
  const secondaryLabel = displayName && email ? email : null;

  return (
    <footer className="sidebar-user">
      <span className="sidebar-user-avatar" aria-hidden>
        {user.photoURL ? (
          <img src={user.photoURL} alt="" className="sidebar-user-avatar-image" />
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
      <Link
        to="/settings"
        className="sidebar-user-settings"
        aria-label="Settings"
      >
        <Settings className="h-4 w-4" />
      </Link>
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

function filterLabels(labels: string[], query: string): string[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return labels;
  }

  return labels.filter((label) =>
    label.toLowerCase().includes(normalizedQuery),
  );
}

const SidebarLabelList = memo(function SidebarLabelList({
  labels,
  routeTag,
  filterQuery,
}: {
  labels: string[];
  routeTag: string | undefined;
  filterQuery: string;
}) {
  const filteredLabels = useMemo(
    () => filterLabels(labels, filterQuery),
    [labels, filterQuery],
  );

  if (labels.length === 0) {
    return (
      <li className="sidebar-labels-empty list-none">
        No labels yet. Add labels to bookmarks first.
      </li>
    );
  }

  if (filteredLabels.length === 0) {
    return (
      <li className="sidebar-labels-empty list-none">
        No labels match your search.
      </li>
    );
  }

  return (
    <>
      {filteredLabels.map((label) => (
        <SidebarItem
          key={label}
          to={`/${encodeURIComponent(label)}`}
          label={label}
          icon={<Tag className="h-4 w-4" />}
          isActive={routeTag === label}
        />
      ))}
    </>
  );
});

export function Sidebar() {
  const { tag: routeTag } = useParams();
  const { pathname } = useLocation();
  const { getIdToken, user } = useAuth();
  const revalidator = useRevalidator();
  const [labels, setLabels] = useState<string[]>([]);
  const [labelFilterQuery, setLabelFilterQuery] = useState("");

  useEffect(() => {
    if (!user) {
      setLabels([]);
      return;
    }

    let cancelled = false;

    async function loadLabels() {
      try {
        const token = await getIdToken();
        if (!token || cancelled) {
          return;
        }
        const tags = await fetchBookmarkTags(token);
        if (!cancelled) {
          setLabels(tags);
        }
      } catch (error) {
        console.error("[sidebar] failed to load labels:", error);
      }
    }

    loadLabels();

    return () => {
      cancelled = true;
    };
  }, [user, getIdToken, revalidator.state]);

  return (
    <div className="sidebar flex min-h-0 flex-col overflow-x-hidden">
      <SidebarLogo />
      <nav className="min-h-0 flex-1 overflow-y-auto">
        <ul className="min-w-0">
          <SidebarFixedNav pathname={pathname} />
          {/* <hr /> */}
          <li className="sidebar-labels-section list-none">
            <p className="sidebar-labels-heading">Labels</p>
            <InputWithIcon
              icon={<Search className="h-4 w-4" />}
              placeholder="Filter labels"
              value={labelFilterQuery}
              onChange={(event) => setLabelFilterQuery(event.target.value)}
            />
          </li>
          <SidebarLabelList
            labels={labels}
            routeTag={routeTag}
            filterQuery={labelFilterQuery}
          />
        </ul>
      </nav>
      {user ? <SidebarUserSection user={user} /> : null}
    </div>
  );
}
