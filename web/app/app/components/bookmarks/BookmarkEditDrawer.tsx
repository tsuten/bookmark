import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { TagsInput } from "~/components/molecules/TagsInput";
import {
  bookmarkUrlErrorMessage,
  validateHttpUrlString,
} from "~/lib/bookmarks/validateUrl";
import type { BookmarkItem } from "~/lib/api/types";
import { ApiError } from "~/lib/api/client";
import { useBookmarkItemsStore } from "~/stores/bookmarkItemsStore";

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
  const [urlError, setUrlError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setTitle(bookmarkItem.title || "");
    setUrl(bookmarkItem.url || "");
    setTags(bookmarkItem.tags ?? []);
    setNote(bookmarkItem.note ?? "");
    setUrlError("");
    setSubmitError("");
    setSubmitting(false);
  }, [bookmarkItem.id]);

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(event.target.value);
    if (urlError) {
      setUrlError("");
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = validateHttpUrlString(url);
    if (!result.valid) {
      setUrlError(bookmarkUrlErrorMessage(result.errorCode));
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      await useBookmarkItemsStore.getState().update(bookmarkItem.id, {
        title,
        url: url.trim(),
        tags,
        note: note.trim(),
      });
      onClose();
    } catch (error) {
      setSubmitError(
        error instanceof ApiError
          ? error.message
          : "Failed to save bookmark.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bookmark-edit-panel" aria-label="Edit bookmark">
      <div className="bookmark-edit-panel-header">
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
        onSubmit={handleSubmit}
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
            onChange={handleUrlChange}
            placeholder="https://example.com"
            aria-invalid={urlError ? "true" : "false"}
          />
          {urlError ? (
            <p className="text-sm text-red-600" role="alert">
              {urlError}
            </p>
          ) : null}
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

        {submitError ? (
          <p className="text-sm text-red-600" role="alert">
            {submitError}
          </p>
        ) : null}

        <div className="mt-auto flex justify-end gap-2 border-gray-300 pt-4">
          <button
            type="button"
            className="bg-gray-100 px-3 py-2 text-sm"
            disabled={submitting}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-brand px-3 py-2 text-sm text-white disabled:opacity-50"
            disabled={submitting}
          >
            {submitting ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
