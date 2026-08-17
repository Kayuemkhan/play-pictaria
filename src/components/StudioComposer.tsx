import { Link } from "@tanstack/react-router";

import { useEffect, useRef, useState } from "react";
import {
  Aperture,
  Check,
  Contrast,
  Copy,
  ImagePlus,
  Maximize,
  Palette,
  Sparkles,
  Sun,
  Wand2,
  X,
} from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { publishPictaria } from "@/lib/pictarias.functions";
import { PhotoPick, PhotoPlaceholder } from "@/components/PhotoField";

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
  /** Optional longer marketing description shown beneath the header. */
  description?: string;
  /** Softly muted image across the top of the page. */
  heroImage?: string;
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
  scale: number;
  clarity: number;
  vignette: number;
}

const NO_EDITS: Edits = {
  brightness: 100,
  contrast: 100,
  saturate: 100,
  warmth: 0,
  scale: 100,
  clarity: 0,
  vignette: 0,
};

const filterCss = (e: Edits) =>
  `brightness(${e.brightness}%) contrast(${e.contrast + e.clarity * 0.35}%) saturate(${e.saturate}%) sepia(${e.warmth}%)`;

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

    const zoom = Math.max(1, edits.scale / 100);
    const srcW = img.width / zoom;
    const srcH = img.height / zoom;
    const srcX = (img.width - srcW) / 2;
    const srcY = (img.height - srcH) / 2;

    ctx.filter = filterCss(edits);
    ctx.drawImage(
      img,
      srcX,
      srcY,
      srcW,
      srcH,
      0,
      0,
      canvas.width,
      canvas.height,
    );
    ctx.filter = "none";

    if (edits.vignette > 0) {
      const grad = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        canvas.width * 0.28,
        canvas.width / 2,
        canvas.height / 2,
        canvas.width * 0.78,
      );
      const opacity = (edits.vignette / 100) * 0.65;
      grad.addColorStop(0, "rgba(0,0,0,0)");
      grad.addColorStop(1, `rgba(0,0,0,${opacity})`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

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
  description,
  heroImage,

}: StudioComposerProps) {
  const [photos, setPhotos] = useState<Photo[]>([]);

  /** Which picture is open on the lab table. */
  const [activeIndex, setActiveIndex] = useState(0);
  /** Chosen at the very end — the picture friends see first. */
  const [heroIndex, setHeroIndex] = useState(0);
  const [brand, setBrand] = useState("");
  const [headline, setHeadline] = useState("");
  const [caption, setCaption] = useState("");
  const [edits, setEdits] = useState<Edits>(NO_EDITS);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoPos, setLogoPos] = useState({ x: 22, y: 88, scale: 0.28 });
  const [recipients, setRecipients] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [publishState, setPublishState] = useState<"idle" | "working" | "error">(
    "idle",
  );
  const [publishError, setPublishError] = useState("");
  const [copied, setCopied] = useState(false);
  const [activeRetouch, setActiveRetouch] = useState<string | null>(null);

  const retouchTools = [
    { key: "brightness" as const, label: "Light", icon: Sun, min: 60, max: 150 },
    { key: "contrast" as const, label: "Contrast", icon: Contrast, min: 60, max: 160 },
    { key: "saturate" as const, label: "Colour", icon: Palette, min: 0, max: 200 },
    { key: "warmth" as const, label: "Warmth", icon: Sparkles, min: 0, max: 60 },
    { key: "scale" as const, label: "Resize", icon: Maximize, min: 100, max: 200 },
    { key: "clarity" as const, label: "Clean", icon: Wand2, min: 0, max: 100 },
    { key: "vignette" as const, label: "Vignette", icon: Aperture, min: 0, max: 100 },
  ];

  const urls = useRef<string[]>([]);

  useEffect(
    () => () => {
      urls.current.forEach((u) => URL.revokeObjectURL(u));
    },
    [],
  );

  const add = (files: FileList | null) => {
    if (!files || !files.length) return;
    // read the FileList immediately: the input is cleared right after this call
    const picked = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!picked.length) return;
    const stamped = picked.map((file, i) => {
      const url = URL.createObjectURL(file);
      urls.current.push(url);
      return { id: `${Date.now()}-${i}-${file.name}`, url, file };
    });
    setShareUrl("");
    setPhotos((prev) => {
      const room = Math.max(0, maxPhotos - prev.length);
      return [...prev, ...stamped.slice(0, room)];
    });
  };

  const remove = (id: string) => {
    setShareUrl("");
    setPhotos((prev) => {
      const kept = prev.filter((p) => p.id !== id);
      const last = Math.max(kept.length - 1, 0);
      setActiveIndex((i) => Math.min(i, last));
      setHeroIndex((i) => Math.min(i, last));
      return kept;
    });
  };

  const active = photos[activeIndex] ?? photos[0];
  const hero = photos[heroIndex] ?? photos[0];
  const publish = useServerFn(publishPictaria);

  /** Publishes and returns the play link, or null when it failed. */
  const publishNow = async (): Promise<string | null> => {
    if (!photos.length) return null;
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
            logoPlacement && logoUrl ? { url: logoUrl, ...logoPos } : null,
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
      const url = `${window.location.origin}/p/${code}`;
      setShareUrl(url);
      setPublishState("idle");
      return url;
    } catch (err) {
      setPublishState("error");
      setPublishError(
        err instanceof Error ? err.message : "Something went wrong.",
      );
      return null;
    }
  };

  const createLink = () => {
    void publishNow();
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
  const sendPictaria = async () => {
    if (overLimit) return;
    const to = recipientList.join(",");
    if (!to) return;
    // never send people to the front door: publish this picture first
    const link = shareUrl || (await publishNow());
    if (!link) return;
    const name = brand.trim() || "a Pictaria";
    const subject = `${name} — a puzzle for you`;
    const body = [
      headline.trim() || "A puzzle for you",
      caption.trim(),
      "",
      `Open your puzzle here: ${link}`,
      "You'll see the finished picture first, then it breaks into tiles to play.",
      "",
      "Made with Pictaria — turn your pictures into play.",
    ]
      .filter(Boolean)
      .join("\n");
    window.location.href = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
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

  return (
    <main className="min-h-screen bg-shell pb-16">
      {heroImage && (
        <div className="relative h-40 w-full overflow-hidden sm:h-52">
          <img
            src={heroImage}
            alt=""
            aria-hidden
            width={1024}
            height={768}
            className="h-full w-full object-cover opacity-45"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-shell/40 to-shell" />
        </div>
      )}
      <header className="px-4 pt-5 sm:px-8">

        <div className="flex items-center gap-3">

          <div className="min-w-0">
            <h1 className="font-display text-lg tracking-[0.2em] uppercase">
              {heading}
            </h1>
            <p className="text-[10px] tracking-[0.22em] text-muted-foreground uppercase">
              {kicker}
            </p>
          </div>
        </div>
        {description && (
          <p className="mt-4 max-w-3xl text-xs leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </header>




      <div className="mx-auto mt-6 grid w-full max-w-5xl gap-6 px-4 sm:px-8 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
        {/* the lab: the picture, then the studio controls right beneath it */}
        <section>
          <div className="relative overflow-hidden rounded-[26px] bg-deep shadow-lift">
            <div className={`relative w-full ${active ? "aspect-[3/4]" : "h-44 sm:h-52"}`}>
              {active ? (
                <>
                  <img
                    src={active.url}
                    alt={`${brand.trim() || "Your"} photograph in the studio`}
                    style={
                      editing
                        ? {
                            filter: filterCss(edits),
                            transform: `scale(${edits.scale}%)`,
                          }
                        : undefined
                    }
                    className="h-full w-full object-cover transition-transform duration-200"
                  />
                  {editing && edits.vignette > 0 && (
                    <div
                      className="pointer-events-none absolute inset-0"
                      style={{
                        background: `radial-gradient(circle at center, transparent 30%, rgba(0,0,0,${(edits.vignette / 100) * 0.7}) 100%)`,
                      }}
                    />
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
                <PhotoPick
                  label="Add your photograph"
                  multiple={maxPhotos > 1}
                  onFiles={add}
                  fallbackToCamera
                  className="block h-full w-full"
                >
                  <span className="relative block h-full w-full overflow-hidden">
                    <PhotoPlaceholder
                      tone="dark"
                      title="Add your photograph"
                      hint="Tap to take a picture or choose one from your library"
                    />
                  </span>
                </PhotoPick>
              )}

            </div>
            <p className="border-t border-white/10 bg-deep px-4 py-2.5 text-center text-[0.55rem] leading-relaxed tracking-[0.12em] text-deep-foreground/60 uppercase">
              Keep Pictaria beautiful — please only share pictures you'd happily show
              your family.
            </p>
          </div>

          {/* pictures */}
          <div className="mt-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
                {photos.length > 0
                  ? `${photos.length} of ${maxPhotos} — tap one to work on it`
                  : maxPhotos > 1
                    ? `Add up to ${maxPhotos} pictures`
                    : ""}
              </p>

              {photos.length > 0 && (
                <PhotoPick
                  label="Add more pictures"
                  multiple={maxPhotos > 1}
                  disabled={photos.length >= maxPhotos}
                  onFiles={add}
                  fallbackToCamera
                  className="shrink-0"
                >
                  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-deep px-3 py-1.5 text-[0.55rem] tracking-[0.18em] text-accent uppercase shadow-soft transition-transform hover:scale-[1.03]">
                    <ImagePlus className="h-3 w-3" strokeWidth={1.5} />
                    Add more
                  </span>
                </PhotoPick>
              )}
            </div>

            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {photos.map((photo, i) => (
                  <div key={photo.id} className="relative">
                    <button
                      type="button"
                      onClick={() => setActiveIndex(i)}
                      className={`block w-full overflow-hidden rounded-xl transition-shadow ${
                        i === activeIndex
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
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* artist retouching — right beneath the picture */}
          {editing && (
            <div className="mt-4">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                {retouchTools.map(({ key, label, icon: Icon }) => {
                  const isActive = activeRetouch === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setActiveRetouch(isActive ? null : key)}
                      title={label}
                      aria-label={label}
                      aria-pressed={isActive}
                      className={`grid h-10 w-10 place-items-center rounded-full transition-all ${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-lift"
                          : "bg-muted/80 text-foreground shadow-soft hover:bg-muted hover:shadow-lift"
                      }`}
                    >
                      <Icon className="h-4 w-4" strokeWidth={1.5} />
                    </button>
                  );
                })}
              </div>

              {activeRetouch && (
                <div className="mt-4">
                  {retouchTools
                    .filter((t) => t.key === activeRetouch)
                    .map(({ key, label, min, max }) => (
                      <label key={key} className="grid gap-2">
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
              )}

              <button
                type="button"
                onClick={() => {
                  setEdits(NO_EDITS);
                  setActiveRetouch(null);
                }}
                className="mt-3 text-[0.55rem] tracking-[0.18em] text-muted-foreground uppercase hover:text-foreground"
              >
                Reset retouching
              </button>
            </div>
          )}

          {/* brand logo */}
          {logoPlacement && (
            <div className="mt-4 rounded-[4px] border border-accent/60 bg-card/70 p-4">
              <h2 className="font-display text-base tracking-[0.2em] uppercase">
                Your logo
              </h2>
              <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                Upload your mark, then drag it anywhere on the photograph.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <PhotoPick
                  label={logoUrl ? "Replace your logo" : "Upload your logo"}
                  accept="image/png,image/webp,image/jpeg"
                  fallbackToCamera
                  onFiles={(files) => {
                    const file = files?.[0];
                    if (!file) return;
                    const url = URL.createObjectURL(file);
                    urls.current.push(url);
                    setLogoUrl(url);
                    setShareUrl("");
                  }}
                >
                  <span className="rounded-full bg-deep px-3 py-1.5 text-[0.55rem] tracking-[0.18em] text-accent uppercase shadow-soft">
                    {logoUrl ? "Replace logo" : "Upload logo"}
                  </span>
                </PhotoPick>
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
        </section>

        {/* controls */}
        <section className="rounded-[26px] border border-border bg-card/70 p-5">
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
                placeholder="A little puzzle note"
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

          {/* hero picture — decided last */}
          {photos.length > 1 && (
            <div className="mt-7 rounded-[4px] border border-accent/60 bg-card/70 p-4">
              <h2 className="font-display text-base tracking-[0.2em] uppercase">
                Your hero picture
              </h2>
              <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                Finished in the lab? Choose the one picture that opens your
                Pictaria.
              </p>
              <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-5">
                {photos.map((photo, i) => (
                  <button
                    key={photo.id}
                    type="button"
                    onClick={() => setHeroIndex(i)}
                    aria-label={`Make picture ${i + 1} the hero`}
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
                ))}
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
              mail with the Pictaria invitation ready to go. Up to{" "}
              {maxRecipients.toLocaleString()} addresses per send; beyond that,
              copy the play link above into your own email list.
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
              <span
                className={`text-[10px] tracking-[0.12em] uppercase ${overLimit ? "text-destructive" : "text-muted-foreground"}`}
              >
                {recipientList.length} of {maxRecipients.toLocaleString()}
                {overLimit
                  ? " — too many for one send; paste the link into your email list instead"
                  : ""}
              </span>
            </label>
            <button
              type="button"
              onClick={() => void sendPictaria()}
              disabled={
                !recipients.trim() ||
                overLimit ||
                !photos.length ||
                publishState === "working"
              }
              className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[0.6rem] tracking-[0.2em] text-primary-foreground uppercase shadow-lift transition-transform hover:scale-[1.03] disabled:opacity-50"
            >
              {publishState === "working" ? "Publishing…" : "Send Pictaria"}

              <span aria-hidden>›</span>
            </button>
          </div>

          {/* CTAs — never link a studio back to itself */}
          {tier !== "personal" && tier !== "brand" && (
            <div className="relative mt-6 overflow-hidden rounded-[4px] border border-accent/60 bg-card/70 p-4">
              <div className="relative grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
                <p className="min-w-0 font-display text-[0.85rem] leading-snug [color:color-mix(in_oklch,var(--foreground)_92%,black)]">
                  I love puzzles — I would love to send Pictaria&rsquo;s!
                </p>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="text-[0.55rem] tracking-[0.18em] text-muted-foreground uppercase">
                    Storybooks for your ohana
                  </span>
                  <Link
                    to="/studio/personal"
                    className="inline-flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-1 text-[0.55rem] tracking-[0.2em] text-primary-foreground uppercase shadow-lift transition-transform hover:scale-[1.03]"
                  >
                    Personal Studio
                    <span aria-hidden>›</span>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {tier !== "artist" && tier !== "brand" && (
            <div className="relative mt-4 overflow-hidden rounded-[4px] border border-accent/60 bg-card/70 p-4">
              <div className="relative grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
                <p className="min-w-0 font-display text-[0.85rem] leading-snug [color:color-mix(in_oklch,var(--foreground)_92%,black)]">
                  I love photographs — I would love to retouch them first!
                </p>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="text-[0.55rem] tracking-[0.18em] text-muted-foreground uppercase">
                    Full photo editing
                  </span>
                  <Link
                    to="/studio/artist"
                    className="inline-flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-1 text-[0.55rem] tracking-[0.2em] text-primary-foreground uppercase shadow-lift transition-transform hover:scale-[1.03]"
                  >
                    Artist Studio
                    <span aria-hidden>›</span>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {tier !== "brand" && (
            <div className="relative mt-4 overflow-hidden rounded-[4px] border border-accent/60 bg-card/70 p-4">
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
          )}



          {/* what this studio celebrates — kept at the bottom */}
          {highlights.length > 0 && (
            <ul className="mt-6 grid gap-1.5">
              {highlights.map((h) => (
                <li
                  key={h}
                  className="text-[11px] leading-relaxed text-muted-foreground"
                >
                  {h}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
