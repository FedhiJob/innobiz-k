"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { adminApi, ApiHttpError } from "@/lib/api";
import { InkLoader } from "@/components/ink-loader";
import { useAuth } from "@/context/auth-context";
import { formatDateTime } from "@/lib/format";
import type { OfficeSpace } from "@/types/api";

const splitAmenities = (value: string) =>
  value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);

export default function AdminOfficeSpacesPage() {
  const { token } = useAuth();
  const [spaces, setSpaces] = useState<OfficeSpace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [fullDescription, setFullDescription] = useState("");
  const [locationLabel, setLocationLabel] = useState("");
  const [capacity, setCapacity] = useState("");
  const [amenitiesText, setAmenitiesText] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [published, setPublished] = useState(true);
  const [image, setImage] = useState<File | null>(null);

  const editingSpace = useMemo(
    () => (editingId ? spaces.find((space) => space.id === editingId) ?? null : null),
    [editingId, spaces],
  );
  const publishedCount = spaces.filter((space) => space.published).length;
  const hiddenCount = spaces.length - publishedCount;

  const previewUrl = useMemo(() => {
    if (!image) {
      return editingSpace?.imageUrl ?? null;
    }
    return URL.createObjectURL(image);
  }, [editingSpace?.imageUrl, image]);

  useEffect(() => {
    if (!image || !previewUrl || previewUrl === editingSpace?.imageUrl) {
      return;
    }

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [editingSpace?.imageUrl, image, previewUrl]);

  const loadSpaces = async () => {
    if (!token) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await adminApi.listOfficeSpaces(token);
      setSpaces(response);
    } catch (err) {
      if (err instanceof ApiHttpError) {
        setError(err.message);
      } else {
        setError("Unable to load office spaces.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSpaces();
  }, [token]);

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setShortDescription("");
    setFullDescription("");
    setLocationLabel("");
    setCapacity("");
    setAmenitiesText("");
    setSortOrder("0");
    setPublished(true);
    setImage(null);
    setSaveError(null);
    setSaveSuccess(null);
  };

  const handleSave = async () => {
    if (!token) {
      return;
    }

    setSaving(true);
    setSaveError(null);
    setSaveSuccess(null);

    const payload = {
      name: name.trim(),
      shortDescription: shortDescription.trim(),
      fullDescription: fullDescription.trim(),
      locationLabel: locationLabel.trim() || undefined,
      capacity: capacity.trim() ? Number(capacity) : undefined,
      amenities: splitAmenities(amenitiesText),
      sortOrder: Number(sortOrder || "0"),
      published,
      image,
    };

    try {
      if (editingId) {
        await adminApi.updateOfficeSpace(token, editingId, payload);
        setSaveSuccess("Office space updated.");
      } else {
        await adminApi.createOfficeSpace(token, payload);
        setSaveSuccess("Office space created.");
      }

      resetForm();
      await loadSpaces();
    } catch (err) {
      if (err instanceof ApiHttpError) {
        setSaveError(err.message);
      } else {
        setSaveError("Unable to save office space.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (space: OfficeSpace) => {
    setEditingId(space.id);
    setName(space.name);
    setShortDescription(space.shortDescription);
    setFullDescription(space.fullDescription);
    setLocationLabel(space.locationLabel ?? "");
    setCapacity(space.capacity ? String(space.capacity) : "");
    setAmenitiesText(space.amenities.join("\n"));
    setSortOrder(String(space.sortOrder));
    setPublished(space.published);
    setImage(null);
    setSaveError(null);
    setSaveSuccess(null);
  };

  const handleDelete = async (space: OfficeSpace) => {
    if (!token) {
      return;
    }

    if (!window.confirm(`Delete "${space.name}" from the office spaces catalog?`)) {
      return;
    }

    setSaveError(null);
    setSaveSuccess(null);
    try {
      await adminApi.deleteOfficeSpace(token, space.id);
      if (editingId === space.id) {
        resetForm();
      }
      setSaveSuccess("Office space deleted.");
      await loadSpaces();
    } catch (err) {
      if (err instanceof ApiHttpError) {
        setSaveError(err.message);
      } else {
        setSaveError("Unable to delete office space.");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-brand-ink">Office Spaces</h2>
          <p className="text-sm text-slate-600">
            Manage the public space catalog, update descriptions, and keep imagery current.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Link className="btn-secondary w-full sm:w-auto" href="/#spaces">
            View Public Spaces
          </Link>
          <Link className="btn-secondary w-full sm:w-auto" href="/space-request">
            Open Request Form
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="panel p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Total spaces</p>
          <p className="mt-2 text-3xl font-bold text-brand-ink">{spaces.length}</p>
        </div>
        <div className="panel p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Published</p>
          <p className="mt-2 text-3xl font-bold text-brand-greenDark">{publishedCount}</p>
        </div>
        <div className="panel p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Hidden</p>
          <p className="mt-2 text-3xl font-bold text-slate-500">{hiddenCount}</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="panel space-y-4 p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-brand-ink">
                {editingId ? "Edit Office Space" : "Create Office Space"}
              </h3>
              <p className="text-sm text-slate-600">
                Each space gets its own public detail page and direct apply flow.
              </p>
            </div>
            {editingId ? (
              <button className="btn-secondary px-4 py-2" onClick={resetForm} type="button">
                Cancel
              </button>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="space-name">
                Space name
              </label>
              <input className="input" id="space-name" onChange={(event) => setName(event.target.value)} value={name} />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="space-short">
                Short description
              </label>
              <textarea
                className="input min-h-24 resize-none"
                id="space-short"
                onChange={(event) => setShortDescription(event.target.value)}
                value={shortDescription}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="space-full">
                Full details
              </label>
              <textarea
                className="input min-h-36 resize-none"
                id="space-full"
                onChange={(event) => setFullDescription(event.target.value)}
                value={fullDescription}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="space-location">
                Location label
              </label>
              <input
                className="input"
                id="space-location"
                onChange={(event) => setLocationLabel(event.target.value)}
                placeholder="Floor 2 · East Wing"
                value={locationLabel}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="space-capacity">
                Capacity
              </label>
              <input
                className="input"
                id="space-capacity"
                inputMode="numeric"
                onChange={(event) => setCapacity(event.target.value)}
                placeholder="25"
                value={capacity}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="space-order">
                Sort order
              </label>
              <input
                className="input"
                id="space-order"
                inputMode="numeric"
                onChange={(event) => setSortOrder(event.target.value)}
                value={sortOrder}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="space-image">
                Cover image
              </label>
              <input
                accept="image/png,image/jpeg,image/webp"
                className="input file:mr-4 file:rounded-full file:border-0 file:bg-brand-blue/10 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-brand-blue hover:file:bg-brand-blue/20"
                id="space-image"
                onChange={(event) => setImage(event.target.files?.[0] ?? null)}
                type="file"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="space-amenities">
                Amenities
              </label>
              <textarea
                className="input min-h-24 resize-none"
                id="space-amenities"
                onChange={(event) => setAmenitiesText(event.target.value)}
                placeholder={"Write one per line\nHigh-speed internet\nMeeting tables\nProjector"}
                value={amenitiesText}
              />
            </div>
          </div>

          {previewUrl ? (
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                {image ? "New image preview" : "Current cover image"}
              </p>
              <div className="mt-3 h-48 overflow-hidden rounded-2xl bg-white">
                <img alt={name || editingSpace?.name || "Office space preview"} className="h-full w-full object-cover" src={previewUrl} />
              </div>
            </div>
          ) : null}

          <label className="flex items-center gap-3 text-sm text-slate-700">
            <input
              checked={published}
              className="h-4 w-4 accent-brand-blue"
              onChange={(event) => setPublished(event.target.checked)}
              type="checkbox"
            />
            Show this space publicly
          </label>

          {saveError ? (
            <div className="rounded-lg border border-brand-red/20 bg-brand-red/10 px-4 py-3 text-sm text-brand-red">
              {saveError}
            </div>
          ) : null}
          {saveSuccess ? (
            <div className="rounded-lg border border-brand-green/20 bg-brand-green/10 px-4 py-3 text-sm text-brand-green">
              {saveSuccess}
            </div>
          ) : null}

          <button
            className="btn-primary w-full sm:w-auto"
            disabled={saving || !name.trim() || !shortDescription.trim() || !fullDescription.trim()}
            onClick={handleSave}
            type="button"
          >
            {saving ? "Saving..." : editingId ? "Save Changes" : "Create Space"}
          </button>
        </div>

        <div className="panel p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-brand-ink">Current Catalog</h3>
              <p className="text-sm text-slate-600">Public and hidden spaces listed in display order.</p>
            </div>
          </div>

          {loading ? (
            <InkLoader className="min-h-[28rem]" message="Loading office spaces..." size="md" />
          ) : error ? (
            <div className="mt-4 rounded-lg border border-brand-red/20 bg-brand-red/10 px-4 py-3 text-sm text-brand-red">
              {error}
            </div>
          ) : spaces.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-sm text-slate-600">
              No office spaces yet. Create the first space to populate the landing page gallery.
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              {spaces.map((space) => (
                <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm" key={space.id}>
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <div className="h-28 w-full overflow-hidden rounded-2xl bg-slate-100 sm:w-40">
                      {space.imageUrl ? (
                        <img alt={space.name} className="h-full w-full object-cover" src={space.imageUrl} />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-brand-yellow/15 via-white to-brand-blue/15 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                          No image
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-base font-semibold text-brand-ink">{space.name}</p>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                            space.published ? "bg-brand-green/10 text-brand-green" : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {space.published ? "Public" : "Hidden"}
                        </span>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                          Order {space.sortOrder}
                        </span>
                      </div>

                      <p className="text-sm text-slate-600">{space.shortDescription}</p>

                      <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                        {space.locationLabel ? (
                          <span className="rounded-full border border-slate-200 px-2.5 py-1">{space.locationLabel}</span>
                        ) : null}
                        {space.capacity ? (
                          <span className="rounded-full border border-slate-200 px-2.5 py-1">
                            Capacity {space.capacity}
                          </span>
                        ) : null}
                        <span className="rounded-full border border-slate-200 px-2.5 py-1">
                          Updated {formatDateTime(space.updatedAt)}
                        </span>
                      </div>

                      {space.amenities.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {space.amenities.slice(0, 4).map((amenity) => (
                            <span
                              className="rounded-full bg-brand-blue/5 px-2.5 py-1 text-xs font-semibold text-brand-ink"
                              key={amenity}
                            >
                              {amenity}
                            </span>
                          ))}
                          {space.amenities.length > 4 ? (
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
                              +{space.amenities.length - 4} more
                            </span>
                          ) : null}
                        </div>
                      ) : null}

                      <div className="flex flex-wrap gap-2">
                        <button className="btn-secondary px-3 py-2 text-xs" onClick={() => handleEdit(space)} type="button">
                          Edit
                        </button>
                        <Link className="btn-secondary px-3 py-2 text-xs" href={`/spaces/${space.slug}`}>
                          View Public Page
                        </Link>
                        <button className="btn-danger px-3 py-2 text-xs" onClick={() => handleDelete(space)} type="button">
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
