/**
 * Pictaria Project admin pages are hidden (reachable only via the palm-tree tap)
 * rather than passcode-gated — the lock screen was removed on purpose.
 */
export function PortalGuard({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
