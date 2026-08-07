import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/portal/")({
  head: () => ({
    meta: [
      { title: "Victoria's" },
      { name: "description", content: "A community project celebrating Maui businesses." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: PortalIndexRedirect,
});

function PortalIndexRedirect() {
  return <Navigate to="/portal/new" />;
}
