"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiHttpError } from "@/lib/api";
import { useAuth } from "@/context/auth-context";

export default function ProfilePage() {
  const router = useRouter();
  const { user, updateProfile, logout } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notifyByEmail, setNotifyByEmail] = useState(true);
  const [notifyInApp, setNotifyInApp] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      return;
    }
    setName(user.name);
    setEmail(user.email);
    setNotifyByEmail(user.notifyByEmail ?? true);
    setNotifyInApp(user.notifyInApp ?? true);
  }, [user]);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div className="flex items-start gap-3 sm:items-center">
        <img alt="innobiz-k Ethiopia" className="h-10 w-auto" src="/ink-logo.png" />
        <div className="min-w-0">
          <h2 className="text-2xl font-bold text-brand-slate">Profile</h2>
          <p className="text-sm text-slate-600">Update your account information.</p>
        </div>
      </div>

      <div className="panel space-y-4 p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Account</p>
            <p className="text-lg font-semibold text-brand-ink">{user?.name}</p>
            <p className="text-sm text-slate-600">{user?.email}</p>
          </div>
          <button
            className="btn-secondary w-full sm:w-auto"
            onClick={async () => {
              await logout();
              router.replace("/login");
            }}
            type="button"
          >
            Logout
          </button>
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
                name: name.trim(),
                email: email.trim(),
                notifyByEmail,
                notifyInApp,
              });
              setMessage("Profile updated successfully.");
            } catch (err) {
              if (err instanceof ApiHttpError) {
                setError(err.message);
              } else {
                setError("Unable to update profile.");
              }
            } finally {
              setSaving(false);
            }
          }}
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="profile-name">
              Name
            </label>
            <input
              className="input"
              id="profile-name"
              minLength={2}
              onChange={(event) => setName(event.target.value)}
              required
              value={name}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="profile-email">
              Email
            </label>
            <input
              className="input"
              id="profile-email"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
            <p className="text-sm font-semibold text-brand-ink">Notification preferences</p>
            <p className="mt-1 text-xs text-slate-500">
              Control how you receive updates about your applications and reports.
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

          {message ? <p className="rounded-lg bg-brand-green/10 px-3 py-2 text-sm font-medium text-brand-green">{message}</p> : null}
          {error ? <p className="rounded-lg bg-brand-red/10 px-3 py-2 text-sm font-medium text-brand-red">{error}</p> : null}

          <button className="btn-primary w-full sm:w-auto" disabled={saving} type="submit">
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
