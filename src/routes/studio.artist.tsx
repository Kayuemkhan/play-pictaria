import { createFileRoute } from "@tanstack/react-router";
import { StudioComposer } from "@/components/StudioComposer";

export const Route = createFileRoute("/studio/artist")({
  head: () => ({
    meta: [
      { title: "Artist Studio — Retouch and Share Your Art as Puzzles" },
      {
        name: "description",
        content:
          "Retouch light, depth, colour and golden warmth, then publish your art as a playable Pictaria with an instant link.",
      },
      { property: "og:title", content: "Artist Studio — Pictaria" },
      {
        property: "og:description",
        content:
          "Photo editing built for artists: light, depth, colour and warmth baked into every picture you share.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <StudioComposer
      tier="artist"
      heading="Artist Studio"
      kicker="Retouch, compose, share"
      maxPhotos={10}
      editing
      highlights={[
        "Photo editing: light, depth, colour and a touch of golden warmth.",
        "Your retouching is baked into every picture you publish.",
        "Ten pictures per collection, with unlimited collections.",
        "An instant playable link, ready for your gallery or newsletter.",
        "A story note beneath each picture for titles, media and pricing.",
      ]}
    />
  ),
});
