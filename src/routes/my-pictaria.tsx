import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/my-pictaria")({
  head: () => ({
    meta: [
      { title: "Your Private Pictaria — Five Galleries, Your Pictures" },
      {
        name: "description",
        content:
          "A preview of your own private Pictaria world: five galleries you name yourself, your pictures inside, and a gentle option to share a favorite with the Pictaria community.",
      },
      { property: "og:title", content: "Your Private Pictaria" },
      {
        property: "og:description",
        content:
          "Name five galleries, upload your hero shots, caption them, and choose which ones to submit for the community collection.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MyPictariaLayout,
});

function MyPictariaLayout() {
  return (
    <main className="mx-auto w-full max-w-2xl px-5 pb-24 pt-6">
      <p className="text-center text-[0.6rem] tracking-[0.28em] text-foreground/45 uppercase">
        Personal Studio · Preview
      </p>
      <h1 className="mt-2 text-center font-display text-4xl leading-tight text-foreground">
        Your Private Pictaria
      </h1>
      <p className="mx-auto mt-3 max-w-md text-center text-sm leading-relaxed text-foreground/65">
        Five galleries, yours to name. Fill each one with the pictures you love
        most, turn them into puzzles, and — only if you'd like to — send one to
        Pictaria to be considered for the community collection.
      </p>

      <Outlet />
    </main>
  );
}
