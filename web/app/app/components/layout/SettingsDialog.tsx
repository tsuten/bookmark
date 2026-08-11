import { useState } from "react";
import { Dialog } from "radix-ui";
import type { User } from "firebase/auth";
import type { ReactNode } from "react";

type SettingsDialogProps = {
  user: User;
  trigger: ReactNode;
};

export function SettingsDialog({ user, trigger }: SettingsDialogProps) {
  const [displayName, setDisplayName] = useState(
    user.displayName?.trim() ?? "",
  );
  const [theme, setTheme] = useState("system");
  const [defaultView, setDefaultView] = useState("list");
  const [openLinksInNewTab, setOpenLinksInNewTab] = useState(true);

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="settings-dialog-overlay" />
        <Dialog.Content className="settings-dialog-content">
          <Dialog.Title className="settings-dialog-title">Settings</Dialog.Title>
          <Dialog.Description className="settings-dialog-description">
            Manage your account and app preferences.
          </Dialog.Description>

          <div className="settings-dialog-body">
            <section className="settings-dialog-section">
              <h3 className="settings-dialog-section-title">Profile</h3>
              <label className="settings-dialog-field">
                <span className="settings-dialog-label">Display name</span>
                <input
                  type="text"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  placeholder="Your name"
                  className="settings-dialog-input"
                />
              </label>
            </section>

            <section className="settings-dialog-section">
              <h3 className="settings-dialog-section-title">Appearance</h3>
              <label className="settings-dialog-field">
                <span className="settings-dialog-label">Theme</span>
                <select
                  value={theme}
                  onChange={(event) => setTheme(event.target.value)}
                  className="settings-dialog-select"
                >
                  <option value="system">System</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </label>
            </section>

            <section className="settings-dialog-section">
              <h3 className="settings-dialog-section-title">Bookmarks</h3>
              <label className="settings-dialog-field">
                <span className="settings-dialog-label">Default view</span>
                <select
                  value={defaultView}
                  onChange={(event) => setDefaultView(event.target.value)}
                  className="settings-dialog-select"
                >
                  <option value="list">List</option>
                  <option value="grid">Grid</option>
                </select>
              </label>
              <label className="settings-dialog-checkbox">
                <input
                  type="checkbox"
                  checked={openLinksInNewTab}
                  onChange={(event) => setOpenLinksInNewTab(event.target.checked)}
                />
                <span>Open links in a new tab</span>
              </label>
            </section>

            <section className="settings-dialog-section">
              <h3 className="settings-dialog-section-title">Account</h3>
              <label className="settings-dialog-field">
                <span className="settings-dialog-label">Email</span>
                <input
                  type="email"
                  value={user.email ?? ""}
                  readOnly
                  className="settings-dialog-input settings-dialog-input--readonly"
                />
              </label>
            </section>
          </div>

          <div className="settings-dialog-footer">
            <Dialog.Close className="settings-dialog-close">Close</Dialog.Close>
            <button type="button" className="settings-dialog-save" disabled>
              Save changes
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
