import { createFileRoute } from "@tanstack/react-router";
import { StudioComposer } from "@/components/StudioComposer";

export const Route = createFileRoute("/studio/personal")({
  head: () => ({
    meta: [
      { title: "Personal Studio — Pictaria Storybooks for Your Ohana" },
      {
        name: "description",
        content:
          "Compose a storybook of up to ten pictures, get an instant playable link and send it to everyone you love.",
      },
      { property: "og:title", content: "Personal Studio — Pictaria" },
      {
        property: "og:description",
        content:
          "Ten pictures, one storybook, one link. Celebrate weddings, vacations, keiki birthdays, adventures and pets.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <StudioComposer
      tier="personal"
      heading="Personal Studio"
      kicker="Ten pictures, one storybook"
      maxPhotos={10}
      highlights={[]}
    />
  ),
});
