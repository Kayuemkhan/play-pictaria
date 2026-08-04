import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Check, Copy, ImagePlus, X } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { HeroPuzzle, type HeroCorner } from "@/components/HeroPuzzle";
import { PuzzleBoard } from "@/components/PuzzleBoard";
import { difficulties } from "@/data/collections";
import { publishPictaria } from "@/lib/pictarias.functions";

/** Fixed Pictaria signature framing — the same one used on the home hero. */
const HERO_CORNER: HeroCorner = "bottom-right";
const HERO_WEDGE = 4;

export type StudioTier = "free" | "personal" | "artist" | "brand";

/** Hard cap on how many recipients one send can carry, per studio. */
const MAX_RECIPIENTS: Record<StudioTier, number> = {
  free: 10,
  personal: 25,
  artist: 50,
  brand: 1000,
};

export interface StudioComposerProps {
  tier: StudioTier;
  /** Page heading, e.g. "Send a free Pictaria". */
  heading: string;
  /** Small line beneath the heading. */
  kicker: string;
  maxPhotos: number;
  /** Artist Studio: retouching sliders that are baked into the shared pictures. */
  editing?: boolean;
  /** Brand Studio: logo placement on the photograph. */
  logoPlacement?: boolean;
  /** Bullet list of what this studio celebrates. */
  highlights: string[];
}

interface Photo {
  id: string;
  url: string;
  file: File;
}

interface Edits {
  brightness: number;
  contrast: number;
  saturate: number;
  warmth: number;
}

const NO_EDITS: Edits = { brightness: 100, contrast: 100, saturate: 100, warmth: 0 };

const filterCss = (e: Edits) =>
  `brightness(${e.brightness}%) contrast(${e.contrast}%) saturate(${e.saturate}%) sepia(${e.warmth}%)`;

/** Bakes the retouching (and an optional logo) into a JPEG data URL. */
async function renderPhoto(
  file: File,
  edits: Edits,
  logo: { url: string; x: number; y: number; scale: number } | null,
): Promise<string> {
  const src = URL.createObjectURL(file);
  try {
    const img = await loadImage(src);
    const max = 1600;
    const scale = Math.min(1, max / Math.max(img.width, img.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Your browser could not prepare this picture.");
    ctx.filter = filterCss(edits);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    ctx.filter = "none";
    if (logo) {
      const mark = await loadImage(logo.url);
      const w = canvas.width * logo.scale;
      const h = (mark.height / mark.width) * w;
      ctx.drawImage(
        mark,
        (logo.x / 100) * canvas.width - w / 2,
        (logo.y / 100) * canvas.height - h / 2,
        w,
        h,
      );
    }
    return canvas.toDataURL("image/jpeg", 0.86);
  } finally {
    URL.revokeObjectURL(src);
  }
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("That picture could not be read."));
    img.src = src;
  });
}

