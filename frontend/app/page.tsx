"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { Reveal } from "@/components/reveal";
import { updatesApi } from "@/lib/api";
import type { HeroUpdate } from "@/types/api";

const highlights = [
  {
    title: "A home for Ethiopian founders",
    description:
      "We offer tailored incubation, mentoring, and visibility to help high-potential startups grow into investable businesses.",
  },
  {
    title: "People, connection, expansion",
    description:
      "Our programs connect founders to partners, markets, and a trusted community that keeps momentum high.",
  },
  {
    title: "Hands-on operational support",
    description:
      "We provide practical guidance on product, finance, and go-to-market execution with monthly check-ins.",
  },
];

const officialDescription = [
  "A 10-million-dollar bilateral initiative on ICT-based business creation and SME support to create quality jobs in Ethiopia is being carried out by the Ministry of Innovation and Technology and the Korean International Cooperation Agency. The major goal of this project is to enhance the ICT-based startup and SME ecosystem by establishing a related platform and establishing and operating the InnoBiz-K Ethiopia. A 2000 square meter facility has been set aside by InnoBiz-K Ethiopia in the ICT Park to house maker spaces, co-working areas, an incubator, and meeting/seminar facilities for planning and hosting training sessions and events.",
  "In Tracon Tower, KOICA PMC has run an incubator program as part of the pilot program. Under this program, 34 ICT-based businesses were admitted in four batches and received a grant of 20,000 USD overall, seven weeks of training following admission, and six months of mentorship, coaching, unlimited internet access, and working space. The InnoBiz-K Ethiopia program has worked hard and has been successful in providing well-educated and experienced mentors and trainers to make sure entrepreneurs get the help they need where they need it.",
];

type HeroSlide = {
  title: string;
  description: string;
  ctaLabel?: string;
  ctaUrl?: string;
  createdAt?: string;
  mediaUrl?: string;
  mediaType?: HeroUpdate["mediaType"];
};

const defaultHeroSlides: HeroSlide[] = [
  {
    title: "Build with a team that cares about your runway.",
    description:
      "Mentorship, accountability, and space to grow your product with focus.",
  },
  {
    title: "Train, test, and launch with the right support.",
    description:
      "Hands-on workshops and maker spaces to move from idea to validated traction.",
  },
  {
    title: "Connect to partners and investors early.",
    description:
      "We open doors to the networks that matter for scale and sustainability.",
  },
];

const mapUpdatesToSlides = (updates: HeroUpdate[]): HeroSlide[] =>
  updates.map((update) => ({
    title: update.title,
    description: update.message,
    ctaLabel: update.ctaLabel ?? undefined,
    ctaUrl: update.ctaUrl ?? undefined,
    createdAt: update.createdAt,
    mediaUrl: update.mediaUrl ?? undefined,
    mediaType: update.mediaType ?? undefined,
  }));

const partners = [
  {
    name: "KOICA",
    description: "Korea International Cooperation Agency",
    logo: "/partners/koica.png",
  },
  {
    name: "Ethiopian Ministry of Innovation and Technology",
    description: "Government partner driving Ethiopia's innovation ecosystem.",
    logo: "/partners/mint.png",
  },
];

const testimonials = [
  {
    quote:
      "InnoBiz-K helped us validate our product and connect with mentors who actually understand our market.",
    name: "Startup Founder",
    role: "FinTech Cohort",
  },
  {
    quote:
      "The workspace and accountability check-ins kept our team focused through critical product pivots.",
    name: "Program Participant",
    role: "AgriTech Cohort",
  },
  {
    quote:
      "We learned how to pitch and package our story. The investor readiness sessions were the breakthrough.",
    name: "Incubated Startup",
    role: "HealthTech Cohort",
  },
];

