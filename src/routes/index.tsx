import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState, type FormEvent } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Vault — Submit your music to industry curators" },
      {
        name: "description",
        content:
          "Drop your track into The Vault. Active industry curators listen to every submission and respond within 48 hours.",
      },
      { property: "og:title", content: "The Vault — Submit your music to industry curators" },
      {
        property: "og:description",
        content:
          "Direct access to working producers, engineers and visual directors. Real reviews, 48-hour turnaround.",
      },
    ],
  }),
  component: VaultPage,
});

const curators = [
  {
    name: "OGB Youngn",
    handle: "@ogsbyoung",
    instagram: "https://www.instagram.com/ogsbyoung/",
    role: "Producer · Recording Artist",
    bio: "Independent producer and recording artist with placements across hip-hop and R&B. Active ear for melodic rap, alt-R&B and anything with a real pocket.",
    tags: ["Hip-Hop", "R&B", "Melodic Rap"],
    accent: "from-emerald-400/40 to-teal-500/10",
    initials: "OG",
    online: true,
  },
  {
    name: "Hazytrax",
    handle: "@hazytrax",
    instagram: "https://www.instagram.com/hazytrax",
    role: "Producer · Beatmaker",
    bio: "Beatmaker and trap producer behind underground placements and a steady drop of original instrumentals. Listening for vocalists who can ride heavy 808s and dark melodies.",
    tags: ["Trap", "Drill", "Underground"],
    accent: "from-emerald-300/40 to-emerald-700/10",
    initials: "HZ",
    online: true,
  },
  {
    name: "Akeef Studios",
    handle: "@akeefstudios",
    instagram: "https://www.instagram.com/akeefstudios",
    role: "Director · Visuals & A&R",
    bio: "Music video director and creative shop behind visuals for rising rap artists (Ync Jay, Lil Nate and more). Reviews submissions through a visual-first lens — songs that already see themselves on screen.",
    tags: ["Rap", "Visuals", "Artist Dev"],
    accent: "from-teal-300/40 to-emerald-600/10",
    initials: "AK",
    online: true,
  },
];


const genres = [
  "Electronic / Club",
  "Alternative R&B",
  "Hyperpop / Glitch",
  "Modern Hip-Hop",
  "Indie / Alt-Pop",
  "Experimental",
];

type FormState = {
  artist: string;
  title: string;
  genre: string;
  file: File | null;
  link: string;
  pitch: string;
};

const initialForm: FormState = {
  artist: "",
  title: "",
  genre: "",
  file: null,
  link: "",
  pitch: "",
};

const steps = [
  { id: 1, label: "Identity", hint: "Who's submitting" },
  { id: 2, label: "The Track", hint: "Audio + metadata" },
  { id: 3, label: "The Pitch", hint: "Make it count" },
];

function VaultPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-950 text-zinc-100">
      {/* Atmospheric background */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#0a1a14_0%,#050a08_55%,#020503_100%)]" />
        <div className="grid-pattern animate-drift absolute inset-0" />
        <div className="dot-pattern absolute inset-0 opacity-60" />
        <div className="noise-bg absolute inset-0" />
        <div className="absolute -top-1/4 -left-1/4 h-[60vmax] w-[60vmax] animate-aurora rounded-full bg-[radial-gradient(circle_at_center,rgba(52,211,153,0.22),transparent_60%)] blur-3xl" />
        <div className="absolute -bottom-1/4 -right-1/4 h-[55vmax] w-[55vmax] animate-aurora-2 rounded-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.18),transparent_60%)] blur-3xl" />
        <div className="absolute top-1/3 left-1/2 h-[40vmax] w-[40vmax] -translate-x-1/2 animate-aurora rounded-full bg-[radial-gradient(circle_at_center,rgba(110,231,183,0.10),transparent_65%)] blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(5,10,8,0.6)_70%,#050a08_100%)]" />
      </div>

      <Nav />
      <Hero />
      <Curators />
      <HowItWorks />
      <Footer />
    </main>
  );
}

function Nav() {
  return (
    <nav className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
      <a href="#top" className="group flex items-center gap-2.5">
        <span className="relative flex size-8 items-center justify-center rounded-lg bg-zinc-900 ring-1 ring-zinc-800 transition-all group-hover:ring-accent/40">
          <span className="size-1.5 rounded-full bg-accent animate-pulse-ring" />
        </span>
        <span className="font-display text-lg font-semibold uppercase italic tracking-tighter">
          The Vault
        </span>
      </a>
      <div className="hidden items-center gap-8 md:flex">
        <a href="#curators" className="text-sm font-medium text-zinc-400 transition-colors hover:text-accent">
          Curators
        </a>
        <a href="#how" className="text-sm font-medium text-zinc-400 transition-colors hover:text-accent">
          How it works
        </a>
        <div className="h-4 w-px bg-zinc-800" />
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
          <span className="text-accent">●</span> 12 curators online
        </div>
      </div>
      <a
        href="#submit"
        className="hidden rounded-full bg-zinc-100 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-950 transition-all hover:bg-accent hover:shadow-[0_0_30px_-4px_rgba(52,211,153,0.7)] md:inline-flex"
      >
        Submit
      </a>
    </nav>
  );
}

