"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ApiHttpError, applicationApi } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { StatusBadge } from "@/components/status-badge";
import { formatDateTime } from "@/lib/format";
import type { ApplicationStatus, PaginatedApplications } from "@/types/api";

const statuses: ApplicationStatus[] = ["DRAFT", "SUBMITTED", "APPROVED", "REJECTED"];

export default function DashboardPage() {
  const { token } = useAuth();
  const [data, setData] = useState<PaginatedApplications | null>(null);
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
        const response = await applicationApi.list(token, 1, 100);
        setData(response);
      } catch (err) {
        if (err instanceof ApiHttpError) {
          setError(err.message);
        } else {
          setError("Unable to load applications.");
        }
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, [token]);

  const statusCounts = useMemo(() => {
    const counts: Record<ApplicationStatus, number> = {
      DRAFT: 0,
      SUBMITTED: 0,
      APPROVED: 0,
      REJECTED: 0,
    };
    data?.items.forEach((item) => {
      counts[item.status] += 1;
    });
    return counts;
  }, [data]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-brand-slate">Startup Dashboard</h2>
          <p className="text-sm text-slate-600">Track your applications and continue drafts.</p>
        </div>
        <Link className="btn-primary" href="/application/new">
          New Application
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statuses.map((status) => (
          <div className="panel p-4" key={status}>
            <p className="text-sm text-slate-500">{status}</p>
            <p className="mt-1 text-3xl font-extrabold text-brand-slate">{statusCounts[status]}</p>
          </div>
        ))}
      </div>

      <div className="panel overflow-hidden">
        <div className="border-b border-slate-200 px-4 py-3">
          <h3 className="text-lg font-semibold text-brand-slate">Recent Applications</h3>
        </div>

        {loading ? (
          <div className="px-4 py-6 text-sm text-slate-600">Loading applications...</div>
        ) : error ? (
          <div className="px-4 py-6 text-sm font-medium text-brand-red">{error}</div>
        ) : data && data.items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-600">
                <tr>
                  <th className="px-4 py-3">Company</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Submitted</th>
                  <th className="px-4 py-3">Updated</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item) => (
                  <tr className="border-t border-slate-100" key={item.id}>
                    <td className="px-4 py-3 font-medium text-slate-800">{item.companyName ?? "Untitled Draft"}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-600">{formatDateTime(item.submittedAt)}</td>
                    <td className="px-4 py-3 text-slate-600">{formatDateTime(item.updatedAt)}</td>
                    <td className="px-4 py-3">
                      <Link className="font-semibold text-brand-blue" href={`/application/${item.id}`}>
                        {item.status === "DRAFT" ? "Continue Draft" : "View"}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-4 py-6 text-sm text-slate-600">No applications yet. Start a new one.</div>
        )}
      </div>
    </div>
  );
}
