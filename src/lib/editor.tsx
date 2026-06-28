import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createServerFn } from "@tanstack/react-start";
import { supabase } from "./supabase";
import { useAuth } from "./auth";

// ─── Types ─────────────────────────────────────────────────────

export type ContentMap = Record<string, string>;

type ChangeClass = "content" | "structural";

interface EditorCtx {
  isEditing: boolean;
  enableEdit: () => void;
  exitEdit: () => void;
  content: ContentMap;
  setContent: (map: ContentMap) => void;
  update: (key: string, value: string) => void;
  selectedKey: string | null;
  select: (key: string | null) => void;
  isDirty: boolean;
  isSaving: boolean;
  saveAll: () => Promise<void>;
  deployStatus: "idle" | "deploying" | "done" | "cooldown" | "error";
  triggerPageDeploy: () => Promise<void>;
  lastSaved: Date | null;
  canDeploy: boolean;
}

const Ctx = createContext<EditorCtx | null>(null);

export function useEditor() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useEditor must be inside EditorProvider");
  return ctx;
}

// ─── Deploy classification ──────────────────────────────────────
// Keys starting with these prefixes are pure content — Supabase handles them.
// Anything else is "structural" and requires a real code deploy.

const CONTENT_PREFIXES = [
  "hero.", "curators.", "how.", "packages.", "footer.", "nav.",
];

function classifyKey(key: string): ChangeClass {
  return CONTENT_PREFIXES.some((p) => key.startsWith(p))
    ? "content"
    : "structural";
}

function anyStructural(keys: string[]): boolean {
  return keys.some((k) => classifyKey(k) === "structural");
}

// ─── Deploy server function ─────────────────────────────────────

export const serverDeploy = createServerFn().handler(async () => {
  const hookUrl = process.env.DEPLOY_HOOK_URL;
  if (!hookUrl) {
    return { ok: false, reason: "DEPLOY_HOOK_URL not set in environment" };
  }
  try {
    const res = await fetch(hookUrl, { method: "POST" });
    return { ok: res.ok, reason: res.ok ? "triggered" : `hook returned ${res.status}` };
  } catch (e) {
    return { ok: false, reason: String(e) };
  }
});

// ─── EditorProvider ────────────────────────────────────────────

const DEPLOY_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

