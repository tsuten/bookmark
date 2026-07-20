import { useNavigation, useRevalidator } from "react-router";
import { BookmarkList } from "~/components/bookmarks/BookmarkList";
import type { BookmarkItem } from "~/lib/api/types";

type BookmarkListPageProps = {
  title: string;
  items: BookmarkItem[];
  error?: string | null;
};

export function BookmarkListPage({
  title,
  items,
  error = null,
}: BookmarkListPageProps) {
  const navigation = useNavigation();
  const revalidator = useRevalidator();
  const isLoading = navigation.state === "loading";

  return (
    <BookmarkList
      title={title}
      bookmarkItems={items}
      isLoading={isLoading}
      error={error}
      onMutate={() => revalidator.revalidate()}
    />
  );
}
