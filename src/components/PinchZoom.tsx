import { useEffect, useRef, useState, type ReactNode } from "react";

const MIN = 0.45;
const MAX = 1;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/**
 * A small, self-contained pinch-to-zoom surface. Two fingers zoom the content
 * inside it (and one finger pans once zoomed in) without touching the rest of
 * the page. Trackpad pinch and ctrl+wheel work too.
 */
export function PinchZoom({
  children,
  className = "",
  scrollX = false,
}: {
  children: ReactNode;
  className?: string;
  /** let wide content scroll sideways instead of being clipped */
  scrollX?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [baseHeight, setBaseHeight] = useState<number | null>(null);

  // keep the surface exactly as tall as the (scaled) content, so shrinking the
  // content does not leave a big empty gap below it
  useEffect(() => {
    const el = contentRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => setBaseHeight(el.offsetHeight));
    ro.observe(el);
    setBaseHeight(el.offsetHeight);
    return () => ro.disconnect();
  }, []);

  const state = useRef({ zoom: 1, offset: { x: 0, y: 0 } });
  state.current = { zoom, offset };

  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{ dist: number; cx: number; cy: number } | null>(null);

  const apply = (next: number, px: number, py: number) => {
    const cur = state.current;
    const clamped = clamp(next, MIN, MAX);
    const k = clamped / cur.zoom;
    const x = px - (px - cur.offset.x) * k;
    const y = py - (py - cur.offset.y) * k;
    setZoom(clamped);
    setOffset(clamped === MAX ? { x: 0, y: 0 } : { x, y });
  };

  // native, non-passive wheel listener so trackpad pinch does not zoom the page
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey) return; // plain scrolling stays normal
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1);
      apply(
        state.current.zoom * Math.exp(-dy * 0.0025),
        e.clientX - rect.left,
        e.clientY - rect.top,
      );
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const localPoints = () => {
    const el = containerRef.current;
    const rect = el?.getBoundingClientRect();
    return [...pointers.current.values()].map((p) => ({
      x: p.x - (rect?.left ?? 0),
      y: p.y - (rect?.top ?? 0),
    }));
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse" && state.current.zoom === 1) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    gesture.current = null;
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = localPoints();

    if (pts.length >= 2) {
      const a = pts[0]!;
      const b = pts[1]!;

      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const cx = (a.x + b.x) / 2;
      const cy = (a.y + b.y) / 2;
      const prev = gesture.current;
      if (prev && prev.dist > 0) {
        apply(state.current.zoom * (dist / prev.dist), cx, cy);
        setOffset((o) => ({ x: o.x + (cx - prev.cx), y: o.y + (cy - prev.cy) }));
      }
      gesture.current = { dist, cx, cy };
      return;
    }

    if (pts.length === 1 && state.current.zoom > 1) {
      setOffset((o) => ({ x: o.x + e.movementX, y: o.y + e.movementY }));
    }
  };

  const endPointer = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    gesture.current = null;
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endPointer}
      onPointerCancel={endPointer}
      onDoubleClick={() => {
        setZoom(MAX);
        setOffset({ x: 0, y: 0 });
      }}
      className={`relative overflow-hidden overscroll-contain ${className}`}
      style={{ touchAction: "pan-y" }}
    >
      <div
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
          transformOrigin: "0 0",
          transition: gesture.current ? "none" : "transform 120ms var(--ease-calm, ease-out)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
