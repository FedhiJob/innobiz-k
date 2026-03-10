import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4">
      <div className="panel max-w-md p-6 text-center">
        <h2 className="text-2xl font-bold text-brand-slate">Page Not Found</h2>
        <p className="mt-2 text-sm text-slate-600">The page you requested does not exist.</p>
        <Link className="btn-primary mt-4 inline-block" href="/dashboard">
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
