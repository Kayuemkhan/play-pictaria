import { createFileRoute, Outlet } from "@tanstack/react-router";

import { PortalGuard } from "@/components/portal/PortalGuard";
import { AdminLayout } from "@/components/portal/AdminLayout";

export const Route = createFileRoute("/portal")({
  component: PortalLayout,
});

/**
 * Shared shell for every /portal/* page (the founder's admin panel): one
 * guard, one sidebar, one look. See src/routes/portal.*.tsx for the pages
 * that nest inside this layout's <Outlet/> — TanStack Router's flat-file
 * convention (parent.tsx + parent.child.tsx) wires that up automatically,
 * the same way my-pictaria.tsx already does for /my-pictaria/*.
 */
function PortalLayout() {
  return (
    <PortalGuard>
      <AdminLayout>
        <Outlet />
      </AdminLayout>
    </PortalGuard>
  );
}
