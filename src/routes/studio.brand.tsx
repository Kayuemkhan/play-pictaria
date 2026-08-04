import { createFileRoute } from "@tanstack/react-router";
import { StudioComposer } from "@/components/StudioComposer";

export const Route = createFileRoute("/studio/brand")({
  head: () => ({
    meta: [
      { title: "Branding Studio — Branded Puzzles That Stop the Scroll" },
      {
        name: "description",
        content:
          "Place your logo anywhere on the photograph, publish a branded playable link and give your audience a reason to stay.",
      },
      { property: "og:title", content: "Branding Studio — Pictaria" },
      {
        property: "og:description",
        content:
          "Logo placement, action buttons and engagement analytics on every branded Pictaria you send.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <StudioComposer
      tier="brand"
      heading="Branding Studio"
      kicker="A picture stops the scroll — a puzzle makes them stay"
      maxPhotos={10}
      editing
      logoPlacement
      highlights={[
        "Upload your logo and drag it anywhere on the photograph.",
        "Retouching included — light, depth, colour and golden warmth.",
        "Branded playable links for social, email and campaigns.",
        "Action buttons beneath the puzzle: book, shop, reserve, subscribe.",
        "Engagement analytics: opens, plays, completions and time on puzzle.",
        "The Pictaria badge stays very small, at the very bottom.",
      ]}
    />
  ),
});
