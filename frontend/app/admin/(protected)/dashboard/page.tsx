"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { adminApi, ApiHttpError } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { StatusBadge } from "@/components/status-badge";
import { formatDateTime } from "@/lib/format";
import type { AdminStats, PaginatedAdminApplications } from "@/types/api";

export default function AdminDashboardPage() {
  const { token } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recent, setRecent] = useState<PaginatedAdminApplications["items"]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      return;
    }

    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const [statsRes, recentRes] = await Promise.all([
          adminApi.stats(token),
          adminApi.listApplications(token, { page: 1, pageSize: 10 }),
        ]);
        setStats(statsRes);
        setRecent(recentRes.items);
      } catch (err) {
        if (err instanceof ApiHttpError) {
          setError(err.message);
        } else {
          setError("Unable to load admin dashboard.");
        }
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [token]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-brand-ink">Admin Dashboard</h2>
          <p className="text-sm text-slate-600">Review queue and decision metrics.</p>
        </div>
        <Link className="btn-primary" href="/admin/applications?status=SUBMITTED">
          Open Review Queue
        </Link>
      </div>

      {loading ? (
        <div className="panel p-5 text-sm text-slate-600">Loading dashboard...</div>
      ) : error ? (
        <div className="rounded-lg border border-brand-red/20 bg-brand-red/10 px-4 py-3 text-sm text-brand-red">
          {error}
        </div>
      ) : null}

      {stats ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[
            { label: "Total", value: stats.total },
            { label: "Draft", value: stats.draft },
            { label: "Submitted", value: stats.submitted },
            { label: "Approved", value: stats.approved },
            { label: "Rejected", value: stats.rejected },
          ].map((item) => (
            <div className="panel p-4" key={item.label}>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{item.label}</p>
              <p className="mt-2 text-3xl font-bold text-brand-ink">{item.value}</p>
            </div>
          ))}
        </div>
      ) : null}

      <div className="panel overflow-hidden">
        <div className="border-b border-slate-200 px-4 py-3">
          <h3 className="text-lg font-semibold text-brand-ink">Recent Applications</h3>
        </div>
        {recent.length === 0 ? (
          <div className="px-4 py-5 text-sm text-slate-600">No applications found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-600">
                <tr>
                  <th className="px-4 py-3">Company</th>
                  <th className="px-4 py-3">Startup</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Submitted</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((item) => (
                  <tr className="border-t border-slate-100" key={item.id}>
                    <td className="px-4 py-3 font-medium text-slate-800">{item.companyName ?? "Untitled"}</td>
                    <td className="px-4 py-3 text-slate-700">{item.startup.email}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-600">{formatDateTime(item.submittedAt)}</td>
                    <td className="px-4 py-3">
                      <Link className="font-semibold text-brand-blue" href={`/admin/applications/${item.id}`}>
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
