import { memo, useEffect, useState } from "react";
import { Link, useLocation, useParams, useRevalidator } from "react-router";
import { Archive, Bookmark, List, Search, Tag } from "lucide-react";
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
        className={`flex min-w-0 flex-row items-center gap-2 p-1.5 pl-3 hover:bg-gray-200 ${isActive ? "bg-gray-200" : ""}`}
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
    <footer className="sidebar-logo gap-2">
      <img src={logo} alt="" className="sidebar-logo-image" />
      <span className="sidebar-logo-text">leafee</span>
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
      <hr />
      {/* <div className="flex w-full min-w-0 flex-row items-center gap-2">
        <InputWithIcon
          icon={<Search className="h-4 w-4" />}
          placeholder="search tags"
        />
      </div> */}
    </>
  );
});

const SidebarTagList = memo(function SidebarTagList({
  bookmarkTags,
  routeTag,
}: {
  bookmarkTags: string[];
  routeTag: string | undefined;
}) {
  return (
    <>
      {bookmarkTags.map((tag) => (
        <SidebarItem
          key={tag}
          to={`/${encodeURIComponent(tag)}`}
          label={tag}
          icon={<Tag className="h-4 w-4" />}
          isActive={routeTag === tag}
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
  const [bookmarkTags, setBookmarkTags] = useState<string[]>([]);

  useEffect(() => {
    if (!user) {
      setBookmarkTags([]);
      return;
    }

    let cancelled = false;

    async function loadTags() {
      try {
        const token = await getIdToken();
        if (!token || cancelled) {
          return;
        }
        const tags = await fetchBookmarkTags(token);
        if (!cancelled) {
          setBookmarkTags(tags);
        }
      } catch (error) {
        console.error("[sidebar] failed to load tags:", error);
      }
    }

    loadTags();

    return () => {
      cancelled = true;
    };
  }, [user, getIdToken, revalidator.state]);

  return (
    <div className="sidebar flex min-h-0 flex-col overflow-x-hidden">
      <nav className="min-h-0 flex-1 overflow-y-auto">
        <ul className="min-w-0">
          <SidebarFixedNav pathname={pathname} />
          <SidebarTagList bookmarkTags={bookmarkTags} routeTag={routeTag} />
        </ul>
      </nav>
      <SidebarLogo />
    </div>
  );
}
