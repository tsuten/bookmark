import { useEffect, useState } from "react";
import { Link, useLocation, useParams, useRevalidator } from "react-router";
import { Archive, Bookmark, List, Search, Tag } from "lucide-react";
import type { ReactNode } from "react";
import { InputWithIcon } from "~/components/molecules/InputWithIcon";
import { fetchBookmarkTags } from "~/lib/api/bookmarks";
import { useAuth } from "~/lib/auth/auth-context";

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
        className={`flex min-w-0 flex-row items-center gap-2 p-1 pl-3 hover:bg-gray-200 ${isActive ? "bg-gray-200" : ""}`}
      >
        <span className="inline-flex shrink-0 items-center justify-center [&_svg]:size-4 [&_svg]:shrink-0">
          {icon}
        </span>
        <span className="min-w-0 flex-1 truncate">{label}</span>
      </li>
    </Link>
  );
}

export function Sidebar() {
  const { tag: routeTag } = useParams();
  const { pathname } = useLocation();
  const { getIdToken, user } = useAuth();
  const revalidator = useRevalidator();
  const [bookmarkTags, setBookmarkTags] = useState<string[]>([]);
  const [tagsLoading, setTagsLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setBookmarkTags([]);
      return;
    }

    let cancelled = false;

    async function loadTags() {
      setTagsLoading(true);
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
      } finally {
        if (!cancelled) {
          setTagsLoading(false);
        }
      }
    }

    loadTags();

    return () => {
      cancelled = true;
    };
  }, [user, getIdToken, pathname, revalidator.state]);

  if (tagsLoading && bookmarkTags.length === 0) {
    return <div className="sidebar p-3 text-gray-500">Loading...</div>;
  }

  return (
    <div className="sidebar min-w-0 overflow-x-hidden">
      <ul className="min-w-0">
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
        <div className="flex w-full min-w-0 flex-row items-center gap-2">
          <InputWithIcon
            icon={<Search className="h-4 w-4" />}
            placeholder="search tags"
          />
        </div>
        {bookmarkTags.map((tag) => (
          <SidebarItem
            key={tag}
            to={`/${encodeURIComponent(tag)}`}
            label={tag}
            icon={<Tag className="h-4 w-4" />}
            isActive={routeTag === tag}
          />
        ))}
      </ul>
    </div>
  );
}