function Hero() {
  return (
    <section id="top" className="relative z-10 px-6 pb-32 pt-12 lg:px-10">
      <div className="mx-auto grid max-w-7xl items-start gap-16 lg:grid-cols-[1fr_560px]">
        <div className="flex flex-col gap-8 pt-10">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-3.5 py-1.5 backdrop-blur">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-accent" />
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-300">
              Vault is open · Accepting submissions
            </span>
          </div>

          <h1 className="max-w-[18ch] text-balance font-display text-5xl font-semibold leading-[1.02] tracking-tight md:text-7xl lg:text-[5.5rem]">
            Your demo,{" "}
            <span className="text-gradient-accent italic">heard</span> by the people who make the hits.
          </h1>

          <p className="max-w-[52ch] text-pretty text-base leading-relaxed text-zinc-400 md:text-lg">
            Direct access to executive A&Rs, label heads, and editorial curators working daily
            with the biggest names in music. No algorithms. No gatekeepers between you and the
            decision-maker. Just a 48-hour turnaround on a real human review.
          </p>

          <div className="flex flex-wrap items-center gap-6 pt-2">
            <a
              href="#submit"
              className="group relative inline-flex items-center gap-3 rounded-full bg-accent px-7 py-4 font-display text-sm font-semibold uppercase tracking-wider text-zinc-950 accent-glow transition-all hover:scale-[1.02] hover:shadow-[0_0_50px_-4px_rgba(52,211,153,0.8)]"
            >
              Submit your track
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </a>
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <span className="font-mono text-[10px] uppercase tracking-wider">No fee for first submission</span>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-800/40 elite-shadow">
            <Stat value="48h" label="Avg response" />
            <Stat value="142" label="Signed artists" />
            <Stat value="12.4k" label="Reviews sent" />
          </div>
        </div>

        <SubmissionWizard />
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col gap-1 bg-zinc-950 px-6 py-5">
      <span className="font-display text-3xl font-semibold tracking-tight text-zinc-50">{value}</span>
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">{label}</span>
    </div>
  );
}

/* ─────────────────  WIZARD  ───────────────── */

function SubmissionWizard() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(initialForm);
  const [submitted, setSubmitted] = useState(false);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const stepValid = useMemo(() => {
    if (step === 1) return form.artist.trim().length > 1;
    if (step === 2) return form.genre !== "" && (form.file !== null || form.link.trim().length > 4);
    if (step === 3) return form.title.trim().length > 0 && form.pitch.trim().length > 10;
    return false;
  }, [step, form]);

  function next() {
    if (!stepValid) return;
    if (step < 3) setStep(step + 1);
    else handleSubmit();
  }
  function back() {
    if (step > 1) setStep(step - 1);
  }
  function handleSubmit() {
    setSubmitted(true);
  }

  return (
    <div id="submit" className="relative">
      {/* Outer glow */}
      <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-tr from-accent/10 via-transparent to-accent/5 blur-2xl" />
      <div className="absolute -inset-px rounded-[1.5rem] bg-gradient-to-b from-zinc-700/60 via-zinc-800/20 to-transparent" />

      <div className="vault-glow relative overflow-hidden rounded-3xl border border-zinc-800/80 bg-zinc-950/80 p-7 backdrop-blur-xl lg:p-9">
        {/* Top label bar */}
        <div className="mb-7 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-accent/10 ring-1 ring-accent/30">
              <span className="size-2 rounded-full bg-accent animate-pulse-ring" />
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                Submission Channel
              </span>
              <span className="font-display text-sm font-medium text-zinc-100">
                Encrypted · Live curator queue
              </span>
            </div>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
            Step {step} / 3
          </span>
        </div>

        {/* Progress */}
        <Progress step={step} />

        {/* Body */}
        <div className="mt-8 min-h-[340px]">
          {submitted ? (
            <SuccessPanel />
          ) : (
            <div key={step} className="animate-float-up">
              {step === 1 && <StepIdentity form={form} update={update} />}
              {step === 2 && <StepTrack form={form} update={update} />}
              {step === 3 && <StepPitch form={form} update={update} />}
            </div>
          )}
        </div>

        {!submitted && (
          <div className="mt-8 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={back}
              disabled={step === 1}
              className="rounded-full px-5 py-3 text-xs font-medium uppercase tracking-wider text-zinc-400 transition-all hover:text-zinc-100 disabled:cursor-not-allowed disabled:opacity-30"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={next}
              disabled={!stepValid}
              className="group relative flex-1 overflow-hidden rounded-full bg-accent px-6 py-4 font-display text-sm font-semibold uppercase tracking-wider text-zinc-950 transition-all hover:shadow-[0_0_40px_-6px_rgba(52,211,153,0.8)] disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-600 disabled:shadow-none"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {step === 3 ? "Deposit into Vault" : "Continue"}
                <span className="transition-transform group-enabled:group-hover:translate-x-1">→</span>
              </span>
              {stepValid && (
                <span className="absolute inset-0 shimmer opacity-60" />
              )}
            </button>
          </div>
        )}

        {!submitted && (
          <p className="mt-5 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600">
            🔒 Encrypted upload · Reviewed within 48h · Zero spam
          </p>
        )}
      </div>
    </div>
  );
}

