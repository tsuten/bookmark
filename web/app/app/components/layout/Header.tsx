import { useState } from "react";
import { useRevalidator } from "react-router";
import { Plus } from "lucide-react";
import { SearchCommandDialog } from "~/components/layout/SearchCommandDialog";
import { UserMenu } from "~/components/layout/UserMenu";
import {
  bookmarkUrlErrorMessage,
  validateHttpUrlString,
} from "~/lib/bookmarks/validateUrl";
import { createBookmark } from "~/lib/api/bookmarks";
import { getAuthToken } from "~/lib/api/loaders";
import { ApiError } from "~/lib/api/client";
import { useAuth } from "~/lib/auth/auth-context";

function InsertBookmarkForm() {
  const revalidator = useRevalidator();
  const { user } = useAuth();
  const [url, setUrl] = useState("");
  const [urlError, setUrlError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(event.target.value);
    if (urlError) {
      setUrlError("");
    }
  };

  const addBookmarkItem = async () => {
    const result = validateHttpUrlString(url);
    if (!result.valid) {
      setUrlError(bookmarkUrlErrorMessage(result.errorCode));
      return;
    }

    setSubmitting(true);
    setUrlError("");

    try {
      const token = await getAuthToken();
      await createBookmark(token, { url });
      setUrl("");
      revalidator.revalidate();
    } catch (error) {
      setUrlError(
        error instanceof ApiError ? error.message : "Failed to add bookmark.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-row items-center">
        <input
          type="text"
          placeholder="Add a new bookmark"
          value={url}
          onChange={handleUrlChange}
          disabled={submitting}
          aria-invalid={urlError ? "true" : "false"}
        />
        <button
          type="button"
          onClick={addBookmarkItem}
          disabled={submitting}
          className="rounded-l-none bg-brand p-2 text-white disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      {urlError ? (
        <p className="text-sm text-red-600" role="alert">
          {urlError}
        </p>
      ) : null}
    </div>
  );
}

export function Header() {
  return (
    <header className="border-b border-gray-300">
      <SearchCommandDialog />
      <div className="flex flex-row items-center gap-2">
        <InsertBookmarkForm />
        <UserMenu />
      </div>
    </header>
  );
}
