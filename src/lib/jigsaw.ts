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

export function buildPuzzle(
  n: number,
  boardW: number,
  boardH: number,
): PuzzleGeometry {
  const cellW = boardW / n;
  const cellH = boardH / n;
  const padX = cellH * 0.2;
  const padY = cellW * 0.2;

  // hTab[r][c] -> tab on the bottom edge of piece (r, c), for r in 0..n-2
  const hTab: number[][] = [];
  for (let r = 0; r < n - 1; r++) {
    hTab[r] = [];
    for (let c = 0; c < n; c++) hTab[r][c] = Math.random() < 0.5 ? 1 : -1;
  }
  // vTab[r][c] -> tab on the right edge of piece (r, c), for c in 0..n-2
  const vTab: number[][] = [];
  for (let r = 0; r < n; r++) {
    vTab[r] = [];
    for (let c = 0; c < n - 1; c++) vTab[r][c] = Math.random() < 0.5 ? 1 : -1;
  }

  const pieces: PieceDef[] = [];
  for (let row = 0; row < n; row++) {
    for (let col = 0; col < n; col++) {
      const top = row === 0 ? 0 : -hTab[row - 1][col];
      const right = col === n - 1 ? 0 : vTab[row][col];
      const bottom = row === n - 1 ? 0 : hTab[row][col];
      const left = col === 0 ? 0 : -vTab[row][col - 1];

      const d = [
        `M 0 0`,
        edge(0, 0, cellW, 0, top),
        edge(cellW, 0, cellW, cellH, right),
        edge(cellW, cellH, 0, cellH, bottom),
        edge(0, cellH, 0, 0, left),
        "Z",
      ].join(" ");

      pieces.push({
        id: row * n + col,
        row,
        col,
        path: d,
        padX,
        padY,
      });
    }
  }

  return { pieces, cellW, cellH, padX, padY };
}