function Progress({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-3">
      {steps.map((s, i) => {
        const active = step === s.id;
        const done = step > s.id;
        return (
          <div key={s.id} className="flex flex-1 items-center gap-3">
            <div className="flex flex-col gap-1.5 flex-1">
              <div className="relative h-[3px] w-full overflow-hidden rounded-full bg-zinc-800">
                <div
                  className={`h-full rounded-full bg-accent transition-all duration-700 ease-out ${
                    done ? "w-full" : active ? "w-1/2" : "w-0"
                  }`}
                />
              </div>
              <div className="flex items-center justify-between">
                <span
                  className={`font-mono text-[9px] uppercase tracking-[0.2em] transition-colors ${
                    active || done ? "text-accent" : "text-zinc-600"
                  }`}
                >
                  0{s.id} · {s.label}
                </span>
              </div>
            </div>
            {i < steps.length - 1 && <span className="text-zinc-700">·</span>}
          </div>
        );
      })}
    </div>
  );
}

/* Steps */

function StepIdentity({
  form,
  update,
}: {
  form: FormState;
  update: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <StepHeading title="Who's submitting?" sub="Your artist name as it appears across platforms." />
      <Field label="Artist Name">
        <input
          autoFocus
          value={form.artist}
          onChange={(e) => update("artist", e.target.value)}
          placeholder="e.g. Nova Reign"
          className="vault-input"
        />
      </Field>
      <Field label="Streaming or Social Link (optional)" hint="Helps curators verify you fast.">
        <input
          value={form.link}
          onChange={(e) => update("link", e.target.value)}
          placeholder="spotify.com/artist/... or @yourhandle"
          className="vault-input"
        />
      </Field>
    </div>
  );
}

