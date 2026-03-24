"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";

type ReportShareModalProps = {
  open: boolean;
  onClose: () => void;
  shareUrl: string | null;
  expiresAt?: string | null;
  loading?: boolean;
  onRefresh: () => void;
  onSendEmail: (recipients: string[]) => Promise<void>;
  emailSending?: boolean;
  emailError?: string | null;
  emailSuccess?: string | null;
};

const buildShareMessage = (shareUrl: string) =>
  `InnoBiz-K monthly report: ${shareUrl}?format=pdf`;

export function ReportShareModal({
  open,
  onClose,
  shareUrl,
  expiresAt,
  loading,
  onRefresh,
  onSendEmail,
  emailSending,
  emailError,
  emailSuccess,
}: ReportShareModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [recipients, setRecipients] = useState("");
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  const shareMessage = useMemo(() => (shareUrl ? buildShareMessage(shareUrl) : ""), [shareUrl]);

  useEffect(() => {
    if (!shareUrl) {
      setQrDataUrl(null);
      return;
    }

    QRCode.toDataURL(shareUrl, { width: 180, margin: 1 })
      .then((url: string) => setQrDataUrl(url))
      .catch(() => setQrDataUrl(null));
  }, [shareUrl]);

  if (!open) {
    return null;
  }

  const handleCopy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopyStatus("Link copied");
      setTimeout(() => setCopyStatus(null), 2000);
    } catch {
      setCopyStatus("Unable to copy link");
      setTimeout(() => setCopyStatus(null), 2000);
    }
  };

  const handleSendEmail = async () => {
    const list = recipients
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    if (list.length === 0) return;
    await onSendEmail(list);
  };

  const shareActions = shareUrl
    ? [
        {
          label: "WhatsApp",
          color: "bg-emerald-500",
          href: `https://wa.me/?text=${encodeURIComponent(shareMessage)}`,
        },
        {
          label: "Telegram",
          color: "bg-sky-500",
          href: `https://t.me/share/url?url=${encodeURIComponent(
            `${shareUrl}?format=pdf`,
          )}&text=${encodeURIComponent("InnoBiz-K monthly report")}`,
        },
        {
          label: "Email",
          color: "bg-slate-500",
          href: `mailto:?subject=${encodeURIComponent(
            "InnoBiz-K monthly report",
          )}&body=${encodeURIComponent(shareMessage)}`,
        },
        {
          label: "Copy link",
          color: "bg-brand-blue",
          onClick: handleCopy,
        },
        {
          label: "Print PDF",
          color: "bg-brand-ink",
          onClick: () => window.open(`${shareUrl}?format=pdf`, "_blank", "noopener,noreferrer"),
        },
      ]
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-6">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/70 bg-white/95 p-6 shadow-panel backdrop-blur-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold text-brand-ink">Share monthly report</h3>
            <p className="mt-1 text-sm text-slate-600">
              Send the report to staff through your preferred channels.
            </p>
          </div>
          <button className="btn-secondary px-3 py-2" onClick={onClose} type="button">
            Close
          </button>
        </div>

        <div className="mt-5 rounded-2xl border border-slate-200 bg-white px-4 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-700">Share link</p>
              <p className="mt-1 break-all text-xs text-slate-500">{shareUrl ?? "Not generated yet."}</p>
              {expiresAt ? (
                <p className="mt-1 text-xs text-slate-400">Expires: {new Date(expiresAt).toDateString()}</p>
              ) : null}
            </div>
            <button className="btn-primary" onClick={onRefresh} type="button" disabled={loading}>
              {loading ? "Generating..." : shareUrl ? "Refresh link" : "Generate link"}
            </button>
          </div>

          {copyStatus ? <p className="mt-2 text-xs font-semibold text-brand-blue">{copyStatus}</p> : null}
        </div>

        <div className="mt-5 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
            <p className="text-sm font-semibold text-slate-700">Quick share</p>
            <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
              {shareActions.map((action) =>
                action.href ? (
                  <a
                    className="flex min-w-[88px] flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-3 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-brand-blue/30 hover:bg-brand-blue/5"
                    href={action.href}
                    key={action.label}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <span
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl text-xs font-semibold text-white ${action.color}`}
                    >
                      {action.label.slice(0, 2)}
                    </span>
                    {action.label}
                  </a>
                ) : (
                  <button
                    className="flex min-w-[88px] flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-3 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-brand-blue/30 hover:bg-brand-blue/5"
                    key={action.label}
                    onClick={action.onClick}
                    type="button"
                  >
                    <span
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl text-xs font-semibold text-white ${action.color}`}
                    >
                      {action.label.slice(0, 2)}
                    </span>
                    {action.label}
                  </button>
                ),
              )}
            </div>

            <div className="mt-5">
              <p className="text-sm font-semibold text-slate-700">Share link</p>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                <input
                  className="input flex-1"
                  readOnly
                  value={shareUrl ?? ""}
                  placeholder="Generate a share link first."
                />
                <button className="btn-secondary px-4 py-3" onClick={handleCopy} type="button" disabled={!shareUrl}>
                  Copy
                </button>
              </div>
              {copyStatus ? <p className="mt-2 text-xs font-semibold text-brand-blue">{copyStatus}</p> : null}
            </div>

            <div className="mt-5">
              <p className="text-sm font-semibold text-slate-700">Download files</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {["pdf", "docx", "txt", "csv"].map((format) =>
                  shareUrl ? (
                    <a
                      className="btn-secondary px-3 py-2 text-xs"
                      href={`${shareUrl}?format=${format}`}
                      key={format}
                      rel="noreferrer"
                      target="_blank"
                    >
                      Download {format.toUpperCase()}
                    </a>
                  ) : (
                    <button
                      className="btn-secondary px-3 py-2 text-xs opacity-60"
                      key={format}
                      type="button"
                      disabled
                    >
                      Download {format.toUpperCase()}
                    </button>
                  ),
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
              <p className="text-sm font-semibold text-slate-700">Email report</p>
              <p className="mt-1 text-xs text-slate-500">
                Enter one or more emails separated by commas.
              </p>
              <input
                className="input mt-3"
                placeholder="admin@innobizk.et, manager@innobizk.et"
                value={recipients}
                onChange={(event) => setRecipients(event.target.value)}
              />
              <button
                className="btn-primary mt-3 w-full"
                onClick={handleSendEmail}
                type="button"
                disabled={!recipients.trim() || emailSending}
              >
                {emailSending ? "Sending..." : "Send email"}
              </button>
              {emailError ? <p className="mt-2 text-xs text-brand-red">{emailError}</p> : null}
              {emailSuccess ? <p className="mt-2 text-xs text-brand-blue">{emailSuccess}</p> : null}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-center">
              <p className="text-xs font-semibold text-slate-600">QR code</p>
              {qrDataUrl ? (
                <img alt="Report QR code" className="mx-auto mt-3 h-32 w-32 rounded-xl bg-white p-2" src={qrDataUrl} />
              ) : (
                <p className="mt-3 text-xs text-slate-400">Generate a share link to see the QR code.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
