import { useSession } from "@tanstack/react-start/server";
import { createHash, timingSafeEqual } from "node:crypto";
import { generateText, Output } from "ai";
import { z } from "zod";

import { createLovableAiGatewayProvider } from "./ai-gateway.server";
import {
  PORTAL_CATEGORIES,
  type PortalFields,
  type PortalRecord,
} from "./portal-types";

type PortalSession = { unlocked?: boolean };

function sessionConfig() {
  const password = process.env["PORTAL_SESSION_SECRET"];
  if (!password) throw new Error("PORTAL_SESSION_SECRET is not set");
  return {
    password,
    name: "pictaria-portal",
    maxAge: 60 * 60 * 24 * 30,
    cookie: {
      httpOnly: true,
      secure: true,
      sameSite: "lax" as const,
      path: "/",
    },
  };
}

function digest(value: string) {
  return createHash("sha256").update(value, "utf8").digest();
}

export async function unlockPortalSession(passcode: string) {
  const expected = process.env["PORTAL_PASSCODE"];
  if (!expected) throw new Error("PORTAL_PASSCODE is not set");
  if (!timingSafeEqual(digest(passcode.trim()), digest(expected))) {
    return false;
  }
  const session = await useSession<PortalSession>(sessionConfig());
  await session.update({ unlocked: true });
  return true;
}

export async function lockPortalSession() {
  const session = await useSession<PortalSession>(sessionConfig());
  await session.clear();
}

export async function isPortalUnlocked() {
  const session = await useSession<PortalSession>(sessionConfig());
  return session.data.unlocked === true;
}

/** Throws when the visitor has not entered the portal passcode. */
export async function requirePortal() {
  if (!(await isPortalUnlocked())) throw new Error("PORTAL_LOCKED");
}

// ---------------------------------------------------------------- storage

function decodeDataUrl(dataUrl: string) {
  const match = /^data:(image\/(?:jpeg|jpg|png|webp));base64,(.+)$/i.exec(dataUrl);
  if (!match) throw new Error("Only JPEG, PNG or WebP photographs are supported.");
  const contentType = match[1]!;
  const bytes = Uint8Array.from(atob(match[2]!), (c) => c.charCodeAt(0));
  const ext =
    contentType === "image/png" ? "png" : contentType === "image/webp" ? "webp" : "jpg";
  return { contentType, bytes, ext };
}

export async function storePortalPhoto(dataUrl: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { contentType, bytes, ext } = decodeDataUrl(dataUrl);
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabaseAdmin.storage
    .from("portal")
    .upload(path, bytes, { contentType, upsert: true });
  if (error) throw new Error(error.message);
  return path;
}

export async function signPortalPhoto(path: string) {
  if (!path) return "";
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin.storage
    .from("portal")
    .createSignedUrl(path, 60 * 60 * 12);
  return data?.signedUrl ?? "";
}

type Row = PortalFields & {
  id: string;
  photo_path: string;
  created_at: string;
  updated_at: string;
};

export async function toRecord(row: Row): Promise<PortalRecord> {
  const { photo_path, ...rest } = row;
  return { ...rest, photo_url: await signPortalPhoto(photo_path) };
}

// ---------------------------------------------------------------- voice note

/** Sends the spoken note to speech-to-text and returns the transcript. */
export async function transcribeNote(base64Wav: string) {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("Voice notes are unavailable right now.");

  const bytes = Uint8Array.from(atob(base64Wav), (c) => c.charCodeAt(0));
  const form = new FormData();
  form.append("model", "openai/gpt-4o-transcribe");
  form.append("file", new Blob([bytes], { type: "audio/wav" }), "note.wav");

  const response = await fetch(
    "https://ai.gateway.lovable.dev/v1/audio/transcriptions",
    { method: "POST", headers: { Authorization: `Bearer ${key}` }, body: form },
  );

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    console.error(`Transcription failed [${response.status}]: ${body}`);
    if (response.status === 429) throw new Error("Too many notes at once — try again in a moment.");
    if (response.status === 402) throw new Error("AI credits are exhausted — add credits to keep using voice notes.");
    throw new Error("That recording couldn't be transcribed. Please record it again.");
  }

  const json = (await response.json()) as { text?: string };
  return (json.text ?? "").trim();
}

const structured = z.object({
  company_name: z.string(),
  contact_person: z.string(),
  phone: z.string(),
  email: z.string(),
  website: z.string(),
  category: z.enum(PORTAL_CATEGORIES),
  product_service: z.string(),
  marketing_ideas: z.string(),
  story_ideas: z.string(),
  follow_up: z.string(),
  notes: z.string(),
});

const ORGANISER = `You organise a spoken field note from a Pictaria representative who just
visited a local Hawaii business. Sort what was said into the given fields.

Rules:
- Use only what the speaker actually said. Never invent details.
- Leave a field as an empty string when the note does not cover it.
- Tidy spoken phone numbers, emails and websites into normal written form
  (e.g. "eight zero eight five five five one two one two" -> "808-555-1212",
  "amy at kai gallery dot com" -> "amy@kaigallery.com").
- Choose the closest business category; use "Other" when unclear.
- marketing_ideas, story_ideas and notes may be a few short sentences or
  dash-prefixed lines. Keep the speaker's own voice.
- follow_up should be a short reminder, including any timing that was mentioned.
- Put anything that fits nowhere else into notes.`;

/** Turns a raw transcript into organised business fields. */
export async function organiseNote(transcript: string) {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("AI organising is unavailable right now.");

  const gateway = createLovableAiGatewayProvider(key);
  const { output } = await generateText({
    model: gateway("google/gemini-3.6-flash"),
    output: Output.object({ schema: structured }),
    system: ORGANISER,
    prompt: `Spoken note:\n\n${transcript}`,
  });
  return output;
}
