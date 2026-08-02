export type GridSize = 3 | 4 | 5 | 6;

export interface PieceDef {
  id: number;
  row: number;
  col: number;
  /** SVG path in local piece coordinates (origin at cell top-left, before pad offset) */
  path: string;
  padX: number;
  padY: number;
}

export interface PuzzleGeometry {
  pieces: PieceDef[];
  cellW: number;
  cellH: number;
  padX: number;
  padY: number;
}

/**
 * Builds one edge of a piece. Traversal is clockwise, so the inward normal is
 * always (-uy, ux). `tab` = 1 means the knob bulges outward, -1 inward, 0 flat.
 */
function edge(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  tab: number,
): string {
  if (!tab) return `L ${bx} ${by}`;
  const dx = bx - ax;
  const dy = by - ay;
  const len = Math.hypot(dx, dy);
  const ux = dx / len;
  const uy = dy / len;
  // inward normal
  const nx = -uy;
  const ny = ux;
  const s = -tab; // positive s pushes along inward normal
  const r = 0.1 * len;

  const p4x = ax + ux * len * 0.4;
  const p4y = ay + uy * len * 0.4;
  const p6x = ax + ux * len * 0.6;
  const p6y = ay + uy * len * 0.6;

  const c1x = p4x - ux * r * 0.7 + nx * s * r * 2.5;
  const c1y = p4y - uy * r * 0.7 + ny * s * r * 2.5;
  const c2x = p6x + ux * r * 0.7 + nx * s * r * 2.5;
  const c2y = p6y + uy * r * 0.7 + ny * s * r * 2.5;

  return `L ${p4x} ${p4y} C ${c1x} ${c1y} ${c2x} ${c2y} ${p6x} ${p6y} L ${bx} ${by}`;
}

/**
 * Pieces are equal-sized rectangles (no interlocking tabs), so `edge` is only
 * kept for reference/future styles.
 */
void edge;

export function buildPuzzle(
  n: number,
  boardW: number,
  boardH: number,
): PuzzleGeometry {
  const cellW = boardW / n;
  const cellH = boardH / n;
  const padX = 0;
  const padY = 0;

  const pieces: PieceDef[] = [];
  for (let row = 0; row < n; row++) {
    for (let col = 0; col < n; col++) {
      const d = `M 0 0 L ${cellW} 0 L ${cellW} ${cellH} L 0 ${cellH} Z`;
      pieces.push({ id: row * n + col, row, col, path: d, padX, padY });
    }
  }

  return { pieces, cellW, cellH, padX, padY };
}

