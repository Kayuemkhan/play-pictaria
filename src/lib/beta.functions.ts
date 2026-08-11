import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export interface BetaCodeRow {
  id: string;
  code: string;
  tier: string;
  max_uses: number;
  expires_at: string | null;
  disabled: boolean;
  note: string;
  created_at: string;
  uses: number;
}

export interface BetaRedemptionRow {
  email: string;
  code: string;
  tier: string;
  created_at: string;
}

const createSchema = z.object({
  code: z
    .string()
    .trim()
    .min(4)
    .max(40)
    .regex(/^[A-Za-z0-9-]+$/, "Letters, numbers and dashes only"),
  max_uses: z.number().int().min(1).max(10000),
  expires_at: z.string().trim().max(40).optional(),
  note: z.string().trim().max(200).optional(),
  tier: z.enum(["artist", "brand"]).optional(),
});

const idSchema = z.object({ id: z.string().uuid() });
const toggleSchema = z.object({ id: z.string().uuid(), disabled: z.boolean() });

const redeemSchema = z.object({
  email: z.string().trim().email().max(255),
  code: z.string().trim().min(1).max(40),
});

/** Founder view: every beta code with how many people have used it. */
export const listBetaCodes = createServerFn({ method: "GET" }).handler(
  async () => {
    const { requirePortal } = await import("./portal.server");
    await requirePortal();
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );

    const [codes, redemptions] = await Promise.all([
      supabaseAdmin
        .from("beta_codes")
        .select("*")
        .order("created_at", { ascending: false }),
      supabaseAdmin
        .from("beta_redemptions")
        .select("email, code, tier, created_at")
        .order("created_at", { ascending: false })
        .limit(2000),
    ]);

    if (codes.error) throw new Error(codes.error.message);
    if (redemptions.error) throw new Error(redemptions.error.message);

    const rows = (redemptions.data ?? []) as BetaRedemptionRow[];
    const counted: BetaCodeRow[] = (codes.data ?? []).map((code) => ({
      ...(code as Omit<BetaCodeRow, "uses">),
      uses: rows.filter(
        (row) => row.code.toUpperCase() === String(code.code).toUpperCase(),
      ).length,
    }));

    return { codes: counted, redemptions: rows };
  },
);

/** Founder action: mint a new Artist beta code. */
export const createBetaCode = createServerFn({ method: "POST" })
  .inputValidator((input) => createSchema.parse(input))
  .handler(async ({ data }) => {
    const { requirePortal } = await import("./portal.server");
    await requirePortal();
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );

    const { error } = await supabaseAdmin.from("beta_codes").insert({
      code: data.code.toUpperCase(),
      tier: data.tier ?? "artist",
      max_uses: data.max_uses,
      expires_at: data.expires_at ? data.expires_at : null,
      note: data.note ?? "",
    });

    if (error) {
      if (error.code === "23505") throw new Error("That code already exists.");
      throw new Error(error.message);
    }
    return { success: true };
  });

/** Founder action: switch a code on or off without deleting it. */
export const setBetaCodeDisabled = createServerFn({ method: "POST" })
  .inputValidator((input) => toggleSchema.parse(input))
  .handler(async ({ data }) => {
    const { requirePortal } = await import("./portal.server");
    await requirePortal();
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const { error } = await supabaseAdmin
      .from("beta_codes")
      .update({ disabled: data.disabled })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { success: true };
  });

/** Founder action: remove a code entirely. */
export const deleteBetaCode = createServerFn({ method: "POST" })
  .inputValidator((input) => idSchema.parse(input))
  .handler(async ({ data }) => {
    const { requirePortal } = await import("./portal.server");
    await requirePortal();
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const { error } = await supabaseAdmin
      .from("beta_codes")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { success: true };
  });

/** A friend redeems a beta code with their email address. */
export const redeemBetaCode = createServerFn({ method: "POST" })
  .inputValidator((input) => redeemSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );

    const code = data.code.trim().toUpperCase();
    const email = data.email.toLowerCase();

    const { data: found, error } = await supabaseAdmin
      .from("beta_codes")
      .select("*")
      .eq("code", code)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!found) return { ok: false as const, reason: "That code isn't valid." };
    if (found.disabled)
      return { ok: false as const, reason: "That code is no longer active." };
    if (found.expires_at && new Date(found.expires_at) < new Date())
      return { ok: false as const, reason: "That code has expired." };

    const { data: used, error: usedError } = await supabaseAdmin
      .from("beta_redemptions")
      .select("email")
      .eq("code", code);
    if (usedError) throw new Error(usedError.message);

    const already = (used ?? []).some((row) => row.email === email);
    if (!already && (used?.length ?? 0) >= found.max_uses) {
      return { ok: false as const, reason: "That code has been fully claimed." };
    }

    if (!already) {
      const { error: insertError } = await supabaseAdmin
        .from("beta_redemptions")
        .insert({ email, code, tier: found.tier });
      if (insertError && insertError.code !== "23505") {
        throw new Error(insertError.message);
      }
    }

    return { ok: true as const, tier: found.tier, email };
  });

/** Checks whether an email address already holds beta access. */
export const checkBetaAccess = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ email: z.string().trim().email().max(255) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const { data: row, error } = await supabaseAdmin
      .from("beta_redemptions")
      .select("tier")
      .eq("email", data.email.toLowerCase())
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { tier: row?.tier ?? null };
  });
