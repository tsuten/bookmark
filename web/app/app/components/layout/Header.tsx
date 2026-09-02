import { useState } from "react";
import { ClipboardPaste, Loader2, Plus } from "lucide-react";
import { SearchCommandDialog } from "~/components/layout/SearchCommandDialog";
import { UserMenu } from "~/components/layout/UserMenu";
import {
  bookmarkUrlErrorMessage,
  validateHttpUrlString,
} from "~/lib/bookmarks/validateUrl";
import { ApiError } from "~/lib/api/client";
import { useAuth } from "~/lib/auth/auth-context";
import { useBookmarkItemsStore } from "~/stores/bookmarkItemsStore";

async function addBookmarkFromUrl(url: string) {
  const result = validateHttpUrlString(url);
  if (!result.valid) {
    return { ok: false as const, error: bookmarkUrlErrorMessage(result.errorCode) };
  }

  await useBookmarkItemsStore.getState().create({ url: url.trim() });
  return { ok: true as const };
}

function InsertBookmarkForm() {
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
    setSubmitting(true);
    setUrlError("");

    try {
      const result = await addBookmarkFromUrl(url);
      if (!result.ok) {
        setUrlError(result.error);
        return;
      }
      setUrl("");
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

export function PasteBookmarkButton() {
  const { user } = useAuth();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const pasteAndAdd = async () => {
    setSubmitting(true);
    setError("");

    try {
      const text = await navigator.clipboard.readText();
      const result = await addBookmarkFromUrl(text);
      if (!result.ok) {
        setError(result.error);
      }
    } catch (pasteError) {
      if (pasteError instanceof ApiError) {
        setError(pasteError.message);
      } else if (
        pasteError instanceof DOMException &&
        pasteError.name === "NotAllowedError"
      ) {
        setError("Clipboard access was denied.");
      } else {
        setError(
          pasteError instanceof Error
            ? pasteError.message
            : "Failed to paste bookmark.",
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={() => void pasteAndAdd()}
        disabled={submitting}
        aria-label="Paste and add"
        className="disabled:opacity-50"
      >
        {submitting ? (
          <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
        ) : (
          <ClipboardPaste aria-hidden className="h-4 w-4" />
        )}
      </button>
      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function Header() {
  return (
    <header className="app-header">
      {/* <SearchCommandDialog /> */}
      <div className="ml-auto flex flex-row items-center gap-2">
        {/* <InsertBookmarkForm /> */}
        <PasteBookmarkButton />
        <UserMenu />
      </div>
    </header>
  );
}
