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
      heading="Brand Studio"
      kicker="Meaningful connections, one picture at a time"
      maxPhotos={10}
      editing
      logoPlacement
      description="What if your customers looked forward to hearing from you every day? With Brand Studio, every message becomes a moment your customers can enjoy. Transform your own photos into interactive Pictarias that invite them to slow down, solve, discover, and smile. It's a refreshing new way to build meaningful connections, strengthen your brand, and create the kind of engagement people genuinely anticipate."
      highlights={[]}
    />
  ),
});
