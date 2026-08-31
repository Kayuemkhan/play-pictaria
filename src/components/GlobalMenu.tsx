import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";

export const menuLinks = [
  { to: "/launch", label: "Launch" },
  { to: "/collections", label: "Galleries" },
  { to: "/about", label: "Travel to Pictaria" },
  { to: "/create", label: "Send a free Pictaria" },
  { to: "/daily", label: "Daily Pictaria" },
  { to: "/mindfulness", label: "Mindful Music" },
  { to: "/work-life-balance", label: "Work Life Balance" },
  { to: "/easter-egg", label: "Easter Eggs" },
  { to: "/share", label: "Share Pictaria" },
  { to: "/vision-board", label: "Vision Board" },
  { to: "/pricing", label: "Pricing" },
  // Temporary: quick access to the hidden "I Choose Me" collection.
  { to: "/collection/portal", label: "I Choose Me" },
] as const;


/**
 * The three-line pull-down navigation, fixed to the top-right corner of every
 * page. Deliberately quiet: no circle, no plate — just three soft lines that
 * brighten when touched.
 */
export function GlobalMenu() {
  const [open, setOpen] = useState(false);

  // Tuck the fixed gold palms away while the pull-down menu is open.
  useEffect(() => {
    document.body.classList.toggle("menu-open", open);
    return () => document.body.classList.remove("menu-open");
  }, [open]);

  return (
    <div className="fixed top-1 right-1 z-[100]">
      <button
        type="button"
        aria-label="Menu"
        aria-expanded={open}
        onPointerDown={(e) => {
          e.preventDefault();
          setOpen((v) => !v);
        }}
        onClick={(e) => e.preventDefault()}
        style={{ touchAction: "manipulation", WebkitTapHighlightColor: "transparent" }}
        className="grid h-14 w-14 cursor-pointer place-items-center text-accent/90 transition-[color,opacity,transform] duration-500 ease-[var(--ease-calm)] hover:text-accent active:scale-95"
      >
        <Menu
          className="h-6 w-6 drop-shadow-[0_1px_6px_oklch(0.15_0.04_230/0.5)]"
          strokeWidth={1.4}
        />
      </button>


      {open && (
        <>
          <div
            className="fixed inset-0 -z-10"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute top-14 right-3 w-56 overflow-hidden rounded-[6px] border border-accent/40 bg-deep py-1 shadow-lift">
            {menuLinks.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                onClick={() => setOpen(false)}
                className="block px-4 py-2.5 text-[0.6rem] tracking-[0.2em] text-shell uppercase transition-colors hover:bg-accent/15 hover:text-accent"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
