"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { officeSpaceApi, spaceRequestApi } from "@/lib/api";
import type { OfficeSpace } from "@/types/api";

const resourceOptions = [
  "Open Incubation Space",
  "Meeting Room",
  "Video Conference",
  "Maker Space / Fab Lab",
  "Main Purpose Hall",
  "IT Lab",
  "Co-working Desk",
];

export default function SpaceRequestPage() {
  return (
    <Suspense fallback={<SpaceRequestPageFallback />}>
      <SpaceRequestPageContent />
    </Suspense>
  );
}

function SpaceRequestPageContent() {
  const searchParams = useSearchParams();
  const requestedSpaceId = searchParams.get("spaceId") ?? "";
  const requestedSpaceName = searchParams.get("spaceName") ?? "";
  const [startupName, setStartupName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [officeSpaces, setOfficeSpaces] = useState<OfficeSpace[]>([]);
  const [selectedSpaceId, setSelectedSpaceId] = useState(requestedSpaceId);
  const [teamSize, setTeamSize] = useState("");
  const [resources, setResources] = useState<string[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [purpose, setPurpose] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const loadSpaces = async () => {
      try {
        const response = await officeSpaceApi.list();
        setOfficeSpaces(response);
      } catch {
        setOfficeSpaces([]);
      }
    };

    void loadSpaces();
  }, []);

  useEffect(() => {
    if (requestedSpaceId) {
      setSelectedSpaceId(requestedSpaceId);
    }
  }, [requestedSpaceId]);

  const selectedSpace = useMemo(
    () => officeSpaces.find((space) => space.id === selectedSpaceId) ?? null,
    [officeSpaces, selectedSpaceId],
  );

  const toggleResource = (value: string) => {
    setResources((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    );
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!startupName.trim() || !contactName.trim() || !email.trim() || !phone.trim()) {
      setError("Please complete the startup contact information.");
      return;
    }
    if (resources.length === 0) {
      setError("Select at least one resource type.");
      return;
    }
    if (!startDate || !endDate) {
      setError("Provide the requested duration of use.");
      return;
    }
    if (purpose.trim().length < 10) {
      setError("Please describe the purpose of your request.");
      return;
    }

    setSubmitting(true);
    try {
      await spaceRequestApi.create({
        startupName: startupName.trim(),
        contactName: contactName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        officeSpaceId: selectedSpaceId || undefined,
        teamSize: teamSize ? Number(teamSize) : undefined,
        resourceTypes: resources,
        startDate,
        endDate,
        purpose: purpose.trim(),
        additionalNotes: additionalNotes.trim() || undefined,
      });
      setStartupName("");
      setContactName("");
      setEmail("");
      setPhone("");
      setSelectedSpaceId(requestedSpaceId);
      setTeamSize("");
      setResources([]);
      setStartDate("");
      setEndDate("");
      setPurpose("");
      setAdditionalNotes("");
      setSuccess("Request submitted successfully. Our team will review and contact you soon.");
    } catch (err) {
      setError("Unable to submit request. Please review the form and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen px-6 py-10 text-brand-ink">
      <header className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-4">
        <Link className="flex items-center gap-3" href="/">
          <Image src="/ink-logo.png" alt="innobiz-k logo" width={56} height={40} />
          <div>
            <p className="text-base font-semibold text-brand-ink">innobiz-k Ethiopia</p>
            <p className="text-xs text-slate-500">Space & Resource Request</p>
          </div>
        </Link>
        <Link className="btn-secondary" href="/">
          Back to Home
        </Link>
      </header>

      <section className="mx-auto mt-8 w-full max-w-5xl space-y-6">
        <div className="rounded-[32px] border border-white/70 bg-white/90 p-8 shadow-panel">
          <h1 className="text-3xl font-bold text-brand-ink">Request Office Space & Facilities</h1>
          <p className="mt-2 text-base text-slate-600">
            Tell us what space or resources you need. Our team will review and respond quickly.
          </p>
        </div>

        {error ? (
          <div className="rounded-xl border border-brand-red/20 bg-brand-red/10 px-4 py-3 text-sm text-brand-red">
            {error}
          </div>
        ) : null}
        {success ? (
          <div className="rounded-xl border border-brand-green/20 bg-brand-green/10 px-4 py-3 text-sm text-brand-green">
            {success}
          </div>
        ) : null}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="panel space-y-4 p-6">
            <h2 className="text-lg font-semibold text-brand-ink">Startup Contact Details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                className="input"
                placeholder="Startup Name"
                value={startupName}
                onChange={(event) => setStartupName(event.target.value)}
              />
              <input
                className="input"
                placeholder="Primary Contact"
                value={contactName}
                onChange={(event) => setContactName(event.target.value)}
              />
              <input
                className="input"
                placeholder="Email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <input
                className="input"
                placeholder="Phone"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />
            </div>
            <div>
              <input
                className="input"
                placeholder="Team size (optional)"
                value={teamSize}
                onChange={(event) => setTeamSize(event.target.value)}
              />
            </div>
          </div>

          <div className="panel space-y-4 p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-brand-ink">Preferred Office Space</h2>
                <p className="text-sm text-slate-600">
                  Select a catalog space if this request is for a specific room or workspace.
                </p>
              </div>
              {selectedSpaceId ? (
                <button className="btn-secondary px-4 py-2" onClick={() => setSelectedSpaceId("")} type="button">
                  Clear selection
                </button>
              ) : null}
            </div>

            <select
              className="input"
              onChange={(event) => setSelectedSpaceId(event.target.value)}
              value={selectedSpaceId}
            >
              <option value="">No specific space selected</option>
              {officeSpaces.map((space) => (
                <option key={space.id} value={space.id}>
                  {space.name}
                </option>
              ))}
            </select>

            {selectedSpace ? (
              <div className="rounded-3xl border border-brand-blue/15 bg-brand-blue/5 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-brand-ink">{selectedSpace.name}</p>
                    <p className="mt-2 text-sm leading-7 text-slate-600">{selectedSpace.shortDescription}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedSpace.locationLabel ? (
                        <span className="rounded-full border border-brand-blue/15 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                          {selectedSpace.locationLabel}
                        </span>
                      ) : null}
                      {selectedSpace.capacity ? (
                        <span className="rounded-full border border-brand-blue/15 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                          Capacity {selectedSpace.capacity}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <Link className="btn-secondary w-full sm:w-auto" href={`/spaces/${selectedSpace.slug}`}>
                    View Space Details
                  </Link>
                </div>
              </div>
            ) : requestedSpaceName && selectedSpaceId ? (
              <div className="rounded-3xl border border-brand-blue/15 bg-brand-blue/5 p-5 text-sm text-slate-600">
                Selected space: <span className="font-semibold text-brand-ink">{requestedSpaceName}</span>
              </div>
            ) : null}
          </div>

          <div className="panel space-y-4 p-6">
            <h2 className="text-lg font-semibold text-brand-ink">Resources Needed</h2>
            <div className="flex flex-wrap gap-3">
              {resourceOptions.map((option) => {
                const selected = resources.includes(option);
                return (
                  <button
                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                      selected
                        ? "border-brand-blue bg-brand-blue/10 text-brand-blue"
                        : "border-slate-200 bg-white text-slate-600 hover:border-brand-blue/40 hover:text-brand-blue"
                    }`}
                    key={option}
                    onClick={() => toggleResource(option)}
                    type="button"
                  >
                    {option}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-slate-500">
              Select all that apply. You can explain details in the notes section.
            </p>
          </div>

          <div className="panel space-y-4 p-6">
            <h2 className="text-lg font-semibold text-brand-ink">Usage Timeline</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Start date</label>
                <input
                  className="input"
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">End date</label>
                <input
                  className="input"
                  type="date"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="panel space-y-4 p-6">
            <h2 className="text-lg font-semibold text-brand-ink">Purpose & Details</h2>
            <textarea
              className="input min-h-32"
              placeholder="Describe how you will use the space or resources."
              value={purpose}
              onChange={(event) => setPurpose(event.target.value)}
            />
            <textarea
              className="input min-h-24"
              placeholder="Additional notes (optional)"
              value={additionalNotes}
              onChange={(event) => setAdditionalNotes(event.target.value)}
            />
          </div>

          <div className="rounded-2xl border border-brand-green/20 bg-brand-green/5 p-4 text-sm text-slate-600">
            <p className="font-semibold text-slate-700">Terms & Responsibilities</p>
            <ul className="mt-2 space-y-2">
              <li>Requested resources will be used only for startup-related activities.</li>
              <li>The startup is responsible for any damage or loss during usage.</li>
              <li>All equipment and facilities must be returned in good condition.</li>
              <li>Applicants agree to follow innobiz-k Ethiopia policies and regulations.</li>
            </ul>
          </div>

          <button className="btn-primary w-full" disabled={submitting} type="submit">
            {submitting ? "Submitting..." : "Submit Request"}
          </button>
        </form>
      </section>
    </main>
  );
}

function SpaceRequestPageFallback() {
  return (
    <main className="min-h-screen px-6 py-10 text-brand-ink">
      <section className="mx-auto mt-8 w-full max-w-5xl space-y-6">
        <div className="rounded-[32px] border border-white/70 bg-white/90 p-8 shadow-panel">
          <h1 className="text-3xl font-bold text-brand-ink">Request Office Space & Facilities</h1>
          <p className="mt-2 text-base text-slate-600">
            Loading the request form and your selected space details.
          </p>
        </div>
      </section>
    </main>
  );
}
