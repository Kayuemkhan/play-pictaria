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

// The Pictaria Project portal is hidden (only reachable via the palm-tree tap),
// not passcode-gated: the lock screen was removed at the founder's request.
export async function isPortalUnlocked() {
  return true;
}

export async function requirePortal() {
  return;
}



// ---------------------------------------------------------------- storage

export function decodeDataUrl(dataUrl: string) {
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
- company_name is the most important field. Capture the business/company/shop/
  album/restaurant name exactly as spoken, whether it is introduced
  ("the company is...", "business name is...", "this is...", "I'm at...",
  "we're with...") or simply said as a name near the start of the note.
  Keep any suffix such as LLC, Inc, Album, Studio, Farms, Co.
- Never put the business name into contact_person; contact_person is a person's
  name only. If only one name is mentioned and it sounds like a business, it is
  the company_name.
- Leave a field as an empty string when the note does not cover it.
- phone is second in importance after company_name. Capture ANY spoken number
  that could be a phone number, however it is said: as digits, as words, in
  pairs or triples ("eight oh eight, five five five, twelve twelve"), with or
  without an area code, and whether or not the speaker says the word "phone".
  Always write it as 808-555-1212 (or 555-1212 when no area code was given).
- Tidy spoken phone numbers, emails and websites into normal written form
  (e.g. "eight zero eight five five five one two one two" -> "808-555-1212",
  "amy at kai album dot com" -> "amy@kaialbum.com").
- Choose the closest business category; use "Other" when unclear.
- product_service is required whenever the speaker describes the business at
  all. Write two or three warm sentences describing what this business offers
  and what should be photographed for their Pictaria — their products, food,
  art, rooms, tours, view, or atmosphere as described in the note. Never leave
  it empty if the note says anything about what the business does.
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

  // Safety net: pull the company name straight out of the spoken words when
  // the model left it blank.
  if (!result.company_name) {
    result.company_name = guessCompanyName(transcript);
  }

  // Same safety net for the phone number.
  if (!result.phone) {
    result.phone = guessPhone(transcript);
  }

  // The description box is the one the note always has something for: fall back
  // to whatever else the model wrote, then to the spoken words themselves.
  if (!result.product_service) {
    result.product_service =
      [result.story_ideas, result.marketing_ideas, result.notes]
        .map((value) => value.trim())
        .find(Boolean) ?? describeFromTranscript(transcript);
  }


  // Never lose the spoken words: if nothing landed, keep the transcript.
  const anyFilled = Object.entries(result).some(
    ([field, value]) => field !== "category" && value !== "",
  );
  if (!anyFilled) result.notes = transcript;
  return result;
}

/**
 * Keeps the description box from ever landing empty: uses the spoken words,
 * minus the sentences that were only contact details.
 */
function describeFromTranscript(transcript: string) {
  const text = (transcript ?? "").replace(/\s+/g, " ").trim();
  if (!text) return "";
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .filter((sentence) => !/\d{3}[\s.-]?\d{4}|@|https?:|\bdot com\b/i.test(sentence));
  return (sentences.join(" ").trim() || text).slice(0, 2000);
}

/** Last-resort company name lift from the raw transcript. */
function guessCompanyName(transcript: string) {
  const text = (transcript ?? "").replace(/\s+/g, " ").trim();
  if (!text) return "";
  const patterns = [
    /(?:company|business|shop|store|restaurant|album|studio)(?:\s+name)?(?:\s+is|\s+is called|\s*[:,])\s+([^.,;!?]{2,80})/i,
    /(?:the name of (?:the|this) (?:company|business)\s+is)\s+([^.,;!?]{2,80})/i,
    /(?:i(?:'m| am) (?:at|with|visiting)|we(?:'re| are) (?:at|with))\s+([^.,;!?]{2,80})/i,
  ];
  for (const pattern of patterns) {
    const match = pattern.exec(text);
    const found = match?.[1]?.trim();
    if (found) return found.replace(/^(?:called|named)\s+/i, "").slice(0, 160);
  }
  return "";
}

const DIGIT_WORDS: Record<string, string> = {
  zero: "0", oh: "0", o: "0", one: "1", two: "2", to: "2", too: "2",
  three: "3", four: "4", for: "4", five: "5", six: "6", seven: "7",
  eight: "8", nine: "9",
};

/** Last-resort phone lift: handles digits and spoken number words. */
function guessPhone(transcript: string) {
  const text = (transcript ?? "").toLowerCase();
  if (!text) return "";

  // Convert spoken digit words to digits, then collapse to a digit stream.
  const normalised = text
    .split(/[^a-z0-9]+/)
    .map((token) => DIGIT_WORDS[token] ?? token)
    .join(" ");

  const candidates: string[] = [];
  const written = /(\+?1[\s.-]*)?(\(?\d{3}\)?[\s.-]*)?\d{3}[\s.-]*\d{4}\b/g;
  for (const match of normalised.matchAll(written)) {
    candidates.push(match[0].replace(/\D/g, ""));
  }

  for (const raw of candidates) {
    const digits = raw.replace(/^1(?=\d{10}$)/, "");
    if (digits.length === 10) {
      return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    if (digits.length === 7) {
      return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    }
  }
  return "";
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
      return coerceOrganised((error as { text?: string }).text, transcript);
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