export function EditorProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const isAdmin = !!user;

  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState<ContentMap>({});
  const [dirty, setDirty] = useState<Set<string>>(new Set());
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [deployStatus, setDeployStatus] = useState<
    "idle" | "deploying" | "done" | "cooldown" | "error"
  >("idle");
  const lastDeployRef = useRef<number>(0);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load content from Supabase on mount
  useEffect(() => {
    supabase
      .from("site_content")
      .select("key, value")
      .then(({ data }) => {
        if (!data) return;
        const map: ContentMap = {};
        for (const row of data) map[row.key] = row.value;
        setContent((prev) => ({ ...prev, ...map }));
      });
  }, []);

  const enableEdit = useCallback(() => {
    if (!isAdmin) return;
    setIsEditing(true);
  }, [isAdmin]);

  const exitEdit = useCallback(() => {
    setIsEditing(false);
    setSelectedKey(null);
    setDirty(new Set());
  }, []);

  const update = useCallback((key: string, value: string) => {
    setContent((c) => ({ ...c, [key]: value }));
    setDirty((d) => new Set([...d, key]));

    // Debounced auto-save (content keys only)
    if (classifyKey(key) === "content") {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = setTimeout(async () => {
        try {
          await supabase
            .from("site_content")
            .upsert({ key, value }, { onConflict: "key" });
        } catch {
          // silent — user can always hit Save All
        }
      }, 1500);
    }
  }, []);

  const saveAll = useCallback(async () => {
    if (dirty.size === 0) return;
    setIsSaving(true);
    try {
      const rows = [...dirty].map((key) => ({ key, value: content[key] ?? "" }));
      await supabase.from("site_content").upsert(rows, { onConflict: "key" });
      setDirty(new Set());
      setLastSaved(new Date());

      // After saving, check if any structural keys changed — prompt deploy
      if (anyStructural([...dirty])) {
        setDeployStatus("idle"); // show deploy button as active
      }
    } catch (e) {
      console.error("Save failed:", e);
    } finally {
      setIsSaving(false);
    }
  }, [dirty, content]);

  const triggerPageDeploy = useCallback(async () => {
    const now = Date.now();
    if (now - lastDeployRef.current < DEPLOY_COOLDOWN_MS) {
      setDeployStatus("cooldown");
      setTimeout(() => setDeployStatus("idle"), 3000);
      return;
    }
    setDeployStatus("deploying");
    lastDeployRef.current = now;
    const result = await serverDeploy();
    if (result.ok) {
      setDeployStatus("done");
      setTimeout(() => setDeployStatus("idle"), 4000);
    } else {
      console.error("Deploy failed:", result.reason);
      setDeployStatus("error");
      setTimeout(() => setDeployStatus("idle"), 4000);
    }
  }, []);

  const canDeploy =
    deployStatus === "idle" &&
    Date.now() - lastDeployRef.current >= DEPLOY_COOLDOWN_MS;

  return (
    <Ctx.Provider
      value={{
        isEditing,
        enableEdit,
        exitEdit,
        content,
        setContent,
        update,
        selectedKey,
        select: setSelectedKey,
        isDirty: dirty.size > 0,
        isSaving,
        saveAll,
        deployStatus,
        triggerPageDeploy,
        lastSaved,
        canDeploy,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

// ─── <E> — inline-editable text wrapper ────────────────────────
// Usage:  <E id="hero.headline" as="h1" className="...">Default text</E>
// In view mode: renders exactly as the wrapped tag with no overhead.
// In edit mode: adds a subtle ring, makes content editable, saves on blur.

type AllowedTag = "h1" | "h2" | "h3" | "h4" | "p" | "span" | "li" | "div" | "strong";

interface EProps {
  id: string;
  as?: AllowedTag;
  className?: string;
  style?: React.CSSProperties;
  children: string;
  multiline?: boolean;
}

export function E({ id, as: Tag = "span", className = "", style, children, multiline = false }: EProps) {
  const { isEditing, content, update, selectedKey, select } = useEditor();
  const live = content[id] ?? children;
  const isSelected = selectedKey === id;

  if (!isEditing) {
    // Zero-overhead passthrough in view mode
    const props = { className, style };
    switch (Tag) {
      case "h1": return <h1 {...props}>{live}</h1>;
      case "h2": return <h2 {...props}>{live}</h2>;
      case "h3": return <h3 {...props}>{live}</h3>;
      case "h4": return <h4 {...props}>{live}</h4>;
      case "p": return <p {...props}>{live}</p>;
      case "li": return <li {...props}>{live}</li>;
      case "div": return <div {...props}>{live}</div>;
      case "strong": return <strong {...props}>{live}</strong>;
      default: return <span {...props}>{live}</span>;
    }
  }

  const editProps = {
    contentEditable: true as const,
    suppressContentEditableWarning: true,
    className: [
      className,
      "outline-none cursor-text transition-all duration-150",
      isSelected
        ? "ring-2 ring-accent/70 ring-offset-2 ring-offset-zinc-950 rounded-sm bg-accent/5"
        : "ring-1 ring-accent/20 ring-offset-1 ring-offset-zinc-950 rounded-sm hover:ring-accent/40",
    ].join(" "),
    style,
    "data-editor-id": id,
    onFocus: () => select(id),
    onClick: (e: React.MouseEvent) => { e.stopPropagation(); select(id); },
    onBlur: (e: React.FocusEvent<HTMLElement>) => {
      const text = multiline ? e.currentTarget.innerHTML : (e.currentTarget.textContent ?? "");
      update(id, text);
    },
    onKeyDown: (e: React.KeyboardEvent) => {
      if (!multiline && e.key === "Enter") { e.preventDefault(); (e.currentTarget as HTMLElement).blur(); }
      if (e.key === "Escape") { (e.currentTarget as HTMLElement).blur(); select(null); }
    },
    dangerouslySetInnerHTML: { __html: live },
  };

  switch (Tag) {
    case "h1": return <h1 {...editProps} />;
    case "h2": return <h2 {...editProps} />;
    case "h3": return <h3 {...editProps} />;
    case "h4": return <h4 {...editProps} />;
    case "p": return <p {...editProps} />;
    case "li": return <li {...editProps} />;
    case "div": return <div {...editProps} />;
    case "strong": return <strong {...editProps} />;
    default: return <span {...editProps} />;
  }
}
