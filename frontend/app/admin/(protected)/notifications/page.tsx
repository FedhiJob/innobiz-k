"use client";

import { useEffect, useState } from "react";
import { ApiHttpError } from "@/lib/api";
import { useAuth } from "@/context/auth-context";

export default function AdminNotificationSettingsPage() {
  const { user, updateProfile } = useAuth();
  const [notifyByEmail, setNotifyByEmail] = useState(true);
  const [notifyInApp, setNotifyInApp] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      return;
    }
    setNotifyByEmail(user.notifyByEmail ?? true);
    setNotifyInApp(user.notifyInApp ?? true);
  }, [user]);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div className="flex items-start gap-3 sm:items-center">
        <img alt="InnoBiz-K Ethiopia" className="h-10 w-auto" src="/ink-logo.png" />
        <div className="min-w-0">
          <h2 className="text-2xl font-bold text-brand-ink">Admin Notification Settings</h2>
          <p className="text-sm text-slate-600">Choose how you want to receive admin alerts.</p>
        </div>
      </div>

      <div className="panel p-5 sm:p-6">
        <form
          className="space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            setSaving(true);
            setError(null);
            setMessage(null);
            try {
              await updateProfile({
                notifyByEmail,
                notifyInApp,
              });
              setMessage("Notification preferences saved.");
            } catch (err) {
              if (err instanceof ApiHttpError) {
                setError(err.message);
              } else {
                setError("Unable to update notification settings.");
              }
            } finally {
              setSaving(false);
            }
          }}
        >
          <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
            <p className="text-sm font-semibold text-brand-ink">Your preferences</p>
            <p className="mt-1 text-xs text-slate-500">
              Toggle in-app or email alerts for new applications and reports.
            </p>
            <div className="mt-4 space-y-3">
              <label className="flex flex-col items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm text-slate-700">In-app notifications</span>
                <input
                  checked={notifyInApp}
                  className="h-5 w-5 accent-brand-blue"
                  onChange={(event) => setNotifyInApp(event.target.checked)}
                  type="checkbox"
                />
              </label>
              <label className="flex flex-col items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm text-slate-700">Email notifications</span>
                <input
                  checked={notifyByEmail}
                  className="h-5 w-5 accent-brand-blue"
                  onChange={(event) => setNotifyByEmail(event.target.checked)}
                  type="checkbox"
                />
              </label>
            </div>
          </div>

          {message ? (
            <p className="rounded-lg bg-brand-green/10 px-3 py-2 text-sm font-medium text-brand-green">
              {message}
            </p>
          ) : null}
          {error ? (
            <p className="rounded-lg bg-brand-red/10 px-3 py-2 text-sm font-medium text-brand-red">{error}</p>
          ) : null}

          <button className="btn-primary w-full sm:w-auto" disabled={saving} type="submit">
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </form>
      </div>
    </div>
  );
}
