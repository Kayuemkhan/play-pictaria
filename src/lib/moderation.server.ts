import { generateText, Output } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const verdict = z.object({
  allowed: z.boolean(),
  reason: z.string(),
});

const POLICY = `You are the gentle gatekeeper for Pictaria, a family-friendly app that turns
personal photographs into picture puzzles people share with family and friends.

Look at the picture and decide whether it belongs in a family-friendly app.

Set allowed = false when the picture contains any of:
- sexual or nude content, lingerie/underwear-focused or sexually suggestive imagery
- any sexualised depiction of a minor, or a minor in a state of undress
- graphic violence, gore, injury, or death
- hate symbols, harassment, or content that shames or exposes a person
- illegal drug use or weapons presented threateningly

Everything else is allowed: people, portraits, families, children fully clothed in
ordinary settings, pets, food, landscapes, art, travel, celebrations.

Keep reason to one short, kind sentence addressed to the person uploading.`;

/**
 * Runs one picture through AI safety review.
 * Fails open (allows) only if the reviewer itself is unreachable.
 */
export async function reviewPicture(dataUrl: string): Promise<{
  allowed: boolean;
  reason: string;
}> {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) return { allowed: true, reason: "" };

  const gateway = createLovableAiGatewayProvider(key);

  try {
    const { output } = await generateText({
      model: gateway("google/gemini-3.6-flash"),
      output: Output.object({ schema: verdict }),
      instructions: POLICY,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Review this picture." },
            { type: "image", image: new URL(dataUrl) },
          ],
        },
      ],
    });
    return output;
  } catch (err) {
    console.error("Picture review unavailable:", err);
    return { allowed: true, reason: "" };
  }
}
