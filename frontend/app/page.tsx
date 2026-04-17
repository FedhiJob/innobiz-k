"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { MobileMenuButton } from "@/components/mobile-menu-button";
import { useAuth } from "@/context/auth-context";
import { Reveal } from "@/components/reveal";
import { officeSpaceApi, updatesApi } from "@/lib/api";
import type { HeroUpdate, OfficeSpace } from "@/types/api";

const impactMetrics = [
  { label: "Mentors & coaches", value: "25+" },
  { label: "Active cohorts", value: "4" },
  { label: "Workshops hosted", value: "60+" },
  { label: "Partner institutions", value: "10" },
];

const impactTracks = [
  {
    eyebrow: "Founder Support",
    title: "A home for Ethiopian founders",
    description:
      "Tailored incubation, mentoring, and accountability that help high-potential startups grow into investable businesses.",
    accent: "bg-brand-yellow",
  },
  {
    eyebrow: "Network Access",
    title: "People, connection, expansion",
    description:
      "A trusted ecosystem that links founders to partners, markets, and the relationships that create momentum.",
    accent: "bg-brand-greenDark",
  },
  {
    eyebrow: "Execution",
    title: "Hands-on operational support",
    description:
      "Practical guidance on product, finance, and go-to-market work with structured check-ins that keep progress visible.",
    accent: "bg-brand-blue",
  },
];

const aboutHighlights = [
  {
    title: "Human",
    description: "Founder-first support through mentoring, coaching, and practical guidance that stays close to real startup needs.",
    accent: "border-brand-yellow/30 bg-brand-yellow/10",
  },
  {
    title: "Connection",
    description: "A living network of partners, universities, trainers, and ecosystem builders working around the same mission.",
    accent: "border-brand-green/30 bg-brand-green/10",
  },
  {
    title: "Expansion",
    description: "Programs designed to move teams from promising ideas toward market traction, visibility, and sustainable growth.",
    accent: "border-brand-blue/30 bg-brand-blue/10",
  },
];

const aboutStory = [
  {
    label: "What innobiz-k is",
    description:
      "A bilateral initiative between Ethiopia's Ministry of Innovation and Technology and KOICA, built to strengthen the ICT startup and SME ecosystem.",
  },
  {
    label: "What founders receive",
    description:
      "Structured incubation, training, mentorship, unlimited internet access, workspace, and practical operational support inside a dedicated innovation facility.",
  },
  {
    label: "Why it matters",
    description:
      "The program helps ambitious teams build stronger businesses, create quality jobs, and access the networks required to keep moving forward.",
  },
];

