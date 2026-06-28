import { createClient } from "@supabase/supabase-js";

const rawUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = !!(rawUrl?.startsWith("https://") && rawKey && rawKey.length > 20);

const url = rawUrl?.startsWith("https://") ? rawUrl : "https://placeholder.supabase.co";
const key = rawKey && rawKey.length > 20 ? rawKey : "placeholder-anon-key-not-real";

export const supabase = createClient(url, key);

export type SubmissionStatus = "pending" | "reviewed" | "accepted" | "passed";

export interface Submission {
  id: string;
  user_id: string;
  artist_name: string;
  track_title: string;
  track_url: string;
  platform: string | null;
  genre: string;
  pitch: string;
  status: SubmissionStatus;
  curator_notes: string | null;
  created_at: string;
}

export interface LyricNote {
  id: string;
  user_id: string;
  title: string;
  content: string;
  updated_at: string;
  created_at: string;
}

export interface PressKit {
  id: string;
  user_id: string;
  artist_name: string;
  tagline: string;
  bio: string;
  genre: string;
  location: string;
  influences: string;
  press_quote: string;
  social_links: Record<string, string>;
  updated_at: string;
}

export interface ReleaseChecklist {
  id: string;
  user_id: string;
  release_name: string;
  release_date: string | null;
  items: ChecklistItem[];
  updated_at: string;
  created_at: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  done: boolean;
}
