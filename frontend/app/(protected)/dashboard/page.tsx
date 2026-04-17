"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ApiHttpError, applicationApi } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { StatusBadge } from "@/components/status-badge";
import { formatStatusLabel } from "@/lib/status";
import { formatDateTime } from "@/lib/format";
import { InkLoader } from "@/components/ink-loader";
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-brand-slate">Startup Dashboard</h2>
          <p className="text-sm text-slate-600">Track your applications and continue drafts.</p>
        </div>
        <Link className="btn-primary w-full sm:w-auto" href="/application/new">
          New Application
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statuses.map((status) => (
          <div className="panel p-4" key={status}>
            <p className="text-sm text-slate-500">{formatStatusLabel(status)}</p>
            <p className="mt-1 text-3xl font-extrabold text-brand-slate">{statusCounts[status]}</p>
          </div>
        ))}
      </div>

      <div className="panel overflow-hidden">
        <div className="border-b border-slate-200 px-4 py-3">
          <h3 className="text-lg font-semibold text-brand-slate">Recent Applications</h3>
        </div>

        {loading ? (
          <div className="px-4 py-8">
            <InkLoader message="Loading applications..." size="sm" />
          </div>
        ) : error ? (
          <div className="px-4 py-6 text-sm font-medium text-brand-red">{error}</div>
        ) : data && data.items.length > 0 ? (
          <>
            <div className="space-y-3 px-4 py-4 sm:hidden">
              {data.items.map((item) => (
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm" key={item.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {item.companyName ?? "Untitled Draft"}
                      </p>
                      <p className="text-xs text-slate-500">Updated {formatDateTime(item.updatedAt)}</p>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <span>Submitted {formatDateTime(item.submittedAt)}</span>
                    <Link className="text-sm font-semibold text-brand-blue" href={`/application/${item.id}`}>
                      {item.status === "DRAFT" ? "Continue" : "View"}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            <div className="hidden overflow-x-auto sm:block">
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
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {item.companyName ?? "Untitled Draft"}
                      </td>
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
          </>
        ) : (
          <div className="px-4 py-10">
            <div className="mx-auto flex max-w-xl flex-col items-center gap-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-green/10">
                <img alt="innobiz-k Ethiopia" className="h-10 w-auto" src="/ink-logo.png" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-brand-slate">No applications yet</h4>
                <p className="mt-1 text-sm text-slate-600">
                  Start your first incubation application and save progress anytime.
                </p>
              </div>
              <Link className="btn-primary w-full sm:w-auto" href="/application/new">
                Start Application
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