function StepTrack({
  form,
  update,
}: {
  form: FormState;
  update: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) update("file", f);
  }

  return (
    <div className="flex flex-col gap-5">
      <StepHeading title="Drop the track" sub="High-resolution audio or a private streaming link." />

      <Field label="Genre">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {genres.map((g) => {
            const active = form.genre === g;
            return (
              <button
                key={g}
                type="button"
                onClick={() => update("genre", g)}
                className={`rounded-lg border px-3 py-2.5 text-left text-xs font-medium transition-all ${
                  active
                    ? "border-accent bg-accent/10 text-accent shadow-[0_0_24px_-8px_rgba(52,211,153,0.6)]"
                    : "border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                }`}
              >
                {g}
              </button>
            );
          })}
        </div>
      </Field>

      <Field label="Audio File">
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={`group relative flex cursor-pointer flex-col items-center gap-3 overflow-hidden rounded-xl border-2 border-dashed p-6 text-center transition-all ${
            dragOver
              ? "border-accent bg-accent/5"
              : form.file
              ? "border-accent/60 bg-accent/[0.04]"
              : "border-zinc-800 bg-zinc-900/30 hover:border-accent/30 hover:bg-zinc-900/50"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="audio/*"
            onChange={(e) => update("file", e.target.files?.[0] ?? null)}
            className="sr-only"
          />
          {form.file ? (
            <div className="flex w-full flex-col items-center gap-3">
              <Waveform />
              <div className="flex flex-col items-center gap-0.5">
                <span className="font-display text-sm font-medium text-zinc-100">{form.file.name}</span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                  {(form.file.size / (1024 * 1024)).toFixed(2)} MB · Ready to deposit
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  update("file", null);
                }}
                className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 hover:text-accent"
              >
                Replace file
              </button>
            </div>
          ) : (
            <>
              <div className="flex size-12 items-center justify-center rounded-full bg-zinc-900 ring-1 ring-zinc-800 transition-all group-hover:bg-accent/10 group-hover:ring-accent/30">
                <span
                  className="size-4 bg-zinc-400 transition-colors group-hover:bg-accent"
                  style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }}
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-zinc-200">
                  Drop your file here, or <span className="text-accent">browse</span>
                </span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                  WAV · AIFF · MP3 (up to 50 MB)
                </span>
              </div>
            </>
          )}
        </label>
      </Field>
    </div>
  );
}

function StepPitch({
  form,
  update,
}: {
  form: FormState;
  update: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <StepHeading title="Make it count" sub="One sentence on the track, one on the vision." />
      <Field label="Track Title">
        <input
          autoFocus
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          placeholder="e.g. Midnight Ceremony"
          className="vault-input"
        />
      </Field>
      <Field label="The Pitch">
        <textarea
          value={form.pitch}
          onChange={(e) => update("pitch", e.target.value.slice(0, 280))}
          placeholder="Why does this track deserve a curator's ears tonight?"
          rows={4}
          className="vault-input resize-none"
        />
        <div className="mt-1.5 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-zinc-600">
          <span>Sharp pitches get faster reviews</span>
          <span className={form.pitch.length > 240 ? "text-accent" : ""}>{form.pitch.length} / 280</span>
        </div>
      </Field>
    </div>
  );
}

function SuccessPanel() {
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-10 text-center animate-float-up">
      <div className="relative flex size-20 items-center justify-center rounded-full bg-accent/10 ring-1 ring-accent/40">
        <span className="absolute inset-0 rounded-full animate-pulse-ring" />
        <svg viewBox="0 0 24 24" fill="none" className="size-9 text-accent">
          <path
            d="M5 12.5l4.5 4.5L19 7.5"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="font-display text-2xl font-semibold tracking-tight">Deposited into the Vault</h3>
        <p className="max-w-sm text-sm leading-relaxed text-zinc-400">
          Three curators have been notified. Expect a personal response within 48 hours, straight
          to your inbox.
        </p>
      </div>
      <div className="mt-2 flex items-center gap-3 rounded-full border border-zinc-800 bg-zinc-900/60 px-4 py-2">
        <span className="size-1.5 animate-pulse rounded-full bg-accent" />
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-400">
          Reference · VLT-{Math.floor(Math.random() * 90000 + 10000)}
        </span>
      </div>
    </div>
  );
}

/* Form atoms */

function StepHeading({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="flex flex-col gap-1">
      <h2 className="font-display text-2xl font-semibold tracking-tight text-zinc-50">{title}</h2>
      <p className="text-sm text-zinc-500">{sub}</p>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
          {label}
        </label>
        {hint && <span className="text-[10px] text-zinc-600">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function Waveform() {
  const bars = 28;
  return (
    <div className="flex h-10 items-center gap-[3px]">
      {Array.from({ length: bars }).map((_, i) => (
        <span
          key={i}
          className="block w-[3px] origin-center rounded-full bg-accent animate-wave"
          style={{
            height: `${30 + Math.abs(Math.sin(i * 0.6)) * 70}%`,
            animationDelay: `${i * 60}ms`,
          }}
        />
      ))}
    </div>
  );
}

/* ─────────────────  CURATORS  ───────────────── */

function Curators() {
  return (
    <section id="curators" className="relative z-10 border-t border-zinc-900/80 bg-zinc-950/40 px-6 py-28 lg:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-14">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="flex flex-col gap-3">
            <span className="font-mono text-xs uppercase tracking-[0.22em] text-accent">
              ◇ The Gatekeepers
            </span>
            <h2 className="max-w-2xl font-display text-4xl font-semibold tracking-tight md:text-5xl">
              The people behind the records you know.
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-zinc-400">
            Each submission is routed to the curator whose ear matches your genre. No interns. No
            AI screening. The real decision-maker hears your track.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {curators.map((c, idx) => (
            <CuratorCard key={c.name} c={c} idx={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CuratorCard({ c, idx }: { c: (typeof curators)[number]; idx: number }) {
  return (
    <article
      className="group relative flex flex-col gap-5 overflow-hidden rounded-2xl border border-zinc-800/80 bg-gradient-to-b from-zinc-900/80 to-zinc-950 p-6 elite-shadow transition-all duration-500 hover:-translate-y-1 hover:border-accent/30"
      style={{ animationDelay: `${idx * 80}ms` }}
    >
      {/* Accent glow on hover */}
      <div className="pointer-events-none absolute inset-0 -z-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-accent/20 to-transparent" />
        <div className="absolute -bottom-12 left-1/2 h-32 w-32 -translate-x-1/2 rounded-full bg-accent/20 blur-3xl" />
      </div>

      <div className="relative flex items-start gap-4">
        <div className="relative shrink-0">
          <img
            src={c.image}
            alt={`Portrait of ${c.name}`}
            width={64}
            height={64}
            loading="lazy"
            className="size-16 rounded-2xl object-cover ring-1 ring-zinc-800 grayscale transition-all duration-500 group-hover:grayscale-0 group-hover:ring-accent/40"
          />
          {c.online && (
            <span className="absolute -bottom-1 -right-1 flex size-4 items-center justify-center rounded-full bg-zinc-950 ring-2 ring-zinc-950">
              <span className="size-2 rounded-full bg-accent animate-pulse-ring" />
            </span>
          )}
        </div>
        <div className="flex flex-col gap-0.5">
          <h3 className="font-display text-lg font-semibold tracking-tight text-zinc-50">
            {c.name}
          </h3>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent">{c.role}</p>
        </div>
      </div>

      <p className="relative text-sm leading-relaxed text-zinc-400">{c.bio}</p>

      <div className="relative flex flex-col gap-2 border-t border-zinc-800/60 pt-4">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
          Notable credits
        </span>
        <div className="flex flex-wrap gap-1.5">
          {c.credits.map((credit) => (
            <span
              key={credit}
              className="rounded-full border border-zinc-800 bg-zinc-950/60 px-2.5 py-1 text-[10px] font-medium text-zinc-200 transition-colors group-hover:border-zinc-700"
            >
              {credit}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

/* ─────────────────  HOW IT WORKS  ───────────────── */

function HowItWorks() {
  const items = [
    {
      n: "01",
      t: "Drop your track",
      d: "Three quick steps. Upload audio or paste a private link in under a minute.",
    },
    {
      n: "02",
      t: "Routed to the right ear",
      d: "Our team matches your genre to the curator who lives in that sound every day.",
    },
    {
      n: "03",
      t: "Personal review in 48h",
      d: "Real feedback. If they're moved, an intro to the rooms where careers begin.",
    },
  ];
  return (
    <section id="how" className="relative z-10 border-t border-zinc-900/80 px-6 py-28 lg:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-14">
        <div className="flex max-w-2xl flex-col gap-3">
          <span className="font-mono text-xs uppercase tracking-[0.22em] text-accent">◇ The Process</span>
          <h2 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">
            Three steps to the room you've been trying to reach.
          </h2>
        </div>
        <div className="grid gap-px overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-800/40 md:grid-cols-3">
          {items.map((it) => (
            <div
              key={it.n}
              className="group flex flex-col gap-6 bg-zinc-950 p-8 transition-colors hover:bg-zinc-900/70"
            >
              <span className="font-display text-5xl font-semibold tracking-tight text-zinc-800 transition-colors group-hover:text-accent">
                {it.n}
              </span>
              <div className="flex flex-col gap-2">
                <h3 className="font-display text-xl font-semibold tracking-tight">{it.t}</h3>
                <p className="text-sm leading-relaxed text-zinc-400">{it.d}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-950 p-10 elite-shadow md:p-14">
          <div className="absolute -right-20 -top-20 size-72 rounded-full bg-accent/10 blur-3xl" />
          <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div className="flex max-w-xl flex-col gap-3">
              <h3 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
                Ready to be heard?
              </h3>
              <p className="text-sm text-zinc-400">
                Your first submission is on us. Real ears, 48 hours, zero spam.
              </p>
            </div>
            <a
              href="#submit"
              className="group inline-flex items-center gap-3 rounded-full bg-accent px-7 py-4 font-display text-sm font-semibold uppercase tracking-wider text-zinc-950 accent-glow transition-all hover:scale-[1.02]"
            >
              Deposit into the Vault
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="relative z-10 border-t border-zinc-900/80 px-6 py-12 lg:px-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 md:flex-row">
        <div className="flex flex-col gap-1.5 text-center md:text-left">
          <div className="font-display text-sm font-semibold uppercase italic">The Vault</div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600">
            Established 2026 · For independent sounds
          </p>
        </div>
        <div className="flex gap-8 text-xs text-zinc-500">
          <a href="#" className="hover:text-accent">Artist Portal</a>
          <a href="#" className="hover:text-accent">Privacy</a>
          <a href="#" className="hover:text-accent">Terms</a>
        </div>
      </div>
    </footer>
  );
}
