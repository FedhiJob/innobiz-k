"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiHttpError, applicationApi } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { StepIndicator } from "@/components/step-indicator";
import { FilePicker } from "@/components/file-picker";
import { StatusBadge } from "@/components/status-badge";
import { formatDateTime } from "@/lib/format";
import type { Application, FounderInput } from "@/types/api";

interface FounderDraft {
  name: string;
  email: string;
  phone: string;
  role: string;
  isPrimary: boolean;
}

const createEmptyFounder = (isPrimary = false): FounderDraft => ({
  name: "",
  email: "",
  phone: "",
  role: "",
  isPrimary,
});

export const ApplicationWizard = ({ initialApplicationId }: { initialApplicationId?: string }) => {
  const router = useRouter();
  const { token } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [applicationId, setApplicationId] = useState<string | null>(initialApplicationId ?? null);
  const [status, setStatus] = useState<Application["status"] | null>(null);
  const [loading, setLoading] = useState(Boolean(initialApplicationId));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [companyName, setCompanyName] = useState("");
  const [sector, setSector] = useState("");
  const [stage, setStage] = useState("");
  const [description, setDescription] = useState("");
  const [founders, setFounders] = useState<FounderDraft[]>([createEmptyFounder(true)]);
  const [teamSize, setTeamSize] = useState("");
  const [fundingNeeded, setFundingNeeded] = useState("");
  const [documents, setDocuments] = useState<Application["documents"]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [statusHistory, setStatusHistory] = useState<Application["statusHistory"]>([]);
  const [reviewNotes, setReviewNotes] = useState<{ adminNotes: string | null; rejectionReason: string | null }>({
    adminNotes: null,
    rejectionReason: null,
  });

  const isReadOnly = status !== null && status !== "DRAFT";

  useEffect(() => {
    if (!token || !initialApplicationId) {
      return;
    }

    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const application = await applicationApi.getById(token, initialApplicationId);
        hydrateFromApplication(application);
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
  }, [token, initialApplicationId]);

  const hydrateFromApplication = (application: Application) => {
    setApplicationId(application.id);
    setStatus(application.status);
    setCompanyName(application.companyName ?? "");
    setSector(application.sector ?? "");
    setStage(application.stage ?? "");
    setDescription(application.description ?? "");
    setTeamSize(application.teamSize ? String(application.teamSize) : "");
    setFundingNeeded(application.fundingNeeded ?? "");
    setDocuments(application.documents);
    setStatusHistory(application.statusHistory);
    setReviewNotes({
      adminNotes: application.adminNotes,
      rejectionReason: application.rejectionReason,
    });

    if (application.founders.length > 0) {
      setFounders(
        application.founders.map((founder) => ({
          name: founder.name,
          email: founder.email,
          phone: founder.phone ?? "",
          role: founder.role,
          isPrimary: founder.isPrimary,
        })),
      );
    } else {
      setFounders([createEmptyFounder(true)]);
    }
  };

  const buildFoundersForApi = (strict: boolean): FounderInput[] | undefined => {
    const normalized = founders.map((founder) => ({
      name: founder.name.trim(),
      email: founder.email.trim(),
      phone: founder.phone.trim(),
      role: founder.role.trim(),
      isPrimary: founder.isPrimary,
    }));

    const touched = normalized.filter(
      (founder) => founder.name || founder.email || founder.phone || founder.role,
    );
    const complete = touched.filter((founder) => founder.name && founder.email && founder.role);

    if (!strict) {
      if (complete.length === 0) {
        return undefined;
      }
      return complete.map((founder, index) => ({
        ...founder,
        phone: founder.phone || undefined,
        isPrimary: founder.isPrimary || index === 0,
      }));
    }

    if (touched.length === 0) {
      throw new Error("Add at least one founder before submission.");
    }
    if (touched.length !== complete.length) {
      throw new Error("Each founder must include name, email, and role.");
    }
    if (complete.length < 1 || complete.length > 3) {
      throw new Error("You must provide between 1 and 3 founders.");
    }

    const primaryCount = complete.filter((founder) => founder.isPrimary).length;
    if (primaryCount !== 1) {
      throw new Error("Mark exactly one founder as primary.");
    }

    return complete.map((founder) => ({
      ...founder,
      phone: founder.phone || undefined,
    }));
  };

  const buildPayload = (strictFounders: boolean) => {
    const parsedTeamSize = Number(teamSize);
    const parsedFunding = Number(fundingNeeded);

    return {
      companyName: companyName.trim() || undefined,
      sector: sector.trim() || undefined,
      stage: stage.trim() || undefined,
      description: description.trim() || undefined,
      teamSize: Number.isFinite(parsedTeamSize) && parsedTeamSize > 0 ? parsedTeamSize : undefined,
      fundingNeeded: Number.isFinite(parsedFunding) && parsedFunding > 0 ? parsedFunding : undefined,
      founders: buildFoundersForApi(strictFounders),
    };
  };

  const validateForStep = (targetStep: 2 | 3) => {
    if (targetStep === 2) {
      if (!companyName.trim() || !sector.trim() || !stage.trim() || description.trim().length < 20) {
        throw new Error("Complete Step 1 before moving forward.");
      }
    }

    if (targetStep === 3) {
      buildFoundersForApi(true);
    }
  };

  const saveDraft = async (strictFounders = false) => {
    if (!token) {
      throw new Error("Not authenticated");
    }

    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const payload = buildPayload(strictFounders);
      const saved = applicationId
        ? await applicationApi.updateDraft(token, applicationId, payload)
        : await applicationApi.createDraft(token, payload);

      hydrateFromApplication(saved);
      if (!applicationId) {
        router.replace(`/application/${saved.id}`);
      }
      setMessage("Draft saved.");
      return saved.id;
    } finally {
      setSaving(false);
    }
  };

  const uploadPendingFile = async () => {
    if (!selectedFile) {
      throw new Error("Choose a file before uploading.");
    }
    if (!token) {
      throw new Error("Not authenticated");
    }

    setUploading(true);
    setError(null);
    setMessage(null);
    try {
      const id = applicationId ?? (await saveDraft(false));
      const uploaded = await applicationApi.uploadDocument(token, id, selectedFile);
      setDocuments((current) => [uploaded, ...current]);
      setSelectedFile(null);
      setMessage("Document uploaded.");
    } finally {
      setUploading(false);
    }
  };

  const submitApplication = async () => {
    if (!token) {
      throw new Error("Not authenticated");
    }

    setSubmitting(true);
    setError(null);
    setMessage(null);
    try {
      if (!companyName.trim() || !sector.trim() || !stage.trim() || description.trim().length < 20) {
        throw new Error("Complete company information before submission.");
      }
      if (!teamSize || Number(teamSize) <= 0) {
        throw new Error("Team size is required before submission.");
      }
      if (!fundingNeeded || Number(fundingNeeded) <= 0) {
        throw new Error("Funding needed is required before submission.");
      }

      await saveDraft(true);

      if (selectedFile) {
        await uploadPendingFile();
      }

      if (documents.length === 0 && !selectedFile) {
        throw new Error("Upload at least one pitch deck document before submission.");
      }

      const id = applicationId ?? (await saveDraft(true));
      const submitted = await applicationApi.submit(token, id);
      setStatus(submitted.status);
      setStatusHistory(submitted.statusHistory);
      setMessage("Application submitted successfully.");
      router.replace("/dashboard");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="panel p-6 text-sm text-slate-600">
        <p>Loading application...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-brand-slate">Incubation Application</h2>
          <p className="text-sm text-slate-600">Fill the 3-step form, save drafts, upload your pitch deck, and submit.</p>
        </div>
        <div className="flex items-center gap-3">
          {status ? (
            <StatusBadge status={status} />
          ) : (
            <span className="inline-flex rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
              NEW DRAFT
            </span>
          )}
        </div>
      </div>

      <div className="panel p-5">
        <StepIndicator currentStep={step} />
      </div>

      {isReadOnly ? (
        <div className="rounded-xl border border-brand-blue/20 bg-brand-blue/10 px-4 py-3 text-sm font-medium text-brand-blue">
          This application is no longer editable because its status is {status}.
        </div>
      ) : null}

      {message ? (
        <div className="rounded-xl border border-brand-green/20 bg-brand-green/10 px-4 py-3 text-sm font-medium text-brand-green">
          {message}
        </div>
      ) : null}
      {error ? (
        <div className="rounded-xl border border-brand-red/20 bg-brand-red/10 px-4 py-3 text-sm font-medium text-brand-red">
          {error}
        </div>
      ) : null}

      {step === 1 ? (
        <div className="panel space-y-4 p-6">
          <h3 className="text-lg font-semibold text-brand-slate">Step 1: Company Info</h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">Company Name</label>
              <input
                className="input"
                disabled={isReadOnly}
                onChange={(event) => setCompanyName(event.target.value)}
                placeholder="Your startup name"
                value={companyName}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Sector</label>
              <input
                className="input"
                disabled={isReadOnly}
                onChange={(event) => setSector(event.target.value)}
                placeholder="FinTech, AgriTech, HealthTech..."
                value={sector}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Stage</label>
              <input
                className="input"
                disabled={isReadOnly}
                onChange={(event) => setStage(event.target.value)}
                placeholder="Idea, MVP, Growth..."
                value={stage}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
              <textarea
                className="input min-h-32"
                disabled={isReadOnly}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Describe the problem, your solution, and business model (min 20 chars)."
                value={description}
              />
            </div>
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="panel space-y-4 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-brand-slate">Step 2: Founder Info</h3>
            <button
              className="btn-secondary"
              disabled={isReadOnly || founders.length >= 3}
              onClick={() => setFounders((current) => [...current, createEmptyFounder(false)])}
              type="button"
            >
              Add Co-Founder
            </button>
          </div>

          <div className="space-y-4">
            {founders.map((founder, index) => (
              <div className="rounded-xl border border-slate-200 p-4" key={`${index}-${founder.email}`}>
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-700">Founder {index + 1}</p>
                  <button
                    className="text-sm font-semibold text-brand-red"
                    disabled={isReadOnly || founders.length === 1}
                    onClick={() => {
                      setFounders((current) => current.filter((_, i) => i !== index));
                    }}
                    type="button"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    className="input"
                    disabled={isReadOnly}
                    onChange={(event) => {
                      const value = event.target.value;
                      setFounders((current) =>
                        current.map((item, i) => (i === index ? { ...item, name: value } : item)),
                      );
                    }}
                    placeholder="Full name"
                    value={founder.name}
                  />
                  <input
                    className="input"
                    disabled={isReadOnly}
                    onChange={(event) => {
                      const value = event.target.value;
                      setFounders((current) =>
                        current.map((item, i) => (i === index ? { ...item, email: value } : item)),
                      );
                    }}
                    placeholder="Email"
                    type="email"
                    value={founder.email}
                  />
                  <input
                    className="input"
                    disabled={isReadOnly}
                    onChange={(event) => {
                      const value = event.target.value;
                      setFounders((current) =>
                        current.map((item, i) => (i === index ? { ...item, role: value } : item)),
                      );
                    }}
                    placeholder="Role"
                    value={founder.role}
                  />
                  <input
                    className="input"
                    disabled={isReadOnly}
                    onChange={(event) => {
                      const value = event.target.value;
                      setFounders((current) =>
                        current.map((item, i) => (i === index ? { ...item, phone: value } : item)),
                      );
                    }}
                    placeholder="Phone (optional)"
                    value={founder.phone}
                  />
                </div>
                <label className="mt-3 inline-flex items-center gap-2 text-sm text-slate-700">
                  <input
                    checked={founder.isPrimary}
                    disabled={isReadOnly}
                    onChange={(event) => {
                      const checked = event.target.checked;
                      setFounders((current) =>
                        current.map((item, i) => ({
                          ...item,
                          isPrimary: i === index ? checked : checked ? false : item.isPrimary,
                        })),
                      );
                    }}
                    type="checkbox"
                  />
                  Primary founder
                </label>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="panel space-y-5 p-6">
          <h3 className="text-lg font-semibold text-brand-slate">Step 3: Business Details & Document</h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Team Size</label>
              <input
                className="input"
                disabled={isReadOnly}
                min={1}
                onChange={(event) => setTeamSize(event.target.value)}
                placeholder="e.g. 6"
                type="number"
                value={teamSize}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Funding Needed (USD)</label>
              <input
                className="input"
                disabled={isReadOnly}
                min={1}
                onChange={(event) => setFundingNeeded(event.target.value)}
                placeholder="e.g. 25000"
                type="number"
                value={fundingNeeded}
              />
            </div>
          </div>

          {!isReadOnly ? (
            <div className="space-y-3">
              <FilePicker
                disabled={isReadOnly}
                file={selectedFile}
                onClear={() => setSelectedFile(null)}
                onPick={(file) => setSelectedFile(file)}
              />

              <button
                className="btn-secondary"
                disabled={uploading || !selectedFile}
                onClick={async () => {
                  setError(null);
                  setMessage(null);
                  try {
                    await uploadPendingFile();
                  } catch (err) {
                    if (err instanceof ApiHttpError || err instanceof Error) {
                      setError(err.message);
                    } else {
                      setError("Unable to upload document.");
                    }
                  }
                }}
                type="button"
              >
                {uploading ? "Uploading..." : "Upload Document"}
              </button>
            </div>
          ) : null}

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-700">Uploaded Documents</h4>
            {documents.length === 0 ? (
              <p className="text-sm text-slate-500">No uploaded document yet.</p>
            ) : (
              <div className="space-y-2">
                {documents.map((document) => (
                  <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2" key={document.id}>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{document.fileName}</p>
                      <p className="text-xs text-slate-500">
                        {(document.fileSize / 1024 / 1024).toFixed(2)} MB • uploaded {formatDateTime(document.createdAt)}
                      </p>
                    </div>
                    {!isReadOnly ? (
                      <button
                        className="text-sm font-semibold text-brand-red"
                        onClick={async () => {
                          if (!token || !applicationId) {
                            return;
                          }
                          setError(null);
                          setMessage(null);
                          try {
                            await applicationApi.deleteDocument(token, applicationId, document.id);
                            setDocuments((current) => current.filter((item) => item.id !== document.id));
                            setMessage("Document removed.");
                          } catch (err) {
                            if (err instanceof ApiHttpError) {
                              setError(err.message);
                            } else {
                              setError("Unable to remove document.");
                            }
                          }
                        }}
                        type="button"
                      >
                        Delete
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            className="btn-secondary"
            disabled={step === 1}
            onClick={() => setStep((current) => (current === 1 ? 1 : ((current - 1) as 1 | 2 | 3)))}
            type="button"
          >
            Previous
          </button>
          <button
            className="btn-secondary"
            disabled={step === 3}
            onClick={() => {
              try {
                const nextStep = (step + 1) as 2 | 3;
                validateForStep(nextStep);
                setStep(nextStep);
                setError(null);
              } catch (err) {
                if (err instanceof Error) {
                  setError(err.message);
                } else {
                  setError("Validation failed.");
                }
              }
            }}
            type="button"
          >
            Next
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!isReadOnly ? (
            <>
              <button
                className="btn-primary"
                disabled={saving}
                onClick={async () => {
                  setError(null);
                  setMessage(null);
                  try {
                    await saveDraft(false);
                  } catch (err) {
                    if (err instanceof ApiHttpError || err instanceof Error) {
                      setError(err.message);
                    } else {
                      setError("Unable to save draft.");
                    }
                  }
                }}
                type="button"
              >
                {saving ? "Saving..." : "Save Draft"}
              </button>

              {step === 3 ? (
                <button
                  className="btn-primary"
                  disabled={submitting}
                  onClick={async () => {
                    setError(null);
                    setMessage(null);
                    try {
                      await submitApplication();
                    } catch (err) {
                      if (err instanceof ApiHttpError || err instanceof Error) {
                        setError(err.message);
                      } else {
                        setError("Unable to submit application.");
                      }
                    }
                  }}
                  type="button"
                >
                  {submitting ? "Submitting..." : "Submit Application"}
                </button>
              ) : null}

              {applicationId ? (
                <button
                  className="btn-danger"
                  disabled={deleting}
                  onClick={async () => {
                    if (!token || !applicationId) {
                      return;
                    }
                    setDeleting(true);
                    setError(null);
                    setMessage(null);
                    try {
                      await applicationApi.deleteDraft(token, applicationId);
                      router.replace("/dashboard");
                    } catch (err) {
                      if (err instanceof ApiHttpError) {
                        setError(err.message);
                      } else {
                        setError("Unable to delete draft.");
                      }
                    } finally {
                      setDeleting(false);
                    }
                  }}
                  type="button"
                >
                  {deleting ? "Deleting..." : "Delete Draft"}
                </button>
              ) : null}
            </>
          ) : (
            <button className="btn-secondary" onClick={() => router.push("/dashboard")} type="button">
              Back to Dashboard
            </button>
          )}
        </div>
      </div>

      {statusHistory.length > 0 ? (
        <div className="panel p-5">
          <h3 className="text-lg font-semibold text-brand-slate">Status Timeline</h3>
          <div className="mt-3 space-y-2">
            {statusHistory.map((entry) => (
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm" key={entry.id}>
                <p className="font-medium text-slate-800">
                  {entry.fromStatus ?? "NEW"} → {entry.toStatus}
                </p>
                <p className="text-slate-600">{entry.note ?? "No note"}</p>
                <p className="text-xs text-slate-500">{formatDateTime(entry.changedAt)}</p>
              </div>
            ))}
          </div>

          {reviewNotes.adminNotes ? (
            <p className="mt-3 rounded-lg bg-brand-blue/10 px-3 py-2 text-sm text-brand-blue">
              <span className="font-semibold">Admin Notes:</span> {reviewNotes.adminNotes}
            </p>
          ) : null}
          {reviewNotes.rejectionReason ? (
            <p className="mt-2 rounded-lg bg-brand-red/10 px-3 py-2 text-sm text-brand-red">
              <span className="font-semibold">Rejection Reason:</span> {reviewNotes.rejectionReason}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};
