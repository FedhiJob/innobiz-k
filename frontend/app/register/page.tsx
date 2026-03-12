"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ApiHttpError } from "@/lib/api";
import { useAuth } from "@/context/auth-context";

const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

export default function RegisterPage() {
  const router = useRouter();
  const { register, user, isLoading } = useAuth();
  const [name, setName] = useState("");
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
        <div className="flex justify-center">
          <img alt="InnoBiz-K Ethiopia" className="h-12 w-auto" src="/ink-logo.png" />
        </div>
        <h1 className="text-2xl font-bold text-brand-slate">Create Startup Account</h1>
        <p className="mt-1 text-sm text-slate-600">Register to start and track your incubation application.</p>

        <form
          className="mt-6 space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            setError(null);

            if (!passwordRegex.test(password)) {
              setError("Password must be 8+ chars with at least one uppercase letter and one number.");
              return;
            }

            setSubmitting(true);
            try {
              await register({ name: name.trim(), email: email.trim(), password });
              router.replace("/dashboard");
            } catch (err) {
              if (err instanceof ApiHttpError) {
                setError(err.message);
              } else {
                setError("Unable to register right now.");
              }
            } finally {
              setSubmitting(false);
            }
          }}
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="name">
              Full name
            </label>
            <input
              className="input"
              id="name"
              minLength={2}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your full name"
              required
              value={name}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="email">
              Email
            </label>
            <input
              className="input"
              id="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
              type="email"
              value={email}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="password">
              Password
            </label>
            <input
              className="input"
              id="password"
              minLength={8}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Min 8 chars, 1 uppercase, 1 number"
              required
              type="password"
              value={password}
            />
          </div>

          {error ? <p className="rounded-lg bg-brand-red/10 px-3 py-2 text-sm font-medium text-brand-red">{error}</p> : null}

          <button className="btn-primary w-full" disabled={submitting} type="submit">
            {submitting ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="mt-4 text-sm text-slate-600">
          Already have an account?{" "}
          <Link className="font-semibold text-brand-blue" href="/login">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
