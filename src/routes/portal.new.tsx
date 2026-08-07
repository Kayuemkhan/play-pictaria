import { createFileRoute } from "@tanstack/react-router";

import { BusinessEditor } from "@/components/portal/BusinessEditor";

export const Route = createFileRoute("/portal/new")({
  head: () => ({
    meta: [
      { title: "Project Victoria's" },
      { name: "description", content: "A community project for Maui support." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: NewBusiness,
});

function NewBusiness() {
  return (
    <main className="min-h-screen bg-deep px-4 pt-16 pb-24">
      <header className="mx-auto max-w-md text-center">
        <h1 className="font-display text-[1.5rem] text-shell">Project Victoria's</h1>
        <p className="mt-1 text-[10px] tracking-[0.2em] text-shell/60 uppercase">
          a community project for Maui support
        </p>
      </header>
      <div className="mx-auto mt-6 max-w-md">
        <BusinessEditor />
      </div>
    </main>
  );
}
