import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { TagsInput } from "~/components/molecules/TagsInput";
import type { BookmarkItem } from "~/lib/types";

type BookmarkEditDrawerProps = {
  bookmarkItem: BookmarkItem;
  onClose: () => void;
};

export function BookmarkEditDrawer({
  bookmarkItem,
  onClose,
}: BookmarkEditDrawerProps) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [note, setNote] = useState("");

  useEffect(() => {
    setTitle(bookmarkItem.title || "");
    setUrl(bookmarkItem.url || "");
    setTags(bookmarkItem.tags ?? []);
    setNote(bookmarkItem.note ?? "");
  }, [bookmarkItem.id]);

  return (
    <div className="bookmark-edit-panel" aria-label="Edit bookmark">
      <div className="flex items-center justify-between border-b border-gray-300 px-4 py-[10px]">
        <h2 className="text-lg font-semibold text-gray-900">Edit bookmark</h2>
        <button
          type="button"
          className="p-1 text-gray-500 hover:bg-gray-100"
          aria-label="Close"
          onClick={onClose}
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          onClose();
        }}
        className="flex flex-1 flex-col gap-4 overflow-y-auto p-4"
      >
        <label className="flex flex-col gap-1 text-sm text-gray-700">
          Title
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Bookmark title"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-gray-700">
          URL
          <input
            type="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://example.com"
          />
        </label>

        <div className="flex flex-col gap-1 text-sm text-gray-700">
          <span>Tags</span>
          <TagsInput value={tags} onChange={setTags} />
        </div>

        <label className="flex flex-col gap-1 text-sm text-gray-700">
          Note
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Add a note..."
            rows={4}
          />
        </label>

        <div className="mt-auto flex justify-end gap-2 border-gray-300 pt-4">
          <button
            type="button"
            className="bg-gray-100 px-3 py-2 text-sm"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-brand px-3 py-2 text-sm text-white"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
