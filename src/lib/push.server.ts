/**
 * Server-side plumbing for Pictaria push notifications.
 *
 * A "medley" is the every-30-days notification: AI stitches together a short
 * line that names a few of the albums that have new peaces waiting, e.g.
 * "New Pictarias from Oceanic Aquarium and Healing Plants of Hawaiʻi".
 */
import {
  buildPushPayload,
  type PushSubscription,
} from "@block65/webcrypto-web-push";

import { collections } from "@/data/collections";

export const MEDLEY_INTERVAL_DAYS = 30;
/** Never send to more than this many devices in a single run. */
export const SEND_BATCH_LIMIT = 400;

export function pushPublicKey() {
  const key = process.env["VAPID_PUBLIC_KEY"];
  if (!key) throw new Error("Notifications are not configured yet.");
  return key;
}

function vapid() {
  const publicKey = process.env["VAPID_PUBLIC_KEY"];
  const privateKey = process.env["VAPID_PRIVATE_KEY"];
  const subject = process.env["VAPID_SUBJECT"] ?? "mailto:hello@play-pictaria.com";
  if (!publicKey || !privateKey) {
    throw new Error("Notifications are not configured yet.");
  }
  return { publicKey, privateKey, subject };
}

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

// ------------------------------------------------------------------ job state

export interface PushJobState {
  paused: boolean;
  paused_reason: string | null;
  last_run_at: string | null;
  last_medley_at: string | null;
  lease_until: string | null;
}

export async function readJobState(): Promise<PushJobState> {
  const db = await admin();
  const { data } = await db
    .from("push_job_state")
    .select("paused, paused_reason, last_run_at, last_medley_at, lease_until")
    .eq("id", "medley")
    .maybeSingle();
  return (
    (data as PushJobState | null) ?? {
      paused: false,
      paused_reason: null,
      last_run_at: null,
      last_medley_at: null,
      lease_until: null,
    }
  );
}

export async function setPaused(paused: boolean, reason: string | null) {
  const db = await admin();
  await db
    .from("push_job_state")
    .update({ paused, paused_reason: reason, updated_at: new Date().toISOString() })
    .eq("id", "medley");
}

/** Single-flight lease so two scheduled runs never overlap. */
export async function acquireLease(minutes = 10) {
  const db = await admin();
  const now = new Date();
  const until = new Date(now.getTime() + minutes * 60_000).toISOString();
  const { data } = await db
    .from("push_job_state")
    .update({ lease_until: until, last_run_at: now.toISOString(), updated_at: now.toISOString() })
    .eq("id", "medley")
    .or(`lease_until.is.null,lease_until.lt.${now.toISOString()}`)
    .select("id");
  return (data?.length ?? 0) > 0;
}

export async function releaseLease() {
  const db = await admin();
  await db
    .from("push_job_state")
    .update({ lease_until: null, updated_at: new Date().toISOString() })
    .eq("id", "medley");
}

export function medleyIsDue(state: PushJobState) {
  if (!state.last_medley_at) return true;
  const elapsed = Date.now() - new Date(state.last_medley_at).getTime();
  return elapsed >= MEDLEY_INTERVAL_DAYS * 24 * 60 * 60 * 1000;
}

// ------------------------------------------------------------------ the medley

function albumPool() {
  return collections
    .filter((collection) => !collection.hidden)
    .map((collection) => ({ id: collection.id, title: collection.title, tagline: collection.tagline }));
}

/** Rotates through the albums so each medley features different ones. */
export function pickAlbums(count = 3, seed = Date.now()) {
  const pool = albumPool();
  if (pool.length === 0) return [];
  const start = Math.floor(seed / (24 * 60 * 60 * 1000)) % pool.length;
  const picked: typeof pool = [];
  for (let i = 0; i < Math.min(count, pool.length); i += 1) {
    picked.push(pool[(start + i * 3) % pool.length]!);
  }
  return picked;
}

function fallbackText(albums: { title: string }[]) {
  const names = albums.map((album) => album.title);
  const list =
    names.length <= 1
      ? (names[0] ?? "Pictaria")
      : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
  return {
    title: `A new Pictaria from ${names[0] ?? "Pictaria"} has arrived`,
    body: `Fresh peaces waiting in ${list}. Tap for a little peace of paradise.`,
  };
}

