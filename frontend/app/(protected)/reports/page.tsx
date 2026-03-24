"use client";

import { useEffect, useMemo, useState } from "react";
import { ApiHttpError, applicationApi } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { FilePicker } from "@/components/file-picker";
import { StatusBadge } from "@/components/status-badge";
import { formatDateTime } from "@/lib/format";
import { formatStatusLabel } from "@/lib/status";
import { InkLoader } from "@/components/ink-loader";
import type { Application, PaginatedApplications } from "@/types/api";

const allowedDocumentExtensions = [".pdf", ".doc", ".docx", ".ppt", ".pptx"];
const maxDocumentSize = 10 * 1024 * 1024;

const validateDocument = (file: File) => {
  const extension = `.${file.name.split(".").pop()?.toLowerCase() ?? ""}`;
  if (!allowedDocumentExtensions.includes(extension)) {
    return "Invalid file type. Allowed: PDF, DOC, DOCX, PPT, PPTX.";
  }
  if (file.size > maxDocumentSize) {
    return "File too large. Max size is 10MB.";
  }
  return null;
};

const formatReportMonth = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleString("en-US", { month: "long", year: "numeric" });
};

export default function MonthlyReportsPage() {
  const { token } = useAuth();
  const [applications, setApplications] = useState<PaginatedApplications | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [headline, setHeadline] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!token) {
      return;
    }
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await applicationApi.list(token, 1, 100);
        setApplications(response);
        if (!selectedId && response.items.length > 0) {
          setSelectedId(response.items[0].id);
        }
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
  }, [token, selectedId]);

  useEffect(() => {
    if (!token || !selectedId) {
      return;
    }
    const run = async () => {
      setDetailLoading(true);
      setError(null);
      try {
        const data = await applicationApi.getById(token, selectedId);
        setApplication(data);
      } catch (err) {
        if (err instanceof ApiHttpError) {
          setError(err.message);
        } else {
          setError("Unable to load monthly reports.");
        }
      } finally {
        setDetailLoading(false);
      }
    };
    void run();
  }, [token, selectedId]);

  const canSubmitMonthlyReport =
    application?.status === "SUBMITTED" || application?.status === "APPROVED";

  const selectedLabel = useMemo(() => {
    if (!application) return "Select application";
    return application.companyName ?? "Untitled Application";
  }, [application]);

  const uploadMonthlyReport = async () => {
    if (!token || !application) {
      throw new Error("Select an application first.");
    }
    if (!canSubmitMonthlyReport) {
      throw new Error("Monthly reports can only be submitted after the application is submitted or approved.");
    }
    if (!headline.trim()) {
      throw new Error("Monthly report headline is required.");
    }
    if (description.trim().length < 20) {
      throw new Error("Monthly report description must be at least 20 characters.");
    }
    if (!file) {
      throw new Error("Attach your monthly report document.");
    }

    const validationError = validateDocument(file);
    if (validationError) {
      throw new Error(validationError);
    }

    setUploading(true);
    setError(null);
    setMessage(null);
    try {
      const uploaded = await applicationApi.uploadMonthlyReport(token, application.id, {
        headline: headline.trim(),
        description: description.trim(),
        file,
      });
      setApplication((current) =>
        current
          ? {
              ...current,
              monthlyReports: [uploaded, ...current.monthlyReports],
            }
          : current,
      );
      setHeadline("");
      setDescription("");
      setFile(null);
      setMessage("Monthly report uploaded.");
    } finally {
      setUploading(false);
    }
  };

  const downloadMonthlyReport = async (reportId: string, fileName: string) => {
    if (!token || !application) {
      return;
    }
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api";
      const response = await fetch(
        `${base}/applications/${application.id}/monthly-reports/${reportId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-brand-slate">Monthly Reports</h2>
          <p className="text-sm text-slate-600">
            Upload your monthly progress report and keep the admin team up to date.
          </p>
        </div>
      </div>

      {loading ? (
        <InkLoader className="min-h-[40vh]" message="Loading applications..." size="md" />
      ) : error ? (
        <div className="rounded-xl border border-brand-red/20 bg-brand-red/10 px-4 py-3 text-sm font-medium text-brand-red">
          {error}
        </div>
      ) : null}

      {applications && applications.items.length > 0 ? (
        <div className="panel p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-700">Select application</p>
              <p className="text-xs text-slate-500">Reports are tied to each application.</p>
            </div>
            <select
              className="input max-w-sm"
              value={selectedId ?? ""}
              onChange={(event) => setSelectedId(event.target.value)}
            >
              {applications.items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.companyName ?? "Untitled"} • {formatStatusLabel(item.status)}
                </option>
              ))}
            </select>
          </div>
        </div>
      ) : null}

      {detailLoading ? (
        <InkLoader className="min-h-[30vh]" message="Loading report details..." size="sm" />
      ) : application ? (
        <>
          <div className="panel p-5 space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-brand-slate">{selectedLabel}</h3>
                <p className="text-xs text-slate-500">
                  Last updated {formatDateTime(application.updatedAt)}
                </p>
              </div>
              <StatusBadge status={application.status} />
            </div>

            {canSubmitMonthlyReport ? (
              <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Startup Headline
                    </label>
                    <input
                      className="input"
                      placeholder="Short headline about this month's progress"
                      value={headline}
                      onChange={(event) => setHeadline(event.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Progress Description
                    </label>
                    <textarea
                      className="input min-h-28"
                      placeholder="Summarize achievements, milestones, and challenges (min 20 chars)."
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                    />
                  </div>
                  <FilePicker
                    disabled={!canSubmitMonthlyReport}
                    file={file}
                    onClear={() => setFile(null)}
                    onPick={(picked) => {
                      const validationError = validateDocument(picked);
                      if (validationError) {
                        setError(validationError);
                        return;
                      }
                      setError(null);
                      setFile(picked);
                    }}
                    title="Monthly Report Upload"
                    subtitle="PDF / DOC / DOCX / PPT / PPTX, max 10MB"
                  />
                  <button
                    className="btn-primary w-full sm:w-auto"
                    disabled={uploading}
                    onClick={async () => {
                      setError(null);
                      setMessage(null);
                      try {
                        await uploadMonthlyReport();
                      } catch (err) {
                        if (err instanceof ApiHttpError || err instanceof Error) {
                          setError(err.message);
                        } else {
                          setError("Unable to upload monthly report.");
                        }
                      }
                    }}
                    type="button"
                  >
                    {uploading ? "Uploading..." : "Submit Monthly Report"}
                  </button>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  <p className="font-semibold text-slate-700">Monthly requirement</p>
                  <p className="mt-1">
                    Each month you must provide a headline, a progress summary, and a report document.
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-brand-blue/20 bg-brand-blue/10 px-4 py-3 text-sm text-brand-blue">
                Monthly reports can be submitted once your application is submitted or approved.
              </div>
            )}

            {message ? (
              <div className="rounded-xl border border-brand-green/20 bg-brand-green/10 px-4 py-3 text-sm font-medium text-brand-green">
                {message}
              </div>
            ) : null}
          </div>

          <div className="panel p-5">
            <h4 className="text-sm font-semibold text-slate-700">Submitted Reports</h4>
            {application.monthlyReports.length === 0 ? (
              <p className="text-sm text-slate-500">No monthly reports submitted yet.</p>
            ) : (
              <div className="mt-3 space-y-3">
                {application.monthlyReports.map((report) => (
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3" key={report.id}>
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
                ))}
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
