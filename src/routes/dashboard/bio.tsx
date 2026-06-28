import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../lib/auth";
import { supabase, type PressKit } from "../../lib/supabase";

export const Route = createFileRoute("/dashboard/bio")({
  component: BioPage,
});

const SOCIAL_FIELDS = [
  { key: "instagram",   label: "Instagram",    placeholder: "instagram.com/yourname" },
  { key: "tiktok",      label: "TikTok",       placeholder: "tiktok.com/@yourname"   },
  { key: "spotify",     label: "Spotify",      placeholder: "open.spotify.com/artist/..." },
  { key: "apple",       label: "Apple Music",  placeholder: "music.apple.com/..."    },
  { key: "youtube",     label: "YouTube",      placeholder: "youtube.com/@yourname"  },
  { key: "soundcloud",  label: "SoundCloud",   placeholder: "soundcloud.com/yourname"},
] as const;

const EMPTY_KIT: Omit<PressKit, "id" | "user_id" | "updated_at"> = {
  artist_name: "",
  tagline: "",
  bio: "",
  genre: "",
  location: "",
  influences: "",
  press_quote: "",
  social_links: {},
};

function BioPage() {
  const { user } = useAuth();
  const [kit, setKit] = useState(EMPTY_KIT);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("press_kits")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setKit(data as PressKit);
        setLoading(false);
      });
  }, [user]);

  function update<K extends keyof typeof EMPTY_KIT>(key: K, value: (typeof EMPTY_KIT)[K]) {
    setKit((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(save, 1800);
  }

  function updateSocial(key: string, value: string) {
    setKit((prev) => ({
      ...prev,
      social_links: { ...prev.social_links, [key]: value },
    }));
    setSaved(false);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(save, 1800);
  }

  async function save() {
    if (!user) return;
    setSaving(true);
    await supabase.from("press_kits").upsert(
      { ...kit, user_id: user.id, updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    );
    setSaving(false);
    setSaved(true);
  }

  function copyBio() {
    const text = [
      kit.artist_name && `${kit.artist_name}`,
      kit.tagline && `"${kit.tagline}"`,
      "",
      kit.bio,
      "",
      kit.genre && `Genre: ${kit.genre}`,
      kit.location && `Based in: ${kit.location}`,
      kit.influences && `Influences: ${kit.influences}`,
      kit.press_quote && `\n"${kit.press_quote}"`,
    ]
      .filter((l) => l !== undefined)
      .join("\n");
    navigator.clipboard.writeText(text);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <span className="size-2 animate-pulse rounded-full bg-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-600">△ Bio & Press Kit</p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">Press Kit Builder</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Your one-sheet for labels, blogs, and playlists. Auto-saves as you type.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`font-mono text-[10px] transition-opacity ${saving ? "text-accent opacity-100" : saved ? "text-zinc-500 opacity-100" : "opacity-0"}`}>
            {saving ? "Saving…" : "Saved ✓"}
          </span>
          <button
            onClick={copyBio}
            className="rounded-full border border-zinc-700 px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-zinc-400 transition-colors hover:border-accent hover:text-accent"
          >
            Copy Bio
          </button>
          <button
            onClick={save}
            className="rounded-full bg-accent px-5 py-2 font-mono text-[10px] uppercase tracking-wider text-zinc-950 transition-all hover:shadow-[0_0_24px_-4px_rgba(52,211,153,0.6)]"
          >
            Save
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Form */}
        <div className="space-y-5">
          <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-6">
            <h2 className="mb-4 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
              Identity
            </h2>
            <div className="space-y-4">
              {([
                { key: "artist_name" as const, label: "Artist / Band Name", placeholder: "Your name or alias" },
                { key: "tagline" as const,     label: "Tagline",            placeholder: "One punchy sentence about your sound" },
                { key: "genre" as const,       label: "Genre(s)",           placeholder: "Trap, R&B, Alternative Hip-Hop..." },
                { key: "location" as const,    label: "Location",           placeholder: "Pittsburgh, PA" },
                { key: "influences" as const,  label: "Influences",         placeholder: "Kendrick, Travis Scott, The Weeknd..." },
              ] as const).map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="mb-1.5 block font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-600">
                    {label}
                  </label>
                  <input
                    type="text"
                    value={kit[key]}
                    onChange={(e) => update(key, e.target.value)}
                    className="vault-input"
                    placeholder={placeholder}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-6">
            <h2 className="mb-4 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
              Bio
            </h2>
            <textarea
              value={kit.bio}
              onChange={(e) => update("bio", e.target.value)}
              rows={8}
              className="vault-input resize-none leading-relaxed"
              placeholder="Write 2-3 paragraphs about your journey, sound, and vision. Be authentic — curators and blogs read hundreds of these."
            />
            <p className="mt-1.5 font-mono text-[9px] text-zinc-700">
              {kit.bio.length} chars — aim for 150–350 for a press bio
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-6">
            <h2 className="mb-4 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
              Press Quote
            </h2>
            <input
              type="text"
              value={kit.press_quote}
              onChange={(e) => update("press_quote", e.target.value)}
              className="vault-input"
              placeholder='"A rising force in the Pittsburgh underground..." — Blog Name'
            />
            <p className="mt-1.5 font-mono text-[9px] text-zinc-700">
              Have a quote from a blog, curator, or publication? Add it here.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-6">
            <h2 className="mb-4 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
              Social Links
            </h2>
            <div className="space-y-3">
              {SOCIAL_FIELDS.map(({ key, label, placeholder }) => (
                <div key={key} className="flex items-center gap-3">
                  <span className="w-24 shrink-0 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                    {label}
                  </span>
                  <input
                    type="url"
                    value={kit.social_links[key] ?? ""}
                    onChange={(e) => updateSocial(key, e.target.value)}
                    className="vault-input py-2.5"
                    placeholder={placeholder}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">Preview</h2>
              <span className="font-mono text-[9px] text-zinc-700">One-sheet format</span>
            </div>

            <div className="space-y-5 text-sm">
              {kit.artist_name ? (
                <div>
                  <p className="font-display text-2xl font-bold text-zinc-100">{kit.artist_name}</p>
                  {kit.tagline && (
                    <p className="mt-1 italic text-zinc-400">"{kit.tagline}"</p>
                  )}
                </div>
              ) : (
                <div className="rounded-lg bg-zinc-800/40 p-4 text-center text-xs text-zinc-700">
                  Start filling out the form to see your preview
                </div>
              )}

              {(kit.genre || kit.location) && (
                <div className="flex gap-4">
                  {kit.genre && (
                    <span className="rounded-full border border-accent/20 bg-accent/5 px-3 py-1 text-xs text-accent">
                      {kit.genre}
                    </span>
                  )}
                  {kit.location && (
                    <span className="rounded-full border border-zinc-700/50 bg-zinc-800/30 px-3 py-1 text-xs text-zinc-400">
                      📍 {kit.location}
                    </span>
                  )}
                </div>
              )}

              {kit.bio && (
                <div className="border-l-2 border-zinc-700/40 pl-4">
                  <p className="leading-relaxed text-zinc-400">{kit.bio}</p>
                </div>
              )}

              {kit.influences && (
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-wider text-zinc-600">Sounds like</p>
                  <p className="mt-1 text-zinc-400">{kit.influences}</p>
                </div>
              )}

              {kit.press_quote && (
                <div className="rounded-xl border border-accent/15 bg-accent/5 p-4">
                  <p className="italic leading-relaxed text-zinc-300">"{kit.press_quote}"</p>
                </div>
              )}

              {Object.entries(kit.social_links).some(([, v]) => v) && (
                <div>
                  <p className="mb-2 font-mono text-[9px] uppercase tracking-wider text-zinc-600">Links</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(kit.social_links)
                      .filter(([, v]) => v)
                      .map(([k, v]) => (
                        <a
                          key={k}
                          href={v}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg border border-zinc-700/50 bg-zinc-800/30 px-3 py-1 text-xs capitalize text-zinc-400 hover:text-accent"
                        >
                          {k}
                        </a>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
