"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { adminApi, ApiHttpError } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { formatDateTime } from "@/lib/format";
import { formatStatusLabel } from "@/lib/status";
import { StatusBadge } from "@/components/status-badge";
import { InkLoader } from "@/components/ink-loader";
import type { AdminApplicationDetail } from "@/types/api";

export default function AdminApplicationDetailPage({ params }: { params: { id: string } }) {
  const { token } = useAuth();
  const router = useRouter();
  const [application, setApplication] = useState<AdminApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isApproveOpen, setApproveOpen] = useState(false);
  const [isRejectOpen, setRejectOpen] = useState(false);
  const [approveNotes, setApproveNotes] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [rejectNotes, setRejectNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      return;
    }

    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await adminApi.getApplication(token, params.id);
        setApplication(data);
      } catch (err) {
        if (err instanceof ApiHttpError) {
          setError(err.message);
        } else {
          setError("Unable to load application.");
        }
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [token, params.id]);

  const canReview = application?.status === "SUBMITTED";
  const formatReportMonth = (value: string) => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return value;
    }
    return parsed.toLocaleString("en-US", { month: "long", year: "numeric" });
  };
  const formatSupportInterest = (value: string) =>
    value
      .toLowerCase()
      .split("_")
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(" ");

  const downloadDocument = async (docId: string, fileName: string) => {
    if (!token) {
      return;
    }
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api";
      const response = await fetch(`${base}/applications/${params.id}/documents/${docId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Download failed");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setError("Unable to download file.");
    }
  };

  const downloadMonthlyReport = async (reportId: string, fileName: string) => {
    if (!token) {
      return;
    }
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api";
      const response = await fetch(`${base}/applications/${params.id}/monthly-reports/${reportId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Download failed");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setError("Unable to download monthly report.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-brand-ink">Application Review</h2>
          <p className="text-sm text-slate-600">Review startup details and take decision actions.</p>
        </div>
        <Link className="btn-secondary" href="/admin/applications">
          Back
        </Link>
      </div>

      {loading ? <InkLoader className="min-h-[40vh]" message="Loading application..." size="md" /> : null}
      {error ? (
        <div className="rounded-lg border border-brand-red/20 bg-brand-red/10 px-4 py-3 text-sm text-brand-red">
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="rounded-lg border border-brand-green/20 bg-brand-green/10 px-4 py-3 text-sm text-brand-green">
          {success}
        </div>
      ) : null}

      {application ? (
        <>
          <div className="panel p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-semibold text-brand-ink">{application.companyName ?? "Untitled"}</h3>
                <p className="text-sm text-slate-600">
                  Startup: {application.startup.name} ({application.startup.email})
                </p>
              </div>
              <StatusBadge status={application.status} />
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs font-semibold uppercase text-slate-500">Sector</p>
                <p className="text-sm text-slate-800">{application.sector ?? "-"}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs font-semibold uppercase text-slate-500">Stage</p>
                <p className="text-sm text-slate-800">{application.stage ?? "-"}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs font-semibold uppercase text-slate-500">Team Size</p>
                <p className="text-sm text-slate-800">{application.teamSize ?? "-"}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3 sm:col-span-2">
                <p className="text-xs font-semibold uppercase text-slate-500">Support Interests</p>
                {application.supportInterests.length === 0 ? (
                  <p className="text-sm text-slate-800">-</p>
                ) : (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {application.supportInterests.map((interest) => (
                      <span
                        className="rounded-full border border-brand-blue/20 bg-brand-blue/10 px-2.5 py-1 text-xs font-semibold text-brand-blue"
                        key={interest}
                      >
                        {formatSupportInterest(interest)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 rounded-lg bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase text-slate-500">Description</p>
              <p className="mt-1 text-sm text-slate-800">{application.description ?? "-"}</p>
            </div>
          </div>

          <div className="panel p-5">
            <h3 className="text-lg font-semibold text-brand-ink">Founders</h3>
            <div className="mt-3 grid gap-3">
              {application.founders.map((founder) => (
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3" key={founder.id}>
                  <p className="text-sm font-semibold text-slate-800">
                    {founder.name} {founder.isPrimary ? "(Primary)" : ""}
                  </p>
                  <p className="text-xs text-slate-600">
                    {founder.email} - {founder.role} - {founder.phone || "-"}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="panel p-5">
            <h3 className="text-lg font-semibold text-brand-ink">Documents</h3>
            <div className="mt-3 space-y-2">
              {application.documents.length === 0 ? (
                <p className="text-sm text-slate-600">No uploaded documents.</p>
              ) : (
                application.documents.map((document) => (
                  <div
                    className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                    key={document.id}
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-800">{document.fileName}</p>
                      <p className="text-xs text-slate-600">{(document.fileSize / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button
                      className="btn-secondary w-full sm:w-auto"
                      onClick={() => void downloadDocument(document.id, document.fileName)}
                      type="button"
                    >
                      Download
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="panel p-5">
            <h3 className="text-lg font-semibold text-brand-ink">Monthly Reports</h3>
            <p className="mt-1 text-sm text-slate-600">
              Startup headline and progress summaries appear here for monthly review.
            </p>
            <div className="mt-3 space-y-3">
              {application.monthlyReports.length === 0 ? (
                <p className="text-sm text-slate-600">No monthly reports submitted yet.</p>
              ) : (
                application.monthlyReports.map((report) => (
                  <div
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
                    key={report.id}
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{report.headline}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {formatReportMonth(report.reportMonth)} • {report.fileName}
                        </p>
                        <p className="mt-2 text-sm text-slate-600">{report.description}</p>
                      </div>
                      <button
                        className="btn-secondary w-full sm:w-auto"
                        onClick={() => void downloadMonthlyReport(report.id, report.fileName)}
                        type="button"
                      >
                        Download
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="panel p-5">
            <h3 className="text-lg font-semibold text-brand-ink">Status Timeline</h3>
            <div className="mt-3 space-y-2">
              {application.statusHistory.map((entry) => (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3" key={entry.id}>
                  <p className="text-sm font-medium text-slate-800">
                    {formatStatusLabel(entry.fromStatus)} {"->"} {formatStatusLabel(entry.toStatus)}
                  </p>
                  <p className="text-xs text-slate-600">{entry.note ?? "No note"}</p>
                  <p className="text-xs text-slate-500">{formatDateTime(entry.changedAt)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="panel p-5">
            <h3 className="text-lg font-semibold text-brand-ink">Review Actions</h3>
            <p className="mt-1 text-sm text-slate-600">
              Only submitted applications can be approved or rejected.
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
              <button
                className="btn-primary w-full sm:w-auto"
                disabled={!canReview}
                onClick={() => setApproveOpen(true)}
                type="button"
              >
                Approve
              </button>
              <button
                className="btn-danger w-full sm:w-auto"
                disabled={!canReview}
                onClick={() => setRejectOpen(true)}
                type="button"
              >
                Reject
              </button>
            </div>
            {application.adminNotes ? (
              <p className="mt-3 text-sm text-slate-700">
                <span className="font-semibold">Admin Notes:</span> {application.adminNotes}
              </p>
            ) : null}
            {application.rejectionReason ? (
              <p className="mt-2 text-sm text-brand-red">
                <span className="font-semibold">Rejection Reason:</span> {application.rejectionReason}
              </p>
            ) : null}
          </div>

          {isApproveOpen ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
              <div className="panel w-full max-w-lg p-5">
                <h4 className="text-lg font-semibold text-brand-ink">Approve Application</h4>
                <p className="text-sm text-slate-600">Optional notes will be stored with the approval decision.</p>
                <textarea
                  className="input mt-3 min-h-28"
                  onChange={(event) => setApproveNotes(event.target.value)}
                  placeholder="Admin notes (optional)"
                  value={approveNotes}
                />
                <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <button className="btn-secondary w-full sm:w-auto" onClick={() => setApproveOpen(false)} type="button">
                    Cancel
                  </button>
                  <button
                    className="btn-primary w-full sm:w-auto"
                    disabled={actionLoading}
                    onClick={async () => {
                      if (!token) {
                        return;
                      }
                      setActionLoading(true);
                      setError(null);
                      try {
                        const updated = await adminApi.approveApplication(token, params.id, {
                          adminNotes: approveNotes.trim() || undefined,
                        });
                        setApplication((current) =>
                          current
                            ? {
                                ...current,
                                ...updated,
                              }
                            : current,
                        );
                        setSuccess("Application approved.");
                        setApproveOpen(false);
                      } catch (err) {
                        if (err instanceof ApiHttpError) {
                          setError(err.message);
                        } else {
                          setError("Unable to approve application.");
                        }
                      } finally {
                        setActionLoading(false);
                      }
                    }}
                    type="button"
                  >
                    Confirm Approve
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {isRejectOpen ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
              <div className="panel w-full max-w-lg p-5">
                <h4 className="text-lg font-semibold text-brand-ink">Reject Application</h4>
                <p className="text-sm text-slate-600">Rejection reason is required.</p>
                <textarea
                  className="input mt-3 min-h-24"
                  onChange={(event) => setRejectReason(event.target.value)}
                  placeholder="Rejection reason"
                  value={rejectReason}
                />
                <textarea
                  className="input mt-3 min-h-24"
                  onChange={(event) => setRejectNotes(event.target.value)}
                  placeholder="Admin notes (optional)"
                  value={rejectNotes}
                />
                <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <button className="btn-secondary w-full sm:w-auto" onClick={() => setRejectOpen(false)} type="button">
                    Cancel
                  </button>
                  <button
                    className="btn-danger w-full sm:w-auto"
                    disabled={actionLoading || rejectReason.trim().length < 3}
                    onClick={async () => {
                      if (!token) {
                        return;
                      }
                      setActionLoading(true);
                      setError(null);
                      try {
                        const updated = await adminApi.rejectApplication(token, params.id, {
                          rejectionReason: rejectReason.trim(),
                          adminNotes: rejectNotes.trim() || undefined,
                        });
                        setApplication((current) =>
                          current
                            ? {
                                ...current,
                                ...updated,
                              }
                            : current,
                        );
                        setSuccess("Application rejected.");
                        setRejectOpen(false);
                      } catch (err) {
                        if (err instanceof ApiHttpError) {
                          setError(err.message);
                        } else {
                          setError("Unable to reject application.");
                        }
                      } finally {
                        setActionLoading(false);
                      }
                    }}
                    type="button"
                  >
                    Confirm Reject
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </>
      ) : null}

      <div className="pt-2">
        <button className="btn-secondary" onClick={() => router.push("/admin/applications")} type="button">
          Back to List
        </button>
      </div>
    </div>
  );
}
