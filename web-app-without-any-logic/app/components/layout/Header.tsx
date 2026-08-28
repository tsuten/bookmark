import { ClipboardPaste } from "lucide-react";
import { UserMenu } from "~/components/layout/UserMenu";

export function PasteBookmarkButton() {
  return (
    <div className="flex flex-col gap-1">
      <button type="button" aria-label="Paste and add">
        <ClipboardPaste aria-hidden className="h-4 w-4" />
      </button>
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
