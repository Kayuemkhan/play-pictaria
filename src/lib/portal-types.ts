import { z } from "zod";

export const PORTAL_STATUSES = [
  "New",
  "Photo Collected",
  "Ready to Build",
  "Pictaria Created",
  "Sent to Business",
  "Follow-up Needed",
  "Active Subscriber",
] as const;

export const PORTAL_CATEGORIES = [
  "Restaurant",
  "Hotel",
  "Tour",
  "Photographer",
  "Retail",
  "Attraction",
  "Album",
  "Other",
] as const;

export type PortalStatus = (typeof PORTAL_STATUSES)[number];
export type PortalCategory = (typeof PORTAL_CATEGORIES)[number];

/** Every field a visit can capture, all optional and all hand-editable. */
export const portalFieldsSchema = z.object({
  company_name: z.string().trim().max(160).default(""),
  contact_person: z.string().trim().max(160).default(""),
  phone: z.string().trim().max(60).default(""),
  email: z
    .string()
    .trim()
    .max(255)
    .refine((value) => value === "" || z.email().safeParse(value).success, {
      message: "Enter a valid email address",
    })
    .default(""),
  website: z.string().trim().max(255).default(""),
  category: z.enum(PORTAL_CATEGORIES).default("Other"),
  product_service: z.string().trim().max(2000).default(""),
  marketing_ideas: z.string().trim().max(4000).default(""),
  story_ideas: z.string().trim().max(4000).default(""),
  follow_up: z.string().trim().max(1000).default(""),
  notes: z.string().trim().max(6000).default(""),
  transcript: z.string().trim().max(20000).default(""),
  status: z.enum(PORTAL_STATUSES).default("New"),
});

export type PortalFields = z.infer<typeof portalFieldsSchema>;

export const portalSaveSchema = portalFieldsSchema.extend({
  id: z.string().uuid().optional(),
  /** Data URL for a freshly captured photograph. */
  photo: z.string().max(10_000_000).optional(),
});

export const portalUnlockSchema = z.object({
  passcode: z.string().min(1).max(200),
});

export const portalIdSchema = z.object({ id: z.string().uuid() });

/** A business photo about to become a Pictaria, with hand-edited wording. */
export const portalShareSchema = z.object({
  id: z.string().uuid(),
  title: z.string().trim().max(160).optional(),
  tagline: z.string().trim().max(300).optional(),
  story: z.string().trim().max(4000).optional(),
  grid: z.number().int().min(3).max(6).optional(),
});

export const portalAudioSchema = z.object({
  /** Base64 WAV payload of the spoken note (no data-URL prefix). */
  audio: z.string().min(64).max(30_000_000),
});

export type PortalRecord = PortalFields & {
  id: string;
  photo_url: string;
  share_code: string | null;
  created_at: string;
  updated_at: string;
};

export function emptyPortalFields(): PortalFields {
  return portalFieldsSchema.parse({});
}

export const PORTAL_FIELD_LABELS: Record<string, string> = {
  company_name: "Company name",
  contact_person: "Contact person",
  phone: "Phone number",
  email: "Email address",
  website: "Website",
  product_service: "Product or service featured",
  marketing_ideas: "Marketing ideas",
  story_ideas: "Story ideas for the Pictaria",
  follow_up: "Follow-up reminder",
  notes: "General notes",
};
