import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/portal/")({
  head: () => ({
    meta: [
      { title: "Pictaria Project's" },
      { name: "description", content: "A community project for Maui support." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: PortalIndexRedirect,
});

function PortalIndexRedirect() {
  return <Navigate to="/portal/new" />;
}
