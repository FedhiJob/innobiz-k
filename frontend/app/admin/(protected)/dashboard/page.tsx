"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { adminApi, ApiHttpError } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { StatusBadge } from "@/components/status-badge";
import { formatDateTime } from "@/lib/format";
import { InkLoader } from "@/components/ink-loader";
import { resolveHeroUpdateMediaUrl } from "@/lib/media";
import { ReportShareModal } from "@/components/report-share-modal";
import type { AdminStats, HeroUpdate, PaginatedAdminApplications } from "@/types/api";

export default function AdminDashboardPage() {
  const { token } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recent, setRecent] = useState<PaginatedAdminApplications["items"]>([]);
  const [updates, setUpdates] = useState<HeroUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareExpiresAt, setShareExpiresAt] = useState<string | null>(null);
  const [shareLoading, setShareLoading] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);
  const [updateTitle, setUpdateTitle] = useState("");
  const [updateMessage, setUpdateMessage] = useState("");
  const [updateCtaLabel, setUpdateCtaLabel] = useState("");
  const [updateCtaUrl, setUpdateCtaUrl] = useState("");
  const [updatePublished, setUpdatePublished] = useState(true);
  const [updateMedia, setUpdateMedia] = useState<File | null>(null);
  const [updateSaving, setUpdateSaving] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      return;
    }

    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const [statsRes, recentRes, updatesRes] = await Promise.all([
          adminApi.stats(token),
          adminApi.listApplications(token, { page: 1, pageSize: 10 }),
          adminApi.listHeroUpdates(token),
        ]);
        setStats(statsRes);
        setRecent(recentRes.items);
        setUpdates(updatesRes);
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

  const generateShareLink = async () => {
    if (!token) {
      return;
    }

    setShareLoading(true);
    setEmailError(null);
    setEmailSuccess(null);
    try {
      const response = await adminApi.createMonthlyReportShare(token);
      setShareUrl(response.shareUrl);
      setShareExpiresAt(response.expiresAt);
    } catch (err) {
      if (err instanceof ApiHttpError) {
        setEmailError(err.message);
      } else {
        setEmailError("Unable to generate report link.");
      }
    } finally {
      setShareLoading(false);
    }
  };

  const handleOpenShare = () => {
    setShareOpen(true);
    if (!shareUrl && !shareLoading) {
      void generateShareLink();
    }
  };

  const handleSendEmail = async (recipients: string[]) => {
    if (!token) {
      return;
    }

    setEmailSending(true);
    setEmailError(null);
    setEmailSuccess(null);
    try {
      const response = await adminApi.emailMonthlyReport(token, {
        recipients,
        format: "pdf",
      });
      setShareUrl(response.shareUrl);
      setShareExpiresAt(response.expiresAt);
      setEmailSuccess("Report sent successfully.");
    } catch (err) {
      if (err instanceof ApiHttpError) {
        setEmailError(err.message);
      } else {
        setEmailError("Unable to send report email.");
      }
    } finally {
      setEmailSending(false);
    }
  };

  const resetUpdateForm = () => {
    setUpdateTitle("");
    setUpdateMessage("");
    setUpdateCtaLabel("");
    setUpdateCtaUrl("");
    setUpdatePublished(true);
    setUpdateMedia(null);
    setEditingId(null);
  };

  const reloadUpdates = async () => {
    if (!token) {
      return;
    }
    try {
      const updatesRes = await adminApi.listHeroUpdates(token);
      setUpdates(updatesRes);
    } catch (err) {
      if (err instanceof ApiHttpError) {
        setUpdateError(err.message);
      } else {
        setUpdateError("Unable to load hero updates.");
      }
    }
  };

  const handleSaveUpdate = async () => {
    if (!token) {
      return;
    }
    setUpdateSaving(true);
    setUpdateError(null);
    setUpdateSuccess(null);

    const rawLabel = updateCtaLabel.trim();
    const rawUrl = updateCtaUrl.trim();
    let normalizedLabel = rawLabel;
    let normalizedUrl: string | null | undefined = undefined;

    if (rawUrl) {
      if (/^https?:\/\//i.test(rawUrl)) {
        normalizedUrl = rawUrl;
      } else if (rawUrl.includes(".")) {
        normalizedUrl = `https://${rawUrl}`;
      } else if (!normalizedLabel) {
        normalizedLabel = rawUrl;
      }
    }

    try {
      if (editingId) {
        await adminApi.updateHeroUpdate(token, editingId, {
          title: updateTitle.trim(),
          message: updateMessage.trim(),
          ctaLabel: normalizedLabel ? normalizedLabel : null,
          ctaUrl: normalizedUrl ?? null,
          published: updatePublished,
          media: updateMedia,
        });
        setUpdateSuccess("Hero update updated.");
      } else {
        await adminApi.createHeroUpdate(token, {
          title: updateTitle.trim(),
          message: updateMessage.trim(),
          ctaLabel: normalizedLabel || undefined,
          ctaUrl: normalizedUrl ?? undefined,
          published: updatePublished,
          media: updateMedia,
        });
        setUpdateSuccess("Hero update published.");
      }
      resetUpdateForm();
      await reloadUpdates();
    } catch (err) {
      if (err instanceof ApiHttpError) {
        setUpdateError(err.message);
      } else {
        setUpdateError("Unable to save hero update.");
      }
    } finally {
      setUpdateSaving(false);
    }
  };

  const handleEditUpdate = (update: HeroUpdate) => {
    setEditingId(update.id);
    setUpdateTitle(update.title);
    setUpdateMessage(update.message);
    setUpdateCtaLabel(update.ctaLabel ?? "");
    setUpdateCtaUrl(update.ctaUrl ?? "");
    setUpdatePublished(update.published);
    setUpdateMedia(null);
  };

  const handleTogglePublish = async (update: HeroUpdate) => {
    if (!token) {
      return;
    }
    try {
      await adminApi.updateHeroUpdate(token, update.id, { published: !update.published });
      await reloadUpdates();
    } catch (err) {
      if (err instanceof ApiHttpError) {
        setUpdateError(err.message);
      } else {
        setUpdateError("Unable to update publish status.");
      }
    }
  };

  const handleDeleteUpdate = async (update: HeroUpdate) => {
    if (!token) {
      return;
    }
    const confirmed = window.confirm("Delete this hero update?");
    if (!confirmed) {
      return;
    }
    try {
      await adminApi.deleteHeroUpdate(token, update.id);
      await reloadUpdates();
    } catch (err) {
      if (err instanceof ApiHttpError) {
        setUpdateError(err.message);
      } else {
        setUpdateError("Unable to delete hero update.");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-brand-ink">Admin Dashboard</h2>
          <p className="text-sm text-slate-600">Review queue and decision metrics.</p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <button className="btn-secondary w-full sm:w-auto" onClick={handleOpenShare} type="button">
            Share Monthly Report
          </button>
          <Link className="btn-secondary w-full sm:w-auto" href="/admin/office-spaces">
            Manage Spaces
          </Link>
          <Link className="btn-primary w-full sm:w-auto" href="/admin/applications?status=SUBMITTED">
            Open Review Queue
          </Link>
        </div>
      </div>

      {loading ? (
        <InkLoader className="min-h-[40vh]" message="Loading dashboard..." size="md" />
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

      <div className="panel space-y-4 p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-brand-ink">Hero Updates Feed</h3>
            <p className="text-sm text-slate-600">
              Post updates that appear on the public homepage hero section.
            </p>
          </div>
          {editingId ? (
            <button className="btn-secondary w-full sm:w-auto" onClick={resetUpdateForm} type="button">
              Cancel Edit
            </button>
          ) : null}
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="hero-title">
                Title
              </label>
              <input
                className="input"
                id="hero-title"
                maxLength={140}
                onChange={(event) => setUpdateTitle(event.target.value)}
                value={updateTitle}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="hero-message">
                Message
              </label>
              <textarea
                className="input min-h-[120px] resize-none"
                id="hero-message"
                maxLength={1000}
                onChange={(event) => setUpdateMessage(event.target.value)}
                value={updateMessage}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="hero-cta-label">
                  CTA label (optional)
                </label>
                <input
                  className="input"
                  id="hero-cta-label"
                  onChange={(event) => setUpdateCtaLabel(event.target.value)}
                  value={updateCtaLabel}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="hero-cta-url">
                  CTA URL (optional)
                </label>
                <input
                  className="input"
                  id="hero-cta-url"
                  onChange={(event) => setUpdateCtaUrl(event.target.value)}
                  value={updateCtaUrl}
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="hero-media">
                Upload photo or video (optional)
              </label>
              <input
                accept="image/*,video/*"
                className="input file:mr-4 file:rounded-full file:border-0 file:bg-brand-blue/10 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-brand-blue hover:file:bg-brand-blue/20"
                id="hero-media"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  setUpdateMedia(file);
                }}
                type="file"
              />
              <p className="mt-1 text-xs text-slate-500">Accepted: JPG, PNG, WEBP, GIF, MP4, WEBM, MOV up to 25MB.</p>
            </div>
            <label className="flex items-center gap-3 text-sm text-slate-700">
              <input
                checked={updatePublished}
                className="h-4 w-4 accent-brand-blue"
                onChange={(event) => setUpdatePublished(event.target.checked)}
                type="checkbox"
              />
              Publish immediately
            </label>

            {updateError ? (
              <div className="rounded-lg border border-brand-red/20 bg-brand-red/10 px-3 py-2 text-sm text-brand-red">
                {updateError}
              </div>
            ) : null}
            {updateSuccess ? (
              <div className="rounded-lg border border-brand-green/20 bg-brand-green/10 px-3 py-2 text-sm text-brand-green">
                {updateSuccess}
              </div>
            ) : null}

            <button
              className="btn-primary w-full sm:w-auto"
              disabled={updateSaving || !updateTitle.trim() || !updateMessage.trim()}
              onClick={handleSaveUpdate}
              type="button"
            >
              {updateSaving ? "Saving..." : editingId ? "Save Update" : "Publish Update"}
            </button>
          </div>

          <div className="space-y-3">
            {updates.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-600">
                No hero updates yet. Create the first update to populate the homepage hero feed.
              </div>
            ) : (
              updates.map((update) => (
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3" key={update.id}>
                  {(() => {
                    const resolvedMediaUrl = resolveHeroUpdateMediaUrl(update);

                    return (
                      <>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-brand-ink">{update.title}</p>
                      <p className="mt-1 text-xs text-slate-500">{formatDateTime(update.createdAt)}</p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        update.published
                          ? "bg-brand-green/10 text-brand-green"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {update.published ? "Published" : "Hidden"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600 line-clamp-3">{update.message}</p>
                  {resolvedMediaUrl ? (
                    <div className="mt-3 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
                      {update.mediaType === "VIDEO" ? (
                        <video className="h-40 w-full object-cover" controls src={resolvedMediaUrl} />
                      ) : (
                        <img alt={update.title} className="h-40 w-full object-cover" src={resolvedMediaUrl} />
                      )}
                    </div>
                  ) : null}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      className="btn-secondary px-3 py-1.5 text-xs"
                      onClick={() => handleEditUpdate(update)}
                      type="button"
                    >
                      Edit
                    </button>
                    <button
                      className="btn-secondary px-3 py-1.5 text-xs"
                      onClick={() => handleTogglePublish(update)}
                      type="button"
                    >
                      {update.published ? "Hide" : "Publish"}
                    </button>
                    <button
                      className="btn-danger px-3 py-1.5 text-xs"
                      onClick={() => handleDeleteUpdate(update)}
                      type="button"
                    >
                      Delete
                    </button>
                  </div>
                      </>
                    );
                  })()}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="panel overflow-hidden">
        <div className="border-b border-slate-200 px-4 py-3">
          <h3 className="text-lg font-semibold text-brand-ink">Recent Applications</h3>
        </div>
        {recent.length === 0 ? (
          <div className="px-4 py-10">
            <div className="mx-auto flex max-w-xl flex-col items-center gap-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-blue/10">
                <img alt="innobiz-k Ethiopia" className="h-10 w-auto" src="/ink-logo.png" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-brand-ink">No recent applications</h4>
                <p className="mt-1 text-sm text-slate-600">
                  New submissions will appear here as startups complete their applications.
                </p>
              </div>
              <Link className="btn-secondary w-full sm:w-auto" href="/admin/applications?status=SUBMITTED">
                View Review Queue
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-3 px-4 py-4 sm:hidden">
              {recent.map((item) => (
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
                      Review
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
          </>
        )}
      </div>

      <ReportShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        shareUrl={shareUrl}
        expiresAt={shareExpiresAt}
        loading={shareLoading}
        onRefresh={generateShareLink}
        onSendEmail={handleSendEmail}
        emailSending={emailSending}
        emailError={emailError}
        emailSuccess={emailSuccess}
      />
    </div>
  );
}