/** Asks Lovable AI for the medley wording; falls back to a written line. */
async function writeMedley(albums: { title: string; tagline: string }[]) {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) return { ...fallbackText(albums), degraded: null as string | null };

  const prompt = `Write a phone push notification for Pictaria, a calm Hawaiian
photo-puzzle app. It announces that new puzzles ("Pictarias") have arrived in
these albums:
${albums.map((album) => `- ${album.title} — ${album.tagline}`).join("\n")}

Return JSON only: {"title": string, "body": string}
- title: under 55 characters, must name at least one album, in the shape
  "A new Pictaria from <Album> has arrived" (you may vary it gently).
- body: under 110 characters, mentions the other album names, warm, calm,
  never salesy, no emoji, no exclamation marks.`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    console.error(`Medley wording failed [${response.status}]: ${detail}`);
    if (response.status === 402) {
      return { ...fallbackText(albums), degraded: "AI credits are exhausted." };
    }
    if (response.status === 403) {
      return { ...fallbackText(albums), degraded: "Lovable AI is blocked for this workspace." };
    }
    return { ...fallbackText(albums), degraded: null };
  }

  const json = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const raw = json.choices?.[0]?.message?.content ?? "";
  try {
    const parsed = JSON.parse(raw) as { title?: string; body?: string };
    const fallback = fallbackText(albums);
    return {
      title: (parsed.title ?? "").trim() || fallback.title,
      body: (parsed.body ?? "").trim() || fallback.body,
      degraded: null as string | null,
    };
  } catch {
    return { ...fallbackText(albums), degraded: null };
  }
}

export interface MedleyRow {
  id: string;
  title: string;
  body: string;
  albums: string[];
  url: string;
  sent_at: string | null;
  sent_count: number;
  failed_count: number;
  created_at: string;
}

/**
 * Builds the next medley and stores it (not yet sent). Returns the stored row
 * plus a reason string when the AI wording had to be skipped.
 */
export async function createMedley() {
  const albums = pickAlbums(3);
  const { title, body, degraded } = await writeMedley(albums);
  const db = await admin();
  const { data, error } = await db
    .from("push_medleys")
    .insert({
      title,
      body,
      albums: albums.map((album) => album.title),
      url: albums[0] ? `/collection/${albums[0].id}` : "/",
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return { medley: data as MedleyRow, degraded };
}

// ------------------------------------------------------------------ delivery

/**
 * Sends one medley to every active device, at most SEND_BATCH_LIMIT per run.
 * Devices that the push service has retired (404/410) are deactivated so we
 * never keep trying them.
 */
export async function dispatchMedley(medleyId: string) {
  const db = await admin();

  const { data: medleyRow, error: medleyError } = await db
    .from("push_medleys")
    .select("*")
    .eq("id", medleyId)
    .single();
  if (medleyError) throw new Error(medleyError.message);
  const medley = medleyRow as MedleyRow;

  const { data: subs, error: subsError } = await db
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("active", true)
    .order("created_at", { ascending: true })
    .limit(SEND_BATCH_LIMIT);
  if (subsError) throw new Error(subsError.message);

  const keys = vapid();
  const payloadData = JSON.stringify({
    title: medley.title,
    body: medley.body,
    url: medley.url,
    tag: `pictaria-medley-${medley.id}`,
  });

  let sent = 0;
  let failed = 0;
  const retired: string[] = [];

  for (const sub of subs ?? []) {
    const subscription: PushSubscription = {
      endpoint: sub.endpoint as string,
      expirationTime: null,
      keys: { p256dh: sub.p256dh as string, auth: sub.auth as string },
    };
    try {
      const payload = await buildPushPayload(
        { data: payloadData, options: { ttl: 60 * 60 * 24 * 3, urgency: "normal" } },
        subscription,
        keys,
      );
      const response = await fetch(subscription.endpoint, payload as RequestInit);
      if (response.status === 404 || response.status === 410) {
        retired.push(sub.id as string);
        failed += 1;
      } else if (!response.ok) {
        failed += 1;
        console.error(`Push failed [${response.status}] for ${subscription.endpoint.slice(0, 48)}…`);
      } else {
        sent += 1;
      }
    } catch (error) {
      failed += 1;
      console.error("Push send threw", error);
    }
  }

  if (retired.length > 0) {
    await db.from("push_subscriptions").update({ active: false }).in("id", retired);
  }
  if (sent > 0) {
    const ids = (subs ?? []).map((sub) => sub.id as string).filter((id) => !retired.includes(id));
    await db
      .from("push_subscriptions")
      .update({ last_sent_at: new Date().toISOString() })
      .in("id", ids);
  }

  await db
    .from("push_medleys")
    .update({ sent_at: new Date().toISOString(), sent_count: sent, failed_count: failed })
    .eq("id", medley.id);

  await db
    .from("push_job_state")
    .update({ last_medley_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("id", "medley");

  return { sent, failed, medley: { ...medley, sent_count: sent, failed_count: failed } };
}
