import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/my-pictaria/submitted")({
  head: () => ({
    meta: [
      { title: "Picture Submitted — Pictaria" },
      {
        name: "description",
        content:
          "Your picture has been submitted for approval to be viewed by other Pictarians in Pictaria.",
      },
      { property: "og:title", content: "Picture Submitted — Pictaria" },
      {
        property: "og:description",
        content:
          "Your picture has been submitted for approval to be viewed by other Pictarians in Pictaria.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SubmittedPage,
});

function SubmittedPage() {
  return (
    <section className="flex flex-col items-center justify-center py-16 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/15 text-accent">
        <CheckCircle2 className="h-8 w-8" strokeWidth={1.5} />
      </span>

      <h2 className="mt-6 font-display text-3xl leading-tight text-foreground">
        Your picture has been submitted
      </h2>

      <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-foreground/70">
        Thank you for offering it to the community. It is now pending approval.
        Once it is reviewed and accepted, it will be available for other
        Pictarians to enjoy in Pictaria.
      </p>

      <div className="mt-8 flex flex-col items-center gap-3">
        <Link
          to="/my-pictaria"
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-6 py-2.5 text-xs tracking-[0.18em] text-primary-foreground uppercase shadow-lift transition-transform hover:scale-[1.03]"
        >
          Back to your galleries
        </Link>
        <Link
          to="/collections"
          className="text-xs tracking-[0.16em] text-foreground/55 uppercase underline underline-offset-2"
        >
          Explore the public gallery
        </Link>
      </div>
    </section>
  );
}
