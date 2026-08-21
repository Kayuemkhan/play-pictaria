import { createFileRoute, notFound, redirect } from "@tanstack/react-router";

const LEGACY_REDIRECTS: Record<string, string> = {
  index: "/",
  home: "/",
  album: "/collections",
  collection: "/collections",
  folders: "/collections",
};

export const Route = createFileRoute("/$")({
  beforeLoad: ({ params }) => {
    const path = String((params as { _splat?: string })._splat ?? "")
      .replace(/^\/+|\/+$/g, "")
      .toLowerCase();
    const target = LEGACY_REDIRECTS[path];
    if (target) throw redirect({ to: target, replace: true });
    throw notFound();
  },
  component: () => null,
});
