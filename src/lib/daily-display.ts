/**
 * A daily pick can point either at a curated collection puzzle or at a
 * Project Pictaria business photograph, stored as `portal:<share_code>`.
 */
export const PORTAL_PICK_PREFIX = "portal:";

export function isPortalPick(puzzleId: string) {
  return puzzleId.startsWith(PORTAL_PICK_PREFIX);
}

export function portalPickCode(puzzleId: string) {
  return puzzleId.slice(PORTAL_PICK_PREFIX.length);
}

export function portalPickId(shareCode: string) {
  return `${PORTAL_PICK_PREFIX}${shareCode}`;
}
