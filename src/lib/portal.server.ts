import { useSession } from "@tanstack/react-start/server";
import { createHash, timingSafeEqual } from "node:crypto";
import { NoObjectGeneratedError, generateText, Output } from "ai";
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
  if (!timingSafeEqual(digest(passcode.trim()), digest(expected.trim()))) {
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

// The portal is reached only through the hidden palm-tree tap on the home
// screen; the passcode wall was removed at the owner's request.
export async function isPortalUnlocked() {
  return true;
}

export async function requirePortal() {
  // no-op: portal access is open (hidden entry point only)
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
  share_code?: string | null;
  created_at: string;
  updated_at: string;
};

export async function toRecord(row: Row): Promise<PortalRecord> {
  const { photo_path, share_code, ...rest } = row;
  return {
    ...rest,
    share_code: share_code ?? null,
    photo_url: await signPortalPhoto(photo_path),
  };
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

type Organised = z.infer<typeof structured>;

const EMPTY: Organised = {
  company_name: "",
  contact_person: "",
  phone: "",
  email: "",
  website: "",
  category: "Other" as Organised["category"],
  product_service: "",
  marketing_ideas: "",
  story_ideas: "",
  follow_up: "",
  notes: "",
};

/** Pulls the first JSON object out of a model reply and fills any gaps. */
function coerceOrganised(text: string | undefined, transcript: string): Organised {
  const raw = (text ?? "").replace(/```json|```/gi, "");
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  let parsed: Record<string, unknown> = {};
  if (start !== -1 && end > start) {
    try {
      parsed = JSON.parse(raw.slice(start, end + 1)) as Record<string, unknown>;
    } catch {
      parsed = {};
    }
  }

  const pick = (field: keyof Organised) => {
    const value = parsed[field];
    return typeof value === "string" ? value.trim() : "";
  };

  const category = pick("category");
  const result: Organised = {
    ...EMPTY,
    company_name: pick("company_name"),
    contact_person: pick("contact_person"),
    phone: pick("phone"),
    email: pick("email"),
    website: pick("website"),
    category: (PORTAL_CATEGORIES as readonly string[]).includes(category)
      ? (category as Organised["category"])
      : "Other",
    product_service: pick("product_service"),
    marketing_ideas: pick("marketing_ideas"),
    story_ideas: pick("story_ideas"),
    follow_up: pick("follow_up"),
    notes: pick("notes"),
  };

  // Never lose the spoken words: if nothing landed, keep the transcript.
  const anyFilled = Object.entries(result).some(
    ([field, value]) => field !== "category" && value !== "",
  );
  if (!anyFilled) result.notes = transcript;
  return result;
}

/** Turns a raw transcript into organised business fields. */
export async function organiseNote(transcript: string): Promise<Organised> {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("AI organising is unavailable right now.");

  const gateway = createLovableAiGatewayProvider(key);
  try {
    const { output, text } = await generateText({
      model: gateway("google/gemini-3.6-flash"),
      output: Output.object({ schema: structured }),
      system: ORGANISER,
      prompt: `Spoken note:\n\n${transcript}`,
    });
    if (output) return coerceOrganised(JSON.stringify(output), transcript);
    return coerceOrganised(text, transcript);
  } catch (error) {
    // A model reply that doesn't match the schema shouldn't lose the note.
    if (NoObjectGeneratedError.isInstance(error)) {
      return coerceOrganised(error.text, transcript);
    }
    const message = error instanceof Error ? error.message : "";
    console.error(`organiseNote failed: ${message}`);
    if (/429|rate limit/i.test(message)) {
      throw new Error("Too many notes at once — try again in a moment.");
    }
    if (/402|credit/i.test(message)) {
      throw new Error("AI credits are exhausted — add credits to keep using voice notes.");
    }
    // Fall back to keeping the transcript so nothing is lost.
    return { ...EMPTY, notes: transcript };
  }
}

// The sandbox/worker clock can drift slightly ahead of the auth server, which
// makes PostgREST reject the freshly minted service-role token with
// "JWT issued at future". It resolves itself in under a second, so retry.
export async function withClockSkewRetry<T>(
  run: () => Promise<{ data: T; error: { message: string } | null }>,
  attempts = 4,
): Promise<{ data: T; error: { message: string } | null }> {
  let result = await run();
  for (let i = 1; i < attempts; i += 1) {
    if (!result.error || !/issued at future|jwt/i.test(result.error.message)) break;
    await new Promise((resolve) => setTimeout(resolve, 350 * i));
    result = await run();
  }
  return result;
}
