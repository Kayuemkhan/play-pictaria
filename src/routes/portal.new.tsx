import { createFileRoute, Link } from "@tanstack/react-router";

import { AdminPageHeader } from "@/components/portal/AdminPageHeader";
import { BusinessEditor } from "@/components/portal/BusinessEditor";

export const Route = createFileRoute("/portal/new")({
  head: () => ({
    meta: [
      { title: "Pictaria Project" },
      { name: "description", content: "A community project for Maui support." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: NewBusiness,
});

function NewBusiness() {
  return (
    <div className="mx-auto max-w-md">
      <AdminPageHeader
        title="New Business"
        description="A community project for Maui support."
        actions={
          <Link
            to="/collection/$collectionId"
            params={{ collectionId: "portal" }}
            className="text-xs text-muted-foreground underline hover:text-foreground"
          >
            I Choose Me ↗
          </Link>
        }
      />
      <BusinessEditor />
    </div>
  );
}
