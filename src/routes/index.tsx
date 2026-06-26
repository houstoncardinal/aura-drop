import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import curatorMarcus from "@/assets/curator-marcus.jpg";
import curatorElena from "@/assets/curator-elena.jpg";
import curatorJulian from "@/assets/curator-julian.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Vault — Submit your music to industry curators" },
      {
        name: "description",
        content:
          "Drop your track into The Vault. Curators behind Drake, SZA, The Weeknd and more review every submission within 48 hours.",
      },
      { property: "og:title", content: "The Vault — Submit your music to industry curators" },
      {
        property: "og:description",
        content:
          "Direct access to executive ears behind today's biggest artists. Real reviews, 48-hour turnaround.",
      },
    ],
  }),
  component: VaultPage,
});

const curators = [
  {
    name: "Marcus Vane",
    role: "Senior A&R · Interscope Records",
    bio: "Primary focus on alternative rap and synth-wave. Signs two new artists every quarter.",
    credits: ["Drake", "SZA", "The Weeknd"],
    image: curatorMarcus,
  },
  {
    name: "Elena Kross",
    role: "Founding Editor · Resident Advisor",
    bio: "Editorial specialist for club-oriented productions and experimental electronic music.",
    credits: ["Aphex Twin", "Peggy Gou", "Four Tet"],
    image: curatorElena,
  },
  {
    name: "Julian Thorne",
    role: "Head of Playlist Strategy",
    bio: "Curating for the global Top 50 and New Music Friday. Always hunting for the next breakout.",
    credits: ["Kendrick Lamar", "Rosalía", "Tyler, The Creator"],
    image: curatorJulian,
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

function VaultPage() {
  const [submitted, setSubmitted] = useState(false);
  const [pitch, setPitch] = useState("");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
    window.setTimeout(() => setSubmitted(false), 3200);
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      {/* Atmosphere */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="noise-bg absolute inset-0" />
        <div className="absolute -top-[10%] -left-[10%] h-[45%] w-[45%] rounded-full bg-accent/5 blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] rounded-full bg-accent/[0.04] blur-[160px]" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-8">
        <div className="font-display text-xl font-semibold uppercase italic tracking-tighter">
          The Vault
        </div>
        <div className="hidden items-center gap-8 md:flex">
          <a href="#curators" className="text-sm font-medium text-zinc-400 transition-colors hover:text-accent">
            Curators
          </a>
          <a href="#submit" className="text-sm font-medium text-zinc-400 transition-colors hover:text-accent">
            Submit
          </a>
          <div className="h-4 w-px bg-zinc-800" />
          <div className="font-mono text-xs uppercase tracking-widest text-zinc-500">
            Studio Active · 02:14 AM
          </div>
        </div>
      </nav>

      {/* Hero + Form */}
      <section className="relative z-10 px-6 pt-12 pb-24">
        <div className="mx-auto grid max-w-7xl items-start gap-16 lg:grid-cols-[1fr_520px]">
          {/* Copy */}
          <div className="flex flex-col gap-8">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/50 px-3 py-1">
              <span className="size-1.5 animate-pulse rounded-full bg-accent" />
              <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400">
                Currently accepting demo submissions
              </span>
            </div>

            <h1 className="max-w-[15ch] text-balance font-display text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">
              Get your music heard by the{" "}
              <span className="italic text-accent">industry gatekeepers</span>
            </h1>

            <p className="max-w-[48ch] text-pretty text-base leading-relaxed text-zinc-400 md:text-lg">
              Direct access to the executive ears behind the biggest names in modern music.
              Your track enters the vault tonight; curators review it tomorrow. No automated
              feedback — just real ears from real studios.
            </p>

            <div className="grid grid-cols-3 gap-8 border-t border-zinc-900 pt-8">
              <Stat value="48h" label="Avg Response" />
              <Stat value="142" label="Signed Artists" />
              <Stat value="12.4k" label="Reviews Sent" />
            </div>
          </div>

          {/* Form */}
          <div id="submit" className="group relative">
            <div className="absolute -inset-4 rounded-3xl bg-accent/5 opacity-0 blur-2xl transition-opacity duration-700 group-hover:opacity-100" />
            <form
              onSubmit={handleSubmit}
              className="vault-glow relative flex flex-col gap-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-8"
            >
              <div className="flex flex-col gap-2">
                <label className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                  Track Submission
                </label>
                <div className="h-px bg-gradient-to-r from-accent/50 to-transparent" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <VaultInput name="artist" placeholder="Artist Name" required />
                <VaultInput name="title" placeholder="Track Title" required />
              </div>

              <select
                name="genre"
                defaultValue=""
                required
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-300 transition-all focus:border-accent/40 focus:outline-none focus:ring-1 focus:ring-accent/40"
              >
                <option value="" disabled className="text-zinc-600">
                  Select Genre
                </option>
                {genres.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>

              <label className="group/upload relative flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-zinc-800 p-8 text-center transition-colors hover:border-accent/30">
                <input type="file" accept="audio/*" className="sr-only" />
                <span className="flex size-8 items-center justify-center rounded-full bg-zinc-800 transition-colors group-hover/upload:bg-accent/10">
                  <span
                    className="size-3 bg-zinc-400 transition-colors group-hover/upload:bg-accent"
                    style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }}
                  />
                </span>
                <span className="text-xs text-zinc-500">
                  Drop high-res WAV or MP3 (Max 50MB)
                </span>
              </label>

              <VaultInput name="link" placeholder="SoundCloud / Spotify Link" type="url" />

              <div className="flex flex-col gap-1.5">
                <textarea
                  name="pitch"
                  value={pitch}
                  onChange={(e) => setPitch(e.target.value.slice(0, 280))}
                  placeholder="The Pitch: tell us the vision behind the track"
                  rows={3}
                  className="w-full resize-none rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm placeholder:text-zinc-600 focus:border-accent/40 focus:outline-none focus:ring-1 focus:ring-accent/40"
                />
                <div className="text-right font-mono text-[10px] text-zinc-600">
                  {pitch.length} / 280
                </div>
              </div>

              <button
                type="submit"
                className="group/btn relative w-full overflow-hidden rounded-lg bg-accent py-4 font-display text-sm font-semibold uppercase tracking-wider text-zinc-950 ring-1 ring-accent transition-transform active:scale-[0.98]"
              >
                <span className="relative z-10">
                  {submitted ? "✓ Deposited — curators notified" : "Deposit into Vault"}
                </span>
                <span className="absolute inset-0 translate-y-full bg-white/20 transition-transform duration-300 group-hover/btn:translate-y-0" />
              </button>

              <p className="text-center font-mono text-[10px] text-zinc-600">
                Secure connection encrypted · Studio access granted
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* Curators */}
      <section id="curators" className="border-y border-zinc-900 bg-zinc-900/30 px-6 py-24">
        <div className="mx-auto flex max-w-7xl flex-col gap-12">
          <div className="flex flex-col gap-2">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
              Active Gatekeepers
            </span>
            <h2 className="font-display text-3xl font-medium tracking-tight md:text-4xl">
              Industry-leading curators online now
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {curators.map((c) => (
              <article
                key={c.name}
                className="group flex flex-col gap-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all hover:border-accent/30 hover:bg-zinc-900"
              >
                <div className="flex gap-4">
                  <img
                    src={c.image}
                    alt={`Portrait of ${c.name}`}
                    className="size-16 shrink-0 rounded-xl object-cover grayscale transition-all duration-500 group-hover:grayscale-0"
                    loading="lazy"
                  />
                  <div className="flex flex-col gap-1">
                    <h3 className="font-display font-medium text-zinc-100">{c.name}</h3>
                    <p className="font-mono text-[10px] uppercase tracking-wider text-accent">
                      {c.role}
                    </p>
                  </div>
                </div>
                <p className="text-xs leading-relaxed text-zinc-400">{c.bio}</p>
                <div className="flex flex-wrap gap-1.5 border-t border-zinc-800/50 pt-4">
                  <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-500">
                    Worked with:
                  </span>
                  {c.credits.map((credit) => (
                    <span
                      key={credit}
                      className="rounded-full bg-zinc-950 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-zinc-300"
                    >
                      {credit}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900 px-6 py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 md:flex-row">
          <div className="flex flex-col gap-2 text-center md:text-left">
            <div className="font-display text-sm font-semibold uppercase italic">The Vault</div>
            <p className="font-mono text-[11px] text-zinc-600">
              Established 2026 · Designed for independent sounds
            </p>
          </div>
          <div className="flex gap-12">
            <FooterCol heading="Resources" links={["Artist Portal", "Curator Dashboard"]} />
            <FooterCol heading="Legal" links={["Privacy Policy", "Terms of Submission"]} />
          </div>
        </div>
      </footer>
    </main>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col">
      <span className="font-display text-2xl font-medium text-zinc-100">{value}</span>
      <span className="font-mono text-[11px] uppercase tracking-widest text-zinc-500">{label}</span>
    </div>
  );
}

function VaultInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      type={props.type ?? "text"}
      className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm transition-all placeholder:text-zinc-600 focus:border-accent/40 focus:outline-none focus:ring-1 focus:ring-accent/40"
    />
  );
}

function FooterCol({ heading, links }: { heading: string; links: string[] }) {
  return (
    <div className="flex flex-col gap-3">
      <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
        {heading}
      </span>
      {links.map((l) => (
        <a key={l} href="#" className="text-xs text-zinc-400 transition-colors hover:text-accent">
          {l}
        </a>
      ))}
    </div>
  );
}
