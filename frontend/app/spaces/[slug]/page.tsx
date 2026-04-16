"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ApiHttpError, officeSpaceApi } from "@/lib/api";
import { InkLoader } from "@/components/ink-loader";
import type { OfficeSpace } from "@/types/api";

export default function OfficeSpaceDetailPage() {
  const params = useParams<{ slug: string }>();
  const [space, setSpace] = useState<OfficeSpace | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const slug = params?.slug;
    if (!slug || Array.isArray(slug)) {
      setLoading(false);
      setError("Office space not found.");
      return;
    }

    const loadSpace = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await officeSpaceApi.getBySlug(slug);
        setSpace(response);
      } catch (err) {
        if (err instanceof ApiHttpError) {
          setError(err.message);
        } else {
          setError("Unable to load office space.");
        }
      } finally {
        setLoading(false);
      }
    };

    void loadSpace();
  }, [params]);

  if (loading) {
    return <InkLoader className="min-h-screen px-6" message="Loading office space..." size="md" />;
  }

  if (!space || error) {
    return (
      <main className="min-h-screen px-6 py-10 text-brand-ink">
        <section className="mx-auto max-w-4xl">
          <div className="panel p-8 text-center">
            <h1 className="text-3xl font-bold text-brand-ink">Office space not found</h1>
            <p className="mt-3 text-base text-slate-600">
              {error ?? "That space is no longer published in the current catalog."}
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link className="btn-secondary" href="/">
                Back to Homepage
              </Link>
              <Link className="btn-primary" href="/space-request">
                Open Space Request Form
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-10 text-brand-ink">
      <section className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link className="btn-secondary" href="/#spaces">
            Back to Office Spaces
          </Link>
          <Link
            className="btn-primary"
            href={`/space-request?spaceId=${encodeURIComponent(space.id)}&spaceName=${encodeURIComponent(space.name)}`}
          >
            Apply for this Space
          </Link>
        </div>

        <div className="panel overflow-hidden">
          <div className="relative h-[320px] w-full bg-gradient-to-br from-brand-yellow/10 via-white to-brand-blue/10 sm:h-[440px]">
            {space.imageUrl ? (
              <Image alt={space.name} className="object-cover" fill priority sizes="100vw" src={space.imageUrl} />
            ) : (
              <div className="flex h-full items-center justify-center text-sm font-semibold uppercase tracking-[0.28em] text-slate-400">
                InnoBiz-K Office Space
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/65 via-brand-ink/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
              <div className="flex flex-wrap gap-2">
                {space.locationLabel ? (
                  <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
                    {space.locationLabel}
                  </span>
                ) : null}
                {space.capacity ? (
                  <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
                    Capacity {space.capacity}
                  </span>
                ) : null}
              </div>
              <h1 className="mt-4 text-3xl font-bold sm:text-4xl">{space.name}</h1>
              <p className="mt-3 max-w-3xl text-sm text-white/85 sm:text-base">{space.shortDescription}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="panel p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-blue">Space Details</p>
            <p className="mt-4 whitespace-pre-line text-sm leading-8 text-slate-600 sm:text-base">
              {space.fullDescription}
            </p>
          </div>

          <div className="space-y-6">
            <div className="panel p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Quick Overview</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Location</p>
                  <p className="mt-2 text-sm font-semibold text-brand-ink">{space.locationLabel ?? "Shared facility"}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Capacity</p>
                  <p className="mt-2 text-sm font-semibold text-brand-ink">
                    {space.capacity ? `${space.capacity} people` : "Confirmed during review"}
                  </p>
                </div>
              </div>
            </div>

            <div className="panel p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-greenDark">Amenities</p>
              {space.amenities.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {space.amenities.map((amenity) => (
                    <span
                      className="rounded-full border border-brand-blue/15 bg-brand-blue/5 px-3 py-2 text-sm font-semibold text-brand-ink"
                      key={amenity}
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-600">Amenities will be confirmed by the admin team during review.</p>
              )}
            </div>

            <div className="panel p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-yellow">Request This Space</p>
              <h2 className="mt-2 text-2xl font-bold text-brand-ink">Need this room for your team, workshop, or program?</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Continue to the request form and we will carry this selected space into the application so the admin team
                can review the exact room you need.
              </p>
              <Link
                className="btn-primary mt-5 inline-flex"
                href={`/space-request?spaceId=${encodeURIComponent(space.id)}&spaceName=${encodeURIComponent(space.name)}`}
              >
                Apply for Space
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