const spaces = [
  {
    name: "Open Collaboration Hub",
    description: "Flexible desks, writable walls, and plenty of daylight for team sprints.",
    image: "/spaces/space-open-collab.jpg",
    level: "Floor 1",
  },
  {
    name: "Quiet Focus Pods",
    description: "Sound-reduced pods for deep work, research, and founder calls.",
    image: "/spaces/space-focus-pod.jpg",
    level: "Floor 1",
  },
  {
    name: "Prototype Lab",
    description: "Space to validate hardware ideas and assemble early prototypes.",
    image: "/spaces/space-prototype-lab.jpg",
    level: "Floor 2",
  },
  {
    name: "Mentor Suite",
    description: "Private meeting rooms for coaching sessions and investor reviews.",
    image: "/spaces/space-mentor-suite.jpg",
    level: "Floor 2",
  },
  {
    name: "Community Event Hall",
    description: "Launch events, demo days, and training workshops under one roof.",
    image: "/spaces/space-event-hall.jpg",
    level: "Floor 1",
  },
  {
    name: "Innovation Lounge",
    description: "Relaxed seating for networking, peer support, and casual check-ins.",
    image: "/spaces/space-innovation-lounge.jpg",
    level: "Floor 2",
  },
];

const steps = [
  {
    title: "Create your startup profile",
    detail: "Share your company story, stage, and support interests.",
  },
  {
    title: "Upload your pitch deck",
    detail: "Provide a pitch deck so the team can review your vision.",
  },
  {
    title: "Submit and get feedback",
    detail: "Our admin team reviews and responds with next steps.",
  },
];

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const [heroIndex, setHeroIndex] = useState(0);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(defaultHeroSlides);
  const [logoErrors, setLogoErrors] = useState<Record<string, boolean>>({});
  const primaryCta =
    user && !isLoading
      ? {
          href: user.role === "ADMIN" ? "/admin/dashboard" : "/dashboard",
          label: "Go to Dashboard",
        }
      : { href: "/register", label: "Start an Application" };
  const secondaryCta =
    user && !isLoading
      ? { href: "/profile", label: "View Profile" }
      : { href: "/login", label: "Log In" };

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroIndex((current) => (current + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  useEffect(() => {
    const loadUpdates = async () => {
      try {
        const updates = await updatesApi.list(6);
        if (updates.length > 0) {
          setHeroSlides(mapUpdatesToSlides(updates));
          setHeroIndex(0);
        }
      } catch {
        // keep default slides if updates fail
      }
    };
    void loadUpdates();
  }, []);

  return (
    <main className="min-h-screen text-brand-ink">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute -left-40 top-16 h-72 w-72 rounded-full bg-brand-yellow/20 blur-[120px] animate-ink-drift" />
        <div className="pointer-events-none absolute right-10 top-10 h-64 w-64 rounded-full bg-brand-green/20 blur-[120px] animate-ink-drift-slow" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-brand-blue/20 blur-[140px] animate-ink-pulse" />
        <div className="pointer-events-none absolute left-10 top-40 h-16 w-16 rounded-full bg-brand-orange/20 blur-2xl animate-ink-drift-slow" />

        <header className="relative z-10 mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-6">
          <Link className="flex items-center gap-3" href="/">
            <Image src="/ink-logo.png" alt="InnoBiz-K logo" width={56} height={40} />
            <div>
              <p className="text-base font-semibold text-brand-ink">InnoBiz-K Ethiopia</p>
              <p className="text-xs text-slate-500">Incubation Application Portal</p>
            </div>
          </Link>
          <nav className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-600">
            <a className="transition hover:text-brand-blue" href="#about">
              About
            </a>
            <a className="transition hover:text-brand-blue" href="#programs">
              Programs
            </a>
            <a className="transition hover:text-brand-blue" href="#spaces">
              Office Spaces
            </a>
            <Link className="transition hover:text-brand-blue" href="/space-request">
              Request Space
            </Link>
            <a className="transition hover:text-brand-blue" href="#apply">
              Apply
            </a>
          </nav>
          <div className="flex flex-wrap items-center gap-3">
            <Link className="btn-secondary" href={secondaryCta.href}>
              {secondaryCta.label}
            </Link>
            <Link className="btn-primary" href={primaryCta.href}>
              {primaryCta.label}
            </Link>
          </div>
        </header>

        <section className="relative z-10 mx-auto grid w-full max-w-6xl gap-8 px-6 pb-16 pt-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-green/30 bg-white/80 px-3 py-1 text-xs font-semibold text-brand-greenDark">
              Ethiopia's incubation partner for early stage startups
            </div>
            <h1 className="text-4xl font-bold leading-tight text-brand-ink sm:text-5xl">
              A launchpad for bold founders to build, learn, and scale.
            </h1>
            <p className="text-base text-slate-600 sm:text-lg">
              InnoBiz-K supports ambitious Ethiopian startups with mentorship, community, and the resources to turn
              promising ideas into sustainable ventures.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link className="btn-primary w-full sm:w-auto" href={primaryCta.href}>
                {primaryCta.label}
              </Link>
              <Link className="btn-secondary w-full sm:w-auto" href="#spaces">
                Explore the Spaces
              </Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {["Mentorship", "Coworking", "Maker Labs", "Investor Readiness", "Training"].map((tag) => (
                <span
                  className="rounded-full border border-white/80 bg-white/80 px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm"
                  key={tag}
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/80 bg-white/90 p-4 shadow-panel">
                <p className="text-2xl font-bold text-brand-blue">40+</p>
                <p className="text-xs font-semibold text-slate-500">Founders supported</p>
              </div>
              <div className="rounded-2xl border border-white/80 bg-white/90 p-4 shadow-panel">
                <p className="text-2xl font-bold text-brand-greenDark">12</p>
                <p className="text-xs font-semibold text-slate-500">Monthly programs</p>
              </div>
              <div className="rounded-2xl border border-white/80 bg-white/90 p-4 shadow-panel">
                <p className="text-2xl font-bold text-brand-yellow">5</p>
                <p className="text-xs font-semibold text-slate-500">Partner networks</p>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="relative overflow-hidden rounded-[36px] border border-white/70 shadow-panel">
              {heroSlides[heroIndex].mediaUrl ? (
                heroSlides[heroIndex].mediaType === "VIDEO" ? (
                  <video
                    autoPlay
                    className="h-[360px] w-full object-cover"
                    loop
                    muted
                    playsInline
                    poster="/hero/innobiz-hero.jpg"
                    src={heroSlides[heroIndex].mediaUrl}
                  />
                ) : (
                  <Image
                    alt={heroSlides[heroIndex].title}
                    className="h-[360px] w-full object-cover"
                    height={360}
                    src={heroSlides[heroIndex].mediaUrl}
                    width={560}
                  />
                )
              ) : (
                <video
                  autoPlay
                  className="h-[360px] w-full object-cover"
                  loop
                  muted
                  playsInline
                  poster="/hero/innobiz-hero.jpg"
                >
                  <source src="/hero/innobiz-hero.mp4" type="video/mp4" />
                </video>
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-brand-ink/15 via-brand-ink/25 to-brand-ink/60" />
              <div className="absolute inset-0 flex flex-col justify-between p-5 text-white">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/80">
                  Featured Update
                </div>
                <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                  <p className="text-lg font-semibold">{heroSlides[heroIndex].title}</p>
                  <p className="mt-2 text-sm text-white/80">{heroSlides[heroIndex].description}</p>
                  {heroSlides[heroIndex].ctaLabel && heroSlides[heroIndex].ctaUrl ? (
                    <Link
                      className="mt-3 inline-flex items-center justify-center rounded-full border border-white/30 px-4 py-2 text-xs font-semibold text-white/90 hover:bg-white/10"
                      href={heroSlides[heroIndex].ctaUrl}
                    >
                      {heroSlides[heroIndex].ctaLabel}
                    </Link>
                  ) : null}
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {heroSlides.map((_, index) => (
                        <button
                          className={`h-2 w-2 rounded-full ${index === heroIndex ? "bg-white" : "bg-white/40"}`}
                          key={`hero-dot-${index}`}
                          onClick={() => setHeroIndex(index)}
                          type="button"
                          aria-label={`Show slide ${index + 1}`}
                        />
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        className="rounded-full border border-white/30 px-3 py-1 text-xs font-semibold text-white/90 hover:bg-white/10"
                        onClick={() =>
                          setHeroIndex((current) => (current - 1 + heroSlides.length) % heroSlides.length)
                        }
                        type="button"
                      >
                        Prev
                      </button>
                      <button
                        className="rounded-full border border-white/30 px-3 py-1 text-xs font-semibold text-white/90 hover:bg-white/10"
                        onClick={() => setHeroIndex((current) => (current + 1) % heroSlides.length)}
                        type="button"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-brand-yellow/30 blur-2xl animate-ink-pulse" />
          </div>
        </section>
      </div>

      <Reveal>
        <section className="mx-auto w-full max-w-6xl px-6">
          <div className="rounded-[32px] border border-brand-blue/10 bg-white/90 p-6 shadow-panel">
            <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr] md:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-blue">Impact Snapshot</p>
                <h2 className="mt-2 text-2xl font-bold text-brand-ink">
                  A collaborative ecosystem built for founders who want to move fast.
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  Our incubation community blends workspace, mentorship, and structured feedback so startups can focus on
                  progress.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { label: "Mentors & Coaches", value: "25+" },
                  { label: "Active Cohorts", value: "4" },
                  { label: "Workshops Hosted", value: "60+" },
                  { label: "Partner Institutions", value: "10" },
                ].map((item) => (
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4" key={item.label}>
                    <p className="text-xl font-bold text-brand-ink">{item.value}</p>
                    <p className="text-xs font-semibold text-slate-500">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {highlights.map((item) => (
                <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-panel" key={item.title}>
                  <p className="text-sm font-semibold text-brand-ink">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="mx-auto w-full max-w-6xl px-6 py-16">
          <div className="rounded-[32px] border border-white/70 bg-white/90 p-8 shadow-panel">
            <div className="flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-greenDark">Partners</p>
              <h2 className="text-3xl font-bold text-brand-ink">
                We collaborate with institutions committed to Ethiopia's startup ecosystem.
              </h2>
              <p className="text-base text-slate-600">
                InnoBiz-K is supported by strategic partners who help deliver funding, infrastructure, and global
                expertise.
              </p>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {partners.map((partner) => {
                const hasError = logoErrors[partner.name];
                return (
                  <div
                    className="flex flex-col gap-4 rounded-3xl border border-slate-100 bg-slate-50 p-6 sm:flex-row sm:items-center"
                    key={partner.name}
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white bg-white shadow-panel">
                      {!hasError ? (
                        <Image
                          alt={`${partner.name} logo`}
                          height={48}
                          src={partner.logo}
                          width={48}
                          onError={() =>
                            setLogoErrors((current) => ({
                              ...current,
                              [partner.name]: true,
                            }))
                          }
                        />
                      ) : (
                        <span className="text-xs font-semibold text-brand-ink">
                          {partner.name
                            .split(" ")
                            .slice(0, 2)
                            .map((word) => word.charAt(0))
                            .join("")}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-brand-ink">{partner.name}</p>
                      <p className="mt-1 text-sm text-slate-600">{partner.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="mx-auto w-full max-w-6xl px-6 pb-16">
          <div className="rounded-[32px] border border-brand-yellow/20 bg-white/90 p-8 shadow-panel">
            <div className="flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-yellow">Testimonials</p>
              <h2 className="text-3xl font-bold text-brand-ink">Founders talking about the InnoBiz-K experience.</h2>
              <p className="text-base text-slate-600">
                Real feedback from teams who built inside the incubation program.
              </p>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {testimonials.map((testimonial) => (
                <div className="rounded-3xl border border-slate-100 bg-slate-50 p-6 shadow-panel" key={testimonial.quote}>
                  <p className="text-sm text-slate-600">"{testimonial.quote}"</p>
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-brand-ink">{testimonial.name}</p>
                    <p className="text-xs text-slate-500">{testimonial.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section id="about" className="mx-auto w-full max-w-6xl px-6 py-16">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-greenDark">About InnoBiz-K</p>
            <h2 className="text-3xl font-bold text-brand-ink">A place where each idea unfolds.</h2>
            {officialDescription.map((paragraph) => (
              <p className="text-base text-slate-600" key={paragraph.slice(0, 20)}>
                {paragraph}
              </p>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {steps.map((step, index) => (
              <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-panel" key={step.title}>
                <p className="text-xs font-semibold uppercase text-brand-blue">Step 0{index + 1}</p>
                <p className="mt-2 text-sm font-semibold text-brand-ink">{step.title}</p>
                <p className="mt-1 text-sm text-slate-600">{step.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      </Reveal>

      <Reveal>
      <section id="programs" className="mx-auto w-full max-w-6xl px-6 py-16">
        <div className="rounded-[32px] border border-white/70 bg-white/90 p-8 shadow-panel">
          <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-yellow">Programs</p>
              <h2 className="mt-2 text-3xl font-bold text-brand-ink">Hands-on growth programs built around your needs.</h2>
              <p className="mt-3 text-base text-slate-600">
                From product validation to investment readiness, our incubation tracks are designed to keep startups
                focused and accountable every month.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { label: "Mentor Circles", note: "Weekly founder coaching and peer learning." },
                { label: "Investor Readiness", note: "Pitch refining and financial modeling support." },
                { label: "Market Access", note: "Industry connections and customer discovery." },
                { label: "Operational Support", note: "Legal, accounting, and grant navigation." },
              ].map((item) => (
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4" key={item.label}>
                  <p className="text-sm font-semibold text-brand-ink">{item.label}</p>
                  <p className="mt-1 text-sm text-slate-600">{item.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      </Reveal>

      <Reveal>
      <section id="spaces" className="mx-auto w-full max-w-6xl px-6 py-16">
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-blue">Office Spaces</p>
          <h2 className="text-3xl font-bold text-brand-ink">A gallery of spaces built for focus and collaboration.</h2>
          <p className="text-base text-slate-600">
            From quiet pods to event halls, our spaces are designed to support every stage of a startup journey.
          </p>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {spaces.map((space, index) => (
            <div
              className="group relative overflow-hidden rounded-3xl border border-white/70 bg-white/90 p-5 shadow-panel transition hover:-translate-y-1"
              key={space.name}
            >
              <div
                className="mb-4 h-40 w-full rounded-2xl bg-gradient-to-br from-brand-green/20 via-white to-brand-blue/20"
                style={{
                  backgroundImage: `linear-gradient(135deg, rgba(255,195,0,0.2), rgba(255,255,255,0.4), rgba(5,110,220,0.25)), url(${space.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
              <p className="text-sm font-semibold text-brand-ink">{space.name}</p>
              <p className="mt-1 text-sm text-slate-600">{space.description}</p>
              <span className="mt-3 inline-flex w-fit rounded-full border border-white/80 bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate-500">
                {space.level}
              </span>
              <div
                className={`pointer-events-none absolute -right-10 -top-10 h-20 w-20 rounded-full ${
                  index % 3 === 0
                    ? "bg-brand-yellow/30"
                    : index % 3 === 1
                      ? "bg-brand-green/30"
                      : "bg-brand-blue/30"
                } blur-2xl`}
              />
            </div>
          ))}
        </div>
      </section>
      </Reveal>

      <Reveal>
      <section id="apply" className="mx-auto w-full max-w-6xl px-6 pb-16 pt-8">
        <div className="rounded-[32px] border border-brand-blue/20 bg-gradient-to-r from-white via-brand-blue/5 to-brand-green/10 p-8 shadow-panel">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-greenDark">Apply Now</p>
              <h2 className="mt-2 text-3xl font-bold text-brand-ink">Ready to bring your startup to InnoBiz-K?</h2>
              <p className="mt-3 text-base text-slate-600">
                Create your application, select the support you need, and submit your pitch deck. Our team will guide
                you through the rest.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Link className="btn-primary w-full" href={primaryCta.href}>
                {primaryCta.label}
              </Link>
              <Link className="btn-secondary w-full" href={secondaryCta.href}>
                {secondaryCta.label}
              </Link>
              <p className="text-xs text-slate-500">
                Already in the program? Log in to submit your monthly progress report.
              </p>
            </div>
          </div>
        </div>
      </section>
      </Reveal>

      <Reveal>
      <section className="mx-auto w-full max-w-6xl px-6 pb-20 pt-0">
        <div className="rounded-[32px] border border-brand-green/20 bg-white/90 p-8 shadow-panel">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-greenDark">Space Requests</p>
              <h2 className="mt-2 text-3xl font-bold text-brand-ink">Need a workspace or facility?</h2>
              <p className="mt-3 text-base text-slate-600">
                Submit a space and resource request to book incubation desks, meeting rooms, maker labs, or event
                halls. Our team will review and confirm availability.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Link className="btn-primary w-full" href="/space-request">
                Open the Request Form
              </Link>
              <p className="text-xs text-slate-500">
                You can attach detailed resource information directly in the request.
              </p>
            </div>
          </div>
        </div>
      </section>
      </Reveal>

      <footer className="border-t border-white/70 bg-white/80">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-8 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
          <p>InnoBiz-K Ethiopia. Empowering founders across Ethiopia.</p>
          <div className="flex flex-wrap gap-4">
            <a className="transition hover:text-brand-blue" href="#about">
              About
            </a>
            <a className="transition hover:text-brand-blue" href="#spaces">
              Spaces
            </a>
            <a className="transition hover:text-brand-blue" href="#apply">
              Apply
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
