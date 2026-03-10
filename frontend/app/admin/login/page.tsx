"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiHttpError } from "@/lib/api";
import { useAuth } from "@/context/auth-context";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, user, isLoading, logout } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && user) {
      router.replace(user.role === "ADMIN" ? "/admin/dashboard" : "/dashboard");
    }
  }, [isLoading, user, router]);

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-10">
      <div className="panel w-full max-w-md p-6">
        <h1 className="text-2xl font-bold text-brand-ink">Admin Login</h1>
        <p className="mt-1 text-sm text-slate-600">Use an ADMIN account to review applications.</p>

        <form
          className="mt-6 space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            setSubmitting(true);
            setError(null);
            try {
              const loggedInUser = await login({ email: email.trim(), password });
              if (loggedInUser.role !== "ADMIN") {
                await logout();
                throw new Error("This account does not have admin access.");
              }
              router.replace("/admin/dashboard");
            } catch (err) {
              if (err instanceof ApiHttpError || err instanceof Error) {
                setError(err.message);
              } else {
                setError("Unable to login right now.");
              }
            } finally {
              setSubmitting(false);
            }
          }}
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="admin-email">
              Email
            </label>
            <input
              className="input"
              id="admin-email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@innobizk.et"
              required
              type="email"
              value={email}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="admin-password">
              Password
            </label>
            <input
              className="input"
              id="admin-password"
              minLength={8}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Your admin password"
              required
              type="password"
              value={password}
            />
          </div>

          {error ? (
            <p className="rounded-lg bg-brand-red/10 px-3 py-2 text-sm font-medium text-brand-red">{error}</p>
          ) : null}

          <button className="btn-primary w-full" disabled={submitting} type="submit">
            {submitting ? "Logging in..." : "Login as Admin"}
          </button>
        </form>
      </div>
    </div>
  );
}