export function StudioComposer({
  tier,
  heading,
  kicker,
  maxPhotos,
  editing = false,
  logoPlacement = false,
  highlights,
}: StudioComposerProps) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [heroIndex, setHeroIndex] = useState(0);
  const [brand, setBrand] = useState("");
  const [headline, setHeadline] = useState("");
  const [caption, setCaption] = useState("");
  const [edits, setEdits] = useState<Edits>(NO_EDITS);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoPos, setLogoPos] = useState({ x: 22, y: 88, scale: 0.28 });
  const [playing, setPlaying] = useState<{ url: string; grid: number } | null>(
    null,
  );
  const [cardPos, setCardPos] = useState({ x: 66, y: 38 });
  const [recipients, setRecipients] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [publishState, setPublishState] = useState<"idle" | "working" | "error">(
    "idle",
  );
  const [publishError, setPublishError] = useState("");
  const [copied, setCopied] = useState(false);

  const fileInput = useRef<HTMLInputElement>(null);
  const logoInput = useRef<HTMLInputElement>(null);
  const urls = useRef<string[]>([]);

  useEffect(
    () => () => {
      urls.current.forEach((u) => URL.revokeObjectURL(u));
    },
    [],
  );

  const add = (files: FileList | null) => {
    if (!files || !files.length) return;
    setShareUrl("");
    setPhotos((prev) => {
      const room = Math.max(0, maxPhotos - prev.length);
      const next = Array.from(files)
        .slice(0, room)
        .map((file, i) => {
          const url = URL.createObjectURL(file);
          urls.current.push(url);
          return { id: `${Date.now()}-${i}-${file.name}`, url, file };
        });
      return [...prev, ...next];
    });
  };

  const remove = (id: string) => {
    setShareUrl("");
    setPhotos((prev) => {
      const kept = prev.filter((p) => p.id !== id);
      setHeroIndex((h) => Math.min(h, Math.max(kept.length - 1, 0)));
      return kept;
    });
  };

  const hero = photos[heroIndex] ?? photos[0];
  const publish = useServerFn(publishPictaria);

  const createLink = async () => {
    if (!photos.length) return;
    setPublishState("working");
    setPublishError("");
    try {
      const rendered: string[] = [];
      const ordered = hero
        ? [hero, ...photos.filter((p) => p.id !== hero.id)]
        : photos;
      for (const photo of ordered) {
        rendered.push(
          await renderPhoto(
            photo.file,
            editing ? edits : NO_EDITS,
            logoPlacement && logoUrl
              ? { url: logoUrl, ...logoPos }
              : null,
          ),
        );
      }
      const { code } = await publish({
        data: {
          title: brand.trim(),
          tagline: headline.trim(),
          story: caption.trim(),
          grid: 4,
          tier,
          photos: rendered,
        },
      });
      setShareUrl(`${window.location.origin}/p/${code}`);
      setPublishState("idle");
    } catch (err) {
      setPublishState("error");
      setPublishError(
        err instanceof Error ? err.message : "Something went wrong.",
      );
    }
  };

  const copyLink = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  const maxRecipients = MAX_RECIPIENTS[tier];
  const recipientList = recipients
    .split(/[,;\s]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const overLimit = recipientList.length > maxRecipients;

  /** Opens the visitor's own mail app with the Pictaria invitation prefilled. */
  const sendPictaria = () => {
    if (overLimit) return;
    const to = recipientList.join(",");
    if (!to) return;
    const name = brand.trim() || "a Pictaria";
    const subject = `${name} — a puzzle for you`;
    const body = [
      headline.trim() || "Can you solve this one?",
      caption.trim(),
      "",
      `Play it here: ${shareUrl || "https://memory-tile-maker.lovable.app"}`,
      "",
      "Made with Pictaria — turn your pictures into play.",
    ]
      .filter(Boolean)
      .join("\n");
    window.location.href = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const startDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const frame = e.currentTarget.parentElement;
    if (!frame) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const move = (ev: PointerEvent) => {
      const r = frame.getBoundingClientRect();
      const x = ((ev.clientX - r.left) / r.width) * 100;
      const y = ((ev.clientY - r.top) / r.height) * 100;
      setCardPos({
        x: Math.min(90, Math.max(10, x)),
        y: Math.min(92, Math.max(8, y)),
      });
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const startLogoDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const frame = e.currentTarget.parentElement;
    if (!frame) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const move = (ev: PointerEvent) => {
      const r = frame.getBoundingClientRect();
      setLogoPos((prev) => ({
        ...prev,
        x: Math.min(96, Math.max(4, ((ev.clientX - r.left) / r.width) * 100)),
        y: Math.min(96, Math.max(4, ((ev.clientY - r.top) / r.height) * 100)),
      }));
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  if (playing) {
    return (
      <PuzzleBoard
        key={`${playing.url}-${playing.grid}`}
        src={playing.url}
        title={brand.trim() || "Your picture"}
        grid={playing.grid}
        onExit={() => setPlaying(null)}
        onChangeDifficulty={() => setPlaying(null)}
      />
    );
  }

  return (
    <main className="min-h-screen bg-shell pb-16">
      <header className="flex items-center gap-3 px-4 pt-5 sm:px-8">
        <Link
          to="/"
          aria-label="Back to home"
          className="grid h-10 w-10 place-items-center rounded-full bg-deep text-accent transition-transform hover:scale-105"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
        </Link>
        <div className="min-w-0">
          <h1 className="font-display text-lg tracking-[0.2em] uppercase">
            {heading}
          </h1>
          <p className="text-[10px] tracking-[0.22em] text-muted-foreground uppercase">
            {kicker}
          </p>
        </div>
      </header>

      <div className="mx-auto mt-6 grid w-full max-w-5xl gap-6 px-4 sm:px-8 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
        {/* preview */}
        <section>
          <div className="relative overflow-hidden rounded-[26px] bg-deep shadow-lift">
            <div className="relative aspect-[3/4] w-full">
              {hero ? (
                <>
                  <img
                    src={hero.url}
                    alt={`${brand.trim() || "Your"} hero photograph composed as a Pictaria puzzle`}
                    style={editing ? { filter: filterCss(edits) } : undefined}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-deep/70 via-transparent to-deep/35" />
                  <HeroPuzzle
                    key={hero.id}
                    src={hero.url}
                    corner={HERO_CORNER}
                    wedge={HERO_WEDGE}
                    depth={3}
                    inset={0}
                    animated
                  />
                  {headline.trim() && (
                    <div
                      role="group"
                      aria-label="Drag to position the tagline"
                      onPointerDown={startDrag}
                      style={{
                        left: `${cardPos.x}%`,
                        top: `${cardPos.y}%`,
                        transform: "translate(-50%, -50%)",
                      }}
                      className="absolute z-[4] w-[52%] cursor-grab touch-none rounded-xl bg-deep/55 px-3 py-2 backdrop-blur-[3px] active:cursor-grabbing"
                    >
                      <p className="font-display text-[0.85rem] leading-tight text-shell">
                        {headline}
                      </p>
                      <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-accent px-2.5 py-1 text-[0.5rem] tracking-[0.14em] text-deep uppercase">
                        Play now <span aria-hidden>›</span>
                      </span>
                    </div>
                  )}
                  {logoPlacement && logoUrl && (
                    <div
                      role="group"
                      aria-label="Drag to position your logo"
                      onPointerDown={startLogoDrag}
                      style={{
                        left: `${logoPos.x}%`,
                        top: `${logoPos.y}%`,
                        width: `${logoPos.scale * 100}%`,
                        transform: "translate(-50%, -50%)",
                      }}
                      className="absolute z-[5] cursor-grab touch-none active:cursor-grabbing"
                    >
                      <img src={logoUrl} alt="Your logo" className="w-full" />
                    </div>
                  )}
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInput.current?.click()}
                  className="flex h-full w-full flex-col items-center justify-center gap-3 text-deep-foreground/70 transition-colors hover:text-accent"
                >
                  <ImagePlus className="h-8 w-8" strokeWidth={1.25} />
                  <span className="text-[10px] tracking-[0.24em] uppercase">
                    Add your photograph
                  </span>
                  <span className="max-w-[16rem] text-center text-[10px] leading-relaxed tracking-[0.12em] text-deep-foreground/45 uppercase">
                    Celebrate your weddings, vacations, birthdays,
                    anniversaries, adventures, pets and so much more — add your
                    {maxPhotos > 1 ? ` up to ${maxPhotos} photographs` : " photograph"} here
                  </span>
                </button>
              )}
            </div>
            {hero && caption.trim() && (
              <div className="border-t border-shell/10 px-5 py-4">
                <p className="text-[9px] tracking-[0.24em] text-accent uppercase">
                  {brand.trim() || "The story"}
                </p>
                <p className="mt-2 text-xs leading-relaxed whitespace-pre-line text-shell/85">
                  {caption}
                </p>
              </div>
            )}
          </div>

          {hero && (
            <div className="mt-3 flex flex-wrap gap-2">
              {difficulties.map((d) => (
                <button
                  key={d.grid}
                  type="button"
                  onClick={() => setPlaying({ url: hero.url, grid: d.grid })}
                  className="rounded-full bg-deep px-3.5 py-1.5 text-[0.6rem] tracking-[0.18em] text-accent uppercase shadow-soft transition-transform hover:scale-[1.03]"
                >
                  Play {d.grid}×{d.grid}
                </button>
              ))}
            </div>
          )}

          <ul className="mt-4 grid gap-1.5">
            {highlights.map((h) => (
              <li
                key={h}
                className="flex gap-2 text-[11px] leading-relaxed text-muted-foreground"
              >
                <span className="mt-1.5 h-1 w-1 shrink-0 rotate-45 bg-accent" />
                {h}
              </li>
            ))}
          </ul>
        </section>

        {/* controls */}
        <section className="rounded-[26px] border border-border bg-card/70 p-5">
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            multiple={maxPhotos > 1}
            className="sr-only"
            onChange={(e) => {
              add(e.target.files);
              e.target.value = "";
            }}
          />

          <h2 className="font-display text-base tracking-[0.2em] uppercase">
            Compose
          </h2>
          <div className="mt-4 grid gap-4">
            <label className="grid gap-1.5">
              <span className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                Pictaria
              </span>
              <input
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Road to Hana"
                className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/40 focus:border-accent"
              />
            </label>

            <label className="grid gap-1.5">
              <span className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                Tagline
              </span>
              <input
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="Can you solve today's pineapple?"
                className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/40 focus:border-accent"
              />
            </label>

            <label className="grid gap-1.5">
              <span className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                Story note (optional)
              </span>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={4}
                placeholder="A recipe, the location, a memory — anything you'd like to share beneath the picture."
                className="resize-y rounded-xl border border-border bg-background px-3 py-2 text-sm leading-relaxed outline-none placeholder:text-muted-foreground/40 focus:border-accent"
              />
            </label>
          </div>

          {/* pictures */}
          <div className="mt-7">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
                {photos.length > 0
                  ? `${photos.length} of ${maxPhotos} — tap one to make it the hero`
                  : maxPhotos > 1
                    ? `Add up to ${maxPhotos} pictures`
                    : "Add one picture"}
              </p>
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                disabled={photos.length >= maxPhotos}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-deep px-3 py-1.5 text-[0.55rem] tracking-[0.18em] text-accent uppercase shadow-soft transition-transform hover:scale-[1.03] disabled:opacity-50"
              >
                <ImagePlus className="h-3 w-3" strokeWidth={1.5} />
                {photos.length ? "Add more" : "Choose photos"}
              </button>
            </div>

            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {photos.map((photo, i) => (
                  <div key={photo.id} className="relative">
                    <button
                      type="button"
                      onClick={() => setHeroIndex(i)}
                      className={`block w-full overflow-hidden rounded-xl transition-shadow ${
                        i === heroIndex
                          ? "ring-2 ring-accent"
                          : "shadow-soft hover:shadow-lift"
                      }`}
                    >
                      <img
                        src={photo.url}
                        alt=""
                        style={editing ? { filter: filterCss(edits) } : undefined}
                        className="aspect-[3/4] w-full object-cover"
                      />
                    </button>
                    <button
                      type="button"
                      aria-label="Remove picture"
                      onClick={() => remove(photo.id)}
                      className="absolute top-1 right-1 grid h-6 w-6 place-items-center rounded-full bg-deep/85 text-shell transition-transform hover:scale-105"
                    >
                      <X className="h-3 w-3" strokeWidth={2} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPlaying({ url: photo.url, grid: 4 })}
                      className="mt-1 w-full text-[0.55rem] tracking-[0.18em] text-muted-foreground uppercase transition-colors hover:text-foreground"
                    >
                      Play
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* artist retouching */}
          {editing && (
            <div className="mt-7 rounded-[4px] border border-accent/60 bg-card/70 p-4">
              <h2 className="font-display text-base tracking-[0.2em] uppercase">
                Retouch
              </h2>
              <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                Light, depth, colour and a touch of golden warmth — baked into
                every picture you share.
              </p>
              <div className="mt-4 grid gap-3">
                {(
                  [
                    ["brightness", "Light", 60, 150],
                    ["contrast", "Depth", 60, 160],
                    ["saturate", "Colour", 0, 200],
                    ["warmth", "Golden warmth", 0, 60],
                  ] as const
                ).map(([key, label, min, max]) => (
                  <label key={key} className="grid gap-1">
                    <span className="flex justify-between text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
                      {label}
                      <span>{edits[key]}</span>
                    </span>
                    <input
                      type="range"
                      min={min}
                      max={max}
                      value={edits[key]}
                      onChange={(e) =>
                        setEdits((prev) => ({
                          ...prev,
                          [key]: Number(e.target.value),
                        }))
                      }
                      className="accent-primary"
                    />
                  </label>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setEdits(NO_EDITS)}
                className="mt-3 text-[0.55rem] tracking-[0.18em] text-muted-foreground uppercase hover:text-foreground"
              >
                Reset retouching
              </button>
            </div>
          )}

          {/* brand logo */}
          {logoPlacement && (
            <div className="mt-7 rounded-[4px] border border-accent/60 bg-card/70 p-4">
              <h2 className="font-display text-base tracking-[0.2em] uppercase">
                Your logo
              </h2>
              <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                Upload your mark, then drag it anywhere on the photograph.
              </p>
              <input
                ref={logoInput}
                type="file"
                accept="image/png,image/webp,image/jpeg"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const url = URL.createObjectURL(file);
                    urls.current.push(url);
                    setLogoUrl(url);
                    setShareUrl("");
                  }
                  e.target.value = "";
                }}
              />
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => logoInput.current?.click()}
                  className="rounded-full bg-deep px-3 py-1.5 text-[0.55rem] tracking-[0.18em] text-accent uppercase shadow-soft"
                >
                  {logoUrl ? "Replace logo" : "Upload logo"}
                </button>
                {logoUrl && (
                  <label className="grid flex-1 gap-1">
                    <span className="text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
                      Size
                    </span>
                    <input
                      type="range"
                      min={10}
                      max={60}
                      value={Math.round(logoPos.scale * 100)}
                      onChange={(e) =>
                        setLogoPos((prev) => ({
                          ...prev,
                          scale: Number(e.target.value) / 100,
                        }))
                      }
                      className="accent-primary"
                    />
                  </label>
                )}
              </div>
            </div>
          )}

          {/* share link */}
          <div className="mt-7 rounded-[4px] border border-accent/60 bg-card/70 p-4">
            <h2 className="font-display text-base tracking-[0.2em] uppercase">
              Get your link
            </h2>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
              We publish your Pictaria and hand you a link anyone can open and
              play — text it, post it, or send it below.
            </p>
            <button
              type="button"
              onClick={createLink}
              disabled={!photos.length || publishState === "working"}
              className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[0.6rem] tracking-[0.2em] text-primary-foreground uppercase shadow-lift transition-transform hover:scale-[1.03] disabled:opacity-50"
            >
              {publishState === "working" ? "Publishing…" : "Create my link"}
              <span aria-hidden>›</span>
            </button>
            {publishState === "error" && (
              <p className="mt-2 text-[11px] text-destructive">{publishError}</p>
            )}
            {shareUrl && (
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2">
                <span className="min-w-0 flex-1 truncate text-xs">
                  {shareUrl}
                </span>
                <button
                  type="button"
                  onClick={copyLink}
                  aria-label="Copy link"
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-deep text-accent"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5" strokeWidth={2} />
                  ) : (
                    <Copy className="h-3.5 w-3.5" strokeWidth={1.75} />
                  )}
                </button>
              </div>
            )}
          </div>

          {/* send */}
          <div className="mt-4 rounded-[4px] border border-accent/60 bg-card/70 p-4">
            <h2 className="font-display text-base tracking-[0.2em] uppercase">
              Send it
            </h2>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
              Add one email or a whole group, separated by commas — we open your
              mail with the Pictaria invitation ready to go.
            </p>
            <label className="mt-3 grid gap-1.5">
              <span className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                Send to
              </span>
              <input
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
                placeholder="mom@example.com, ohana@example.com"
                className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/40 focus:border-accent"
              />
            </label>
            <button
              type="button"
              onClick={sendPictaria}
              disabled={!recipients.trim()}
              className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[0.6rem] tracking-[0.2em] text-primary-foreground uppercase shadow-lift transition-transform hover:scale-[1.03] disabled:opacity-50"
            >
              Send Pictaria
              <span aria-hidden>›</span>
            </button>
          </div>

          {/* CTAs */}
          <div className="relative mt-6 overflow-hidden rounded-[4px] border border-accent/60 bg-card/70 p-4">
            <div className="relative grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
              <p className="min-w-0 font-display text-[0.85rem] leading-snug [color:color-mix(in_oklch,var(--foreground)_92%,black)]">
                I&rsquo;m a business — I would love to send Pictaria&rsquo;s!
              </p>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className="text-[0.55rem] tracking-[0.18em] text-muted-foreground uppercase">
                  Analytics &amp; action buttons
                </span>
                <Link
                  to="/studio/brand"
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-1 text-[0.55rem] tracking-[0.2em] text-primary-foreground uppercase shadow-lift transition-transform hover:scale-[1.03]"
                >
                  Brand Studio
                  <span aria-hidden>›</span>
                </Link>
              </div>
            </div>
          </div>

          <div className="relative mt-4 overflow-hidden rounded-[4px] border border-accent/60 bg-card/70 p-4">
            <div className="relative grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
              <p className="min-w-0 font-display text-[0.85rem] leading-snug [color:color-mix(in_oklch,var(--foreground)_92%,black)]">
                I love puzzles — I would love to send Pictaria&rsquo;s!
              </p>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className="text-[0.55rem] tracking-[0.18em] text-muted-foreground uppercase">
                  Personal &amp; Artist Studio
                </span>
                <Link
                  to="/pricing"
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-1 text-[0.55rem] tracking-[0.2em] text-primary-foreground uppercase shadow-lift transition-transform hover:scale-[1.03]"
                >
                  See pricing
                  <span aria-hidden>›</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
