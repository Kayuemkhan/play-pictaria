import { createFileRoute, redirect } from "@tanstack/react-router";

/** Legacy /index URL — send visitors to the real homepage. */
export const Route = createFileRoute("/index_")({
  beforeLoad: () => {
    throw redirect({ to: "/" });
  },
});