const aboutMetrics = [
  { value: "2000 sqm", label: "innovation facility" },
  { value: "34", label: "pilot startups supported" },
  { value: "7 weeks", label: "training in the pilot phase" },
  { value: "6 months", label: "mentorship and coaching" },
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

const partnerLogos = [
  { name: "Addis Ababa Science and Technology University", logo: "/ink-collabs/aastu.png" },
  { name: "Addis Ababa University", logo: "/ink-collabs/aau.png" },
  { name: "Adama Science and Technology University", logo: "/ink-collabs/astu.png" },
  { name: "Connect", logo: "/ink-collabs/conn.png" },
  { name: "Dire Dawa University", logo: "/ink-collabs/ddu.png" },
  { name: "Debre Berhan University", logo: "/ink-collabs/debre-berhan.png" },
  { name: "European Union", logo: "/ink-collabs/eu.png" },
  { name: "Faris", logo: "/ink-collabs/faris.png" },
  { name: "Germany", logo: "/ink-collabs/german.png" },
  { name: "IceAddis", logo: "/ink-collabs/iceaddis.png" },
  { name: "Intuto", logo: "/ink-collabs/intuto.png" },
  { name: "JICA", logo: "/ink-collabs/jica.png" },
  { name: "Jimma University", logo: "/ink-collabs/JU.png" },
  { name: "KOICA", logo: "/ink-collabs/koica.png" },
  { name: "Mastercard Foundation", logo: "/ink-collabs/mastercard.png" },
  { name: "Ministry of Innovation and Technology", logo: "/ink-collabs/mint.png" },
  { name: "NICE", logo: "/ink-collabs/nice.png" },
  { name: "Ninja", logo: "/ink-collabs/ninja.png" },
  { name: "The World Bank", logo: "/ink-collabs/the-world-bank.png" },
  { name: "UNDP", logo: "/ink-collabs/undp.png" },
  { name: "xHub", logo: "/ink-collabs/x-hub.png" },
];

const testimonials = [
  {
    quote:
      "innobiz-k helped us validate our product and connect with mentors who actually understand our market.",
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

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const [heroIndex, setHeroIndex] = useState(0);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(defaultHeroSlides);
  const [officeSpaces, setOfficeSpaces] = useState<OfficeSpace[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  useEffect(() => {
    const loadOfficeSpaces = async () => {
      try {
        const response = await officeSpaceApi.list();
        setOfficeSpaces(response);
      } catch {
        setOfficeSpaces([]);
      }
    };

    void loadOfficeSpaces();
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [user, isLoading]);

  return (
    <main className="min-h-screen text-brand-ink">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute -left-40 top-16 h-72 w-72 rounded-full bg-brand-yellow/20 blur-[120px] animate-ink-drift" />
        <div className="pointer-events-none absolute right-10 top-10 h-64 w-64 rounded-full bg-brand-green/20 blur-[120px] animate-ink-drift-slow" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-brand-blue/20 blur-[140px] animate-ink-pulse" />
        <div className="pointer-events-none absolute left-10 top-40 h-16 w-16 rounded-full bg-brand-orange/20 blur-2xl animate-ink-drift-slow" />

        <header className="relative z-10 mx-auto w-full max-w-6xl px-6 py-6">
          <div className="flex items-center justify-between gap-4">
            <Link className="flex min-w-0 items-center gap-3" href="/">
              <Image src="/ink-logo.png" alt="innobiz-k logo" width={56} height={40} />
              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-brand-ink">innobiz-k Ethiopia</p>
                <p className="truncate text-xs text-slate-500">Incubation Application Portal</p>
              </div>
            </Link>

            <div className="hidden items-center gap-6 lg:flex">
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
            </div>

            <div className="lg:hidden">
              <MobileMenuButton
                isOpen={mobileMenuOpen}
                onClick={() => setMobileMenuOpen((current) => !current)}
              />
            </div>
          </div>

          {mobileMenuOpen ? (
            <div className="mt-4 rounded-[28px] border border-white/80 bg-white/95 p-4 shadow-panel backdrop-blur-sm lg:hidden">
              <nav className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
                <a className="rounded-2xl px-4 py-3 transition hover:bg-slate-50" href="#about" onClick={() => setMobileMenuOpen(false)}>
                  About
                </a>
                <a className="rounded-2xl px-4 py-3 transition hover:bg-slate-50" href="#programs" onClick={() => setMobileMenuOpen(false)}>
                  Programs
                </a>
                <a className="rounded-2xl px-4 py-3 transition hover:bg-slate-50" href="#spaces" onClick={() => setMobileMenuOpen(false)}>
                  Office Spaces
                </a>
                <Link
                  className="rounded-2xl px-4 py-3 transition hover:bg-slate-50"
                  href="/space-request"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Request Space
                </Link>
                <a className="rounded-2xl px-4 py-3 transition hover:bg-slate-50" href="#apply" onClick={() => setMobileMenuOpen(false)}>
                  Apply
                </a>
              </nav>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Link className="btn-secondary text-center" href={secondaryCta.href} onClick={() => setMobileMenuOpen(false)}>
                  {secondaryCta.label}
                </Link>
                <Link className="btn-primary text-center" href={primaryCta.href} onClick={() => setMobileMenuOpen(false)}>
                  {primaryCta.label}
                </Link>
              </div>
            </div>
          ) : null}
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
              innobiz-k supports ambitious Ethiopian startups with mentorship, community, and the resources to turn
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
          <div className="rounded-[32px] border border-brand-blue/10 bg-white/90 p-8 shadow-panel">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-blue">Impact Snapshot</p>
                <h2 className="mt-2 text-2xl font-bold text-brand-ink sm:text-3xl">
                  Momentum built through guidance, space, and ecosystem trust.
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                  innobiz-k combines workspace, mentorship, and structured founder support so teams can stay focused on
                  progress instead of navigating alone.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-[30rem]">
                {impactMetrics.map((item) => (
                  <div
                    className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-5 text-center"
                    key={item.label}
                  >
                    <p className="text-2xl font-bold text-brand-ink">{item.value}</p>
                    <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              {impactTracks.map((item) => (
                <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-panel" key={item.title}>
                  <div className="flex items-center gap-3">
                    <span className={`h-3 w-3 rounded-full ${item.accent}`} />
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                      {item.eyebrow}
                    </p>
                  </div>
                  <p className="mt-4 text-lg font-semibold text-brand-ink">{item.title}</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{item.description}</p>
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
                Trusted by institutions shaping Ethiopia's innovation ecosystem.
              </h2>
              <p className="text-base text-slate-600">
                A growing network of universities, public institutions, and ecosystem builders moves with us.
              </p>
            </div>
            <div className="partner-marquee-shell mt-8">
              <div className="partner-marquee-track">
                {[...partnerLogos, ...partnerLogos].map((partner, index) => (
                  <div
                    className="partner-logo-chip"
                    key={`${partner.name}-${index}`}
                    title={partner.name}
                  >
                    <Image
                      alt={`${partner.name} logo`}
                      className="max-h-10 w-auto object-contain"
                      height={64}
                      src={partner.logo}
                      width={160}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="mx-auto w-full max-w-6xl px-6 pb-16">
          <div className="rounded-[32px] border border-brand-yellow/20 bg-white/90 p-8 shadow-panel">
            <div className="flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-yellow">Testimonials</p>
              <h2 className="text-3xl font-bold text-brand-ink">Founders talking about the innobiz-k experience.</h2>
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
          <div className="rounded-[32px] border border-white/70 bg-white/90 p-8 shadow-panel">
            <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
              <div className="space-y-6">
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-greenDark">About innobiz-k</p>
                  <h2 className="text-3xl font-bold text-brand-ink">A place where each idea unfolds.</h2>
                  <p className="max-w-2xl text-base text-slate-600">
                    innobiz-k Ethiopia helps ambitious founders move from early promise to stronger execution through
                    incubation, infrastructure, and ecosystem collaboration.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  {aboutHighlights.map((item) => (
                    <div className={`rounded-3xl border p-5 shadow-panel ${item.accent}`} key={item.title}>
                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-ink/80">{item.title}</p>
                      <p className="mt-3 text-sm leading-6 text-slate-700">{item.description}</p>
                    </div>
                  ))}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {aboutMetrics.map((item) => (
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5" key={item.label}>
                      <p className="text-2xl font-bold text-brand-ink">{item.value}</p>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {aboutStory.map((item, index) => (
                  <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5 shadow-panel" key={item.label}>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-blue">
                      0{index + 1} {item.label}
                    </p>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
                  </div>
                ))}
              </div>
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
            Browse the current innobiz-k space catalog, open a room or workspace, and continue straight into the request flow.
          </p>
        </div>
        {officeSpaces.length > 0 ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {officeSpaces.slice(0, 6).map((space, index) => (
              <Link
                className="group relative overflow-hidden rounded-3xl border border-white/70 bg-white/90 p-5 shadow-panel transition hover:-translate-y-1"
                href={`/spaces/${space.slug}`}
                key={space.id}
              >
                <div className="relative mb-4 h-44 overflow-hidden rounded-2xl bg-gradient-to-br from-brand-green/20 via-white to-brand-blue/20">
                  {space.imageUrl ? (
                    <Image
                      alt={space.name}
                      className="object-cover transition duration-500 group-hover:scale-[1.03]"
                      fill
                      sizes="(max-width: 1024px) 100vw, 33vw"
                      src={space.imageUrl}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
                      innobiz-k
                    </div>
                  )}
                </div>
                <p className="text-sm font-semibold text-brand-ink">{space.name}</p>
                <p className="mt-1 text-sm text-slate-600">{space.shortDescription}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {space.locationLabel ? (
                    <span className="inline-flex rounded-full border border-white/80 bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate-500">
                      {space.locationLabel}
                    </span>
                  ) : null}
                  {space.capacity ? (
                    <span className="inline-flex rounded-full border border-white/80 bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate-500">
                      Capacity {space.capacity}
                    </span>
                  ) : null}
                </div>
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.24em] text-brand-blue">
                  View details
                </p>
                <div
                  className={`pointer-events-none absolute -right-10 -top-10 h-20 w-20 rounded-full ${
                    index % 3 === 0
                      ? "bg-brand-yellow/30"
                      : index % 3 === 1
                        ? "bg-brand-green/30"
                        : "bg-brand-blue/30"
                  } blur-2xl`}
                />
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-[32px] border border-dashed border-brand-blue/20 bg-white/80 p-8 text-center shadow-panel">
            <h3 className="text-xl font-semibold text-brand-ink">The office space catalog is being curated.</h3>
            <p className="mt-3 text-sm text-slate-600 sm:text-base">
              Our admin team can now publish spaces here with current images, descriptions, and availability context.
            </p>
            <Link className="btn-primary mt-5 inline-flex" href="/space-request">
              Apply for Space
            </Link>
          </div>
        )}
      </section>
      </Reveal>

      <Reveal>
      <section id="apply" className="mx-auto w-full max-w-6xl px-6 pb-16 pt-8">
        <div className="rounded-[32px] border border-brand-blue/20 bg-gradient-to-r from-white via-brand-blue/5 to-brand-green/10 p-8 shadow-panel">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-greenDark">Apply Now</p>
                <h2 className="mt-2 text-3xl font-bold text-brand-ink">Ready to bring your startup to innobiz-k?</h2>
                <p className="mt-3 text-base text-slate-600">
                  Create your application, select the support you need, and submit your startup profile for review. Our
                  team will guide you through the rest.
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
          <p>innobiz-k Ethiopia. Empowering founders across Ethiopia.</p>
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
