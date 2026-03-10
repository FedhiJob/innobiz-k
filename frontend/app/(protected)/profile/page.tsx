"use client";

import { useEffect, useState } from "react";
import { ApiHttpError } from "@/lib/api";
import { useAuth } from "@/context/auth-context";

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      return;
    }
    setName(user.name);
    setEmail(user.email);
  }, [user]);

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-brand-slate">Profile</h2>
        <p className="text-sm text-slate-600">Update your account information.</p>
      </div>

      <div className="panel p-6">
        <form
          className="space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            setSaving(true);
            setError(null);
            setMessage(null);
            try {
              await updateProfile({ name: name.trim(), email: email.trim() });
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

          {message ? <p className="rounded-lg bg-brand-green/10 px-3 py-2 text-sm font-medium text-brand-green">{message}</p> : null}
          {error ? <p className="rounded-lg bg-brand-red/10 px-3 py-2 text-sm font-medium text-brand-red">{error}</p> : null}

          <button className="btn-primary" disabled={saving} type="submit">
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
