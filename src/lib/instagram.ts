// Instagram Graph API integration
//
// Setup (one-time per account):
//  1. developers.facebook.com → Create App → "Other" type → Business
//  2. Add product: Instagram Graph API
//  3. Under Instagram → API Setup with business login → Generate Token for each IG account
//     (accounts must be Professional/Creator or Business to access followers_count)
//  4. Exchange short-lived token for long-lived (60 days):
//     GET https://graph.instagram.com/access_token
//       ?grant_type=ig_exchange_token
//       &client_id=YOUR_APP_ID
//       &client_secret=YOUR_APP_SECRET
//       &access_token=SHORT_LIVED_TOKEN
//  5. Add to .env.local (no VITE_ prefix = server-only, never sent to browser):
//       IG_TOKEN_OGSBYOUNG=YOUR_LONG_LIVED_TOKEN
//       IG_TOKEN_AKEEFSTUDIOS=YOUR_LONG_LIVED_TOKEN
//  6. Refresh tokens before 60 days:
//     GET https://graph.instagram.com/refresh_access_token
//       ?grant_type=ig_refresh_token&access_token=YOUR_TOKEN

import { createServerFn } from "@tanstack/react-start";

export interface IgProfile {
  id: string;
  username: string;
  name: string;
  biography: string;
  followers_count: number;
  follows_count: number;
  media_count: number;
  profile_picture_url: string;
  website?: string;
}

export interface IgMedia {
  id: string;
  media_url: string;
  thumbnail_url?: string;
  permalink: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  caption?: string;
  timestamp: string;
}

export interface IgFeed {
  profile: IgProfile;
  media: IgMedia[];
}

export function formatIgCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `${Math.round(n / 1_000)}K`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

async function fetchFeed(token: string): Promise<IgFeed> {
  const BASE = "https://graph.instagram.com/v22.0";
  const profileFields =
    "id,username,name,biography,followers_count,follows_count,media_count,profile_picture_url,website";
  const mediaFields =
    "id,caption,media_url,thumbnail_url,permalink,media_type,timestamp";

  const [profileRes, mediaRes] = await Promise.all([
    fetch(`${BASE}/me?fields=${profileFields}&access_token=${token}`),
    fetch(`${BASE}/me/media?fields=${mediaFields}&limit=6&access_token=${token}`),
  ]);

  if (!profileRes.ok) throw new Error(`IG profile ${profileRes.status}`);
  if (!mediaRes.ok) throw new Error(`IG media ${mediaRes.status}`);

  const profile: IgProfile = await profileRes.json();
  const { data: media }: { data: IgMedia[] } = await mediaRes.json();

  return { profile, media };
}

// Server function — runs on the server only, tokens never reach the browser
export const getIgFeeds = createServerFn().handler(async () => {
  const accounts = [
    { handle: "ogsbyoung", token: process.env.IG_TOKEN_OGSBYOUNG },
    { handle: "akeefstudios", token: process.env.IG_TOKEN_AKEEFSTUDIOS },
  ];

  const feeds: Record<string, IgFeed | null> = {};

  await Promise.allSettled(
    accounts.map(async ({ handle, token }) => {
      if (!token) {
        feeds[handle] = null;
        return;
      }
      try {
        feeds[handle] = await fetchFeed(token);
      } catch (err) {
        console.warn(`[instagram] fetch failed for @${handle}:`, err);
        feeds[handle] = null;
      }
    })
  );

  return feeds as Record<string, IgFeed | null>;
});
