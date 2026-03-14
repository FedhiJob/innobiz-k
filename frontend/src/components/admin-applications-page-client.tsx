"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { adminApi, ApiHttpError } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { formatDateTime } from "@/lib/format";
import { StatusBadge } from "@/components/status-badge";
import { InkLoader } from "@/components/ink-loader";
import type { ApplicationStatus, PaginatedAdminApplications } from "@/types/api";

const statusOptions: Array<{ label: string; value: "" | ApplicationStatus }> = [
  { label: "All", value: "" },
  { label: "Draft", value: "DRAFT" },
  { label: "Submitted", value: "SUBMITTED" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
];

export const AdminApplicationsPageClient = () => {
  const { token } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") || "1");
  const status = (searchParams.get("status") || "") as "" | ApplicationStatus;
  const search = searchParams.get("search") || "";

  const [inputSearch, setInputSearch] = useState(search);
  const [data, setData] = useState<PaginatedAdminApplications | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setInputSearch(search);
  }, [search]);

  useEffect(() => {
    if (!token) {
      return;
    }

    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await adminApi.listApplications(token, {
          page,
          pageSize: 10,
          status: status || undefined,
          search: search || undefined,
        });
        setData(response);
      } catch (err) {
        if (err instanceof ApiHttpError) {
          setError(err.message);
        } else {
          setError("Unable to fetch applications.");
        }
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [token, page, status, search]);

  const updateQuery = (params: Record<string, string | number | undefined>) => {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === "") {
        next.delete(key);
      } else {
        next.set(key, String(value));
      }
    });
    router.push(`/admin/applications?${next.toString()}`);
  };

  const totalPages = useMemo(() => data?.pagination.totalPages || 1, [data]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-brand-ink">Applications</h2>
        <p className="text-sm text-slate-600">Search, filter, and review startup submissions.</p>
      </div>

      <div className="panel p-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <input
            className="input sm:col-span-2"
            onChange={(event) => setInputSearch(event.target.value)}
            placeholder="Search by company/startup/founder email"
            value={inputSearch}
          />
          <select
            className="input"
            onChange={(event) => updateQuery({ status: event.target.value || undefined, page: 1 })}
            value={status}
          >
            {statusOptions.map((option) => (
              <option key={option.label} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <button
            className="btn-primary w-full sm:w-auto"
            onClick={() =>
              updateQuery({
                search: inputSearch.trim().length >= 2 ? inputSearch.trim() : undefined,
                page: 1,
              })
            }
            type="button"
          >
            Apply
          </button>
          <button
            className="btn-secondary w-full sm:w-auto"
            onClick={() => {
              setInputSearch("");
              router.push("/admin/applications");
            }}
            type="button"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="panel overflow-hidden">
        {loading ? (
          <div className="px-4 py-8">
            <InkLoader message="Loading applications..." size="sm" />
          </div>
        ) : error ? (
          <div className="px-4 py-5 text-sm font-medium text-brand-red">{error}</div>
        ) : data && data.items.length > 0 ? (
          <>
            <div className="space-y-3 px-4 py-4 sm:hidden">
              {data.items.map((item) => (
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm" key={item.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{item.companyName ?? "Untitled"}</p>
                      <p className="text-xs text-slate-500">{item.startup.email}</p>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <span>Submitted {formatDateTime(item.submittedAt)}</span>
                    <Link className="text-sm font-semibold text-brand-blue" href={`/admin/applications/${item.id}`}>
                      View
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
                    <th className="px-4 py-3">Startup</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Submitted</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((item) => (
                    <tr className="border-t border-slate-100" key={item.id}>
                      <td className="px-4 py-3 font-medium text-slate-800">{item.companyName ?? "Untitled"}</td>
                      <td className="px-4 py-3 text-slate-700">{item.startup.email}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-4 py-3 text-slate-600">{formatDateTime(item.submittedAt)}</td>
                      <td className="px-4 py-3">
                        <Link className="font-semibold text-brand-blue" href={`/admin/applications/${item.id}`}>
                          View
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
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-blue/10">
                <img alt="InnoBiz-K Ethiopia" className="h-10 w-auto" src="/ink-logo.png" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-brand-ink">No applications found</h4>
                <p className="mt-1 text-sm text-slate-600">
                  Try adjusting your filters or clear the search to see all submissions.
                </p>
              </div>
              <button
                className="btn-secondary w-full sm:w-auto"
                onClick={() => {
                  setInputSearch("");
                  router.push("/admin/applications");
                }}
                type="button"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-600">
          Page {data?.pagination.page ?? page} of {totalPages}
        </p>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <button
            className="btn-secondary w-full sm:w-auto"
            disabled={page <= 1}
            onClick={() => updateQuery({ page: Math.max(1, page - 1) })}
            type="button"
          >
            Previous
          </button>
          <button
            className="btn-secondary w-full sm:w-auto"
            disabled={page >= totalPages}
            onClick={() => updateQuery({ page: Math.min(totalPages, page + 1) })}
            type="button"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
