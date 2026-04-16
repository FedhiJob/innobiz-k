"use client";

import { useEffect, useMemo, useState } from "react";
import { adminApi, ApiHttpError } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { InkLoader } from "@/components/ink-loader";
import type { PaginatedSpaceRequests, SpaceRequest, SpaceRequestStatus } from "@/types/api";
import { formatDateTime } from "@/lib/format";

const statusOptions: Array<{ value: SpaceRequestStatus | "ALL"; label: string }> = [
  { value: "ALL", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
];

export default function AdminSpaceRequestsPage() {
  const { token } = useAuth();
  const [data, setData] = useState<PaginatedSpaceRequests | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<SpaceRequestStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchRequests = async () => {
    if (!token) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await adminApi.listSpaceRequests(token, {
        page: 1,
        pageSize: 30,
        status: status === "ALL" ? undefined : status,
        search: search.trim() || undefined,
      });
      setData(response);
    } catch (err) {
      if (err instanceof ApiHttpError) {
        setError(err.message);
      } else {
        setError("Unable to load space requests.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchRequests();
  }, [token, status]);

  const filteredItems = useMemo(() => {
    if (!data?.items) return [];
    if (!search.trim()) return data.items;
    const term = search.trim().toLowerCase();
    return data.items.filter(
      (item) =>
        item.startupName.toLowerCase().includes(term) ||
        item.contactName.toLowerCase().includes(term) ||
        item.email.toLowerCase().includes(term),
    );
  }, [data, search]);

  const handleApprove = async (request: SpaceRequest) => {
    if (!token) return;
    setActionLoading(request.id);
    setActionError(null);
    try {
      await adminApi.approveSpaceRequest(token, request.id);
      await fetchRequests();
    } catch (err) {
      if (err instanceof ApiHttpError) {
        setActionError(err.message);
      } else {
        setActionError("Unable to approve request.");
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (request: SpaceRequest) => {
    if (!token) return;
    const reason = window.prompt("Provide a rejection reason:");
    if (!reason || reason.trim().length < 3) {
      return;
    }
    setActionLoading(request.id);
    setActionError(null);
    try {
      await adminApi.rejectSpaceRequest(token, request.id, { rejectionReason: reason.trim() });
      await fetchRequests();
    } catch (err) {
      if (err instanceof ApiHttpError) {
        setActionError(err.message);
      } else {
        setActionError("Unable to reject request.");
      }
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-brand-ink">Space Requests</h2>
          <p className="text-sm text-slate-600">Review and manage workspace/resource requests.</p>
        </div>
      </div>

      <div className="panel p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                  status === option.value
                    ? "border-brand-blue bg-brand-blue/10 text-brand-blue"
                    : "border-slate-200 bg-white text-slate-600 hover:border-brand-blue/40 hover:text-brand-blue"
                }`}
                onClick={() => setStatus(option.value)}
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
          <input
            className="input max-w-xs"
            placeholder="Search by startup or email"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <InkLoader className="min-h-[40vh]" message="Loading space requests..." size="md" />
      ) : error ? (
        <div className="rounded-lg border border-brand-red/20 bg-brand-red/10 px-4 py-3 text-sm text-brand-red">
          {error}
        </div>
      ) : null}

      {actionError ? (
        <div className="rounded-lg border border-brand-red/20 bg-brand-red/10 px-4 py-3 text-sm text-brand-red">
          {actionError}
        </div>
      ) : null}

      {filteredItems.length === 0 && !loading ? (
        <div className="panel p-6 text-sm text-slate-600">No space requests found.</div>
      ) : null}

      <div className="space-y-4">
        {filteredItems.map((request) => (
          <div className="panel p-5" key={request.id}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-brand-ink">{request.startupName}</p>
                <p className="text-xs text-slate-500">
                  {request.contactName} - {request.email}
                </p>
                <p className="mt-1 text-xs text-slate-500">Submitted {formatDateTime(request.createdAt)}</p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  request.status === "APPROVED"
                    ? "bg-brand-green/10 text-brand-green"
                    : request.status === "REJECTED"
                      ? "bg-brand-red/10 text-brand-red"
                      : "bg-brand-yellow/15 text-brand-yellow"
                }`}
              >
                {request.status}
              </span>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-2 text-sm text-slate-600">
                <p>
                  <span className="font-semibold text-slate-700">Preferred space:</span>{" "}
                  {request.officeSpace?.name ?? request.officeSpaceName ?? "General request"}
                </p>
                <p>
                  <span className="font-semibold text-slate-700">Resources:</span>{" "}
                  {request.resourceTypes.join(", ")}
                </p>
                <p>
                  <span className="font-semibold text-slate-700">Duration:</span>{" "}
                  {formatDateTime(request.startDate)} to {formatDateTime(request.endDate)}
                </p>
                <p>
                  <span className="font-semibold text-slate-700">Purpose:</span> {request.purpose}
                </p>
                {request.additionalNotes ? (
                  <p>
                    <span className="font-semibold text-slate-700">Notes:</span> {request.additionalNotes}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                <button
                  className="btn-secondary w-full sm:w-auto"
                  disabled={actionLoading === request.id || request.status !== "PENDING"}
                  onClick={() => handleApprove(request)}
                  type="button"
                >
                  {actionLoading === request.id ? "Updating..." : "Approve"}
                </button>
                <button
                  className="btn-danger w-full sm:w-auto"
                  disabled={actionLoading === request.id || request.status !== "PENDING"}
                  onClick={() => handleReject(request)}
                  type="button"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


