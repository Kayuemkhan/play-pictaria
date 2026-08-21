import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronLeft, Folder, Lock, Pencil, Send } from "lucide-react";
import { PhotoPick, PhotoPlaceholder } from "@/components/PhotoField";

export const Route = createFileRoute("/my-pictaria/")({
  component: MyPictaria,
});

type Share = "private" | "submitted";

type Picture = {
  id: string;
  url: string;
  title: string;
  share: Share;
  emails?: string;
};

function countEmails(value?: string) {
  return (value ?? "")
    .split(/[,\s;]+/)
    .map((s) => s.trim())
    .filter((s) => s.includes("@")).length;
}


type Gallery = {
  id: string;
  name: string;
  pictures: Picture[];
};

const STARTER: Gallery[] = [
  { id: "g1", name: "Our Wedding", pictures: [] },
  { id: "g2", name: "Baby's First Year", pictures: [] },
  { id: "g3", name: "Sunset Hike", pictures: [] },
  { id: "g4", name: "The Puppy", pictures: [] },
  { id: "g5", name: "Water Park", pictures: [] },
];

const STORE_KEY = "pictaria.my-world.preview";
const MAX_PER_GALLERY = 5;

function MyPictaria() {
  const [galleries, setGalleries] = useState<Gallery[]>(STARTER);
  const [openId, setOpenId] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<string | null>(null);

  /* names persist locally so the preview feels like your own space */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as { id: string; name: string }[];
      setGalleries((prev) =>
        prev.map((g) => ({ ...g, name: saved.find((s) => s.id === g.id)?.name ?? g.name })),
      );
    } catch {
      /* ignore */
    }
  }, []);

  const saveNames = (next: Gallery[]) => {
    try {
      localStorage.setItem(
        STORE_KEY,
        JSON.stringify(next.map(({ id, name }) => ({ id, name }))),
      );
    } catch {
      /* ignore */
    }
  };

  const update = (id: string, patch: (g: Gallery) => Gallery) => {
    setGalleries((prev) => {
      const next = prev.map((g) => (g.id === id ? patch(g) : g));
      saveNames(next);
      return next;
    });
  };

  const open = galleries.find((g) => g.id === openId) ?? null;

  const addPhotos = (gallery: Gallery, files: FileList | null) => {
    if (!files?.length) return;
    const room = MAX_PER_GALLERY - gallery.pictures.length;
    const incoming = Array.from(files)
      .slice(0, Math.max(room, 0))
      .map((file, i) => ({
        id: `${Date.now()}-${i}`,
        url: URL.createObjectURL(file),
        title: "",
        share: "private" as Share,
      }));
    update(gallery.id, (g) => ({ ...g, pictures: [...g.pictures, ...incoming] }));
  };

  return (
    <>
      {!open && (
        <>
          <div className="mt-8 space-y-3">
            {galleries.map((g) => (
              <div
                key={g.id}
                className="flex items-center gap-3 rounded-3xl border border-foreground/10 bg-white/70 px-4 py-3 shadow-sm backdrop-blur"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
                  <Folder className="h-5 w-5" strokeWidth={1.5} />
                </span>

                <div className="min-w-0 flex-1">
                  {renaming === g.id ? (
                    <input
                      autoFocus
                      value={g.name}
                      onChange={(e) =>
                        update(g.id, (gal) => ({ ...gal, name: e.target.value }))
                      }
                      onBlur={() => setRenaming(null)}
                      onKeyDown={(e) => e.key === "Enter" && setRenaming(null)}
                      className="w-full rounded-full border border-accent/40 bg-white px-3 py-1 font-display text-lg text-foreground outline-none"
                      placeholder="Name this gallery"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setRenaming(g.id)}
                      className="flex items-center gap-2 text-left"
                    >
                      <span className="truncate font-display text-xl text-foreground">
                        {g.name || "Untitled gallery"}
                      </span>
                      <Pencil className="h-3.5 w-3.5 shrink-0 text-foreground/35" strokeWidth={1.5} />
                    </button>
                  )}
                  <p className="mt-0.5 text-[0.65rem] tracking-[0.14em] text-foreground/45 uppercase">
                    {g.pictures.length} of {MAX_PER_GALLERY} pictures
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setOpenId(g.id)}
                  className="shrink-0 rounded-full border border-accent/50 px-4 py-1.5 text-xs tracking-[0.14em] text-accent uppercase"
                >
                  Open
                </button>
              </div>
            ))}
          </div>

          <p className="mt-6 text-center text-xs leading-relaxed text-foreground/50">
            Tap a gallery name to rename it — Water Park, Ohana Reunion, whatever this
            chapter is called.
          </p>
        </>
      )}

      {open && (
        <div className="mt-8">
          <button
            type="button"
            onClick={() => setOpenId(null)}
            className="flex items-center gap-1 text-xs tracking-[0.16em] text-foreground/55 uppercase"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={1.5} /> All galleries
          </button>

          <h2 className="mt-4 font-display text-3xl text-foreground">{open.name}</h2>
          <p className="mt-1 text-[0.65rem] tracking-[0.14em] text-foreground/45 uppercase">
            {open.pictures.length} of {MAX_PER_GALLERY} pictures
          </p>

          <div className="mt-5 space-y-5">
            {open.pictures.map((p) => (
              <div
                key={p.id}
                className="overflow-hidden rounded-3xl border border-foreground/10 bg-white/70 shadow-sm backdrop-blur"
              >
                <img
                  src={p.url}
                  alt={p.title || "Your picture"}
                  className="aspect-[3/4] w-full object-cover"
                  loading="lazy"
                />

                <div className="space-y-3 p-4">
                  <input
                    value={p.title}
                    onChange={(e) =>
                      update(open.id, (g) => ({
                        ...g,
                        pictures: g.pictures.map((x) =>
                          x.id === p.id ? { ...x, title: e.target.value } : x,
                        ),
                      }))
                    }
                    placeholder="Name this picture…"
                    className="w-full rounded-full border border-foreground/15 bg-white px-4 py-2 text-center font-display text-lg text-foreground outline-none placeholder:text-foreground/35 focus:border-accent/50"
                  />

                  <div className="rounded-2xl bg-accent/8 p-3">
                    <p className="text-center text-[0.6rem] tracking-[0.18em] text-foreground/50 uppercase">
                      Who can see this picture
                    </p>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          update(open.id, (g) => ({
                            ...g,
                            pictures: g.pictures.map((x) =>
                              x.id === p.id ? { ...x, share: "private" } : x,
                            ),
                          }))
                        }
                        className={`flex items-center justify-center gap-1.5 rounded-full border bg-transparent px-3 py-2 text-[0.68rem] tracking-[0.1em] uppercase transition ${
                          p.share === "private"
                            ? "border-accent/70 text-accent"
                            : "border-foreground/15 text-foreground/60"
                        }`}
                      >
                        <Lock className="h-3.5 w-3.5" strokeWidth={1.5} /> Keep private
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          update(open.id, (g) => ({
                            ...g,
                            pictures: g.pictures.map((x) =>
                              x.id === p.id ? { ...x, share: "submitted" } : x,
                            ),
                          }))
                        }
                        className={`flex items-center justify-center gap-1.5 rounded-full border bg-transparent px-3 py-2 text-[0.68rem] tracking-[0.1em] uppercase transition ${
                          p.share === "submitted"
                            ? "border-accent/70 text-accent"
                            : "border-foreground/15 text-foreground/60"
                        }`}
                      >
                        <Send className="h-3.5 w-3.5" strokeWidth={1.5} /> Make public
                      </button>
                    </div>
                    {p.share === "submitted" ? (
                      <Link
                        to="/my-pictaria/submitted"
                        className="mt-2 block text-center text-[0.68rem] leading-relaxed text-accent underline underline-offset-2"
                      >
                        Your picture has been submitted for approval to be viewed by other Pictarians in Pictaria
                      </Link>
                    ) : (
                      <p className="mt-2 text-center text-[0.68rem] leading-relaxed text-foreground/55">
                        Private to you and anyone you send the puzzle to.
                      </p>
                    )}

                    <div className="mt-3 border-t border-foreground/10 pt-3">
                      <p className="text-center text-[0.6rem] tracking-[0.18em] text-foreground/50 uppercase">
                        Send to (up to 50)
                      </p>
                      <textarea
                        value={p.emails ?? ""}
                        onChange={(e) =>
                          update(open.id, (g) => ({
                            ...g,
                            pictures: g.pictures.map((x) =>
                              x.id === p.id ? { ...x, emails: e.target.value } : x,
                            ),
                          }))
                        }
                        rows={2}
                        placeholder="friend@email.com, ohana@email.com…"
                        className="mt-2 w-full resize-none rounded-2xl border border-foreground/15 bg-white px-4 py-2 text-center text-sm text-foreground outline-none placeholder:text-foreground/35 focus:border-accent/50"
                      />
                      <p className="mt-1.5 text-center text-[0.62rem] text-foreground/50">
                        {countEmails(p.emails)} of 50 invitations
                      </p>
                      <button
                        type="button"
                        className="mx-auto mt-2 block rounded-full border border-accent/50 bg-transparent px-6 py-2 text-[0.68rem] tracking-[0.14em] text-accent uppercase"
                      >
                        Send this puzzle
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            ))}

            {open.pictures.length < MAX_PER_GALLERY && (
              <div className="overflow-hidden rounded-3xl border border-foreground/10 bg-white/60">
                <PhotoPick
                  label="Add your photograph"
                  multiple
                  onFiles={(files) => addPhotos(open, files)}
                  fallbackToCamera
                  className="block aspect-[3/4] w-full"
                >
                  <span className="relative block h-full w-full overflow-hidden">
                    <PhotoPlaceholder
                      tone="light"
                      title="Add your photograph"
                      hint={`Room for ${MAX_PER_GALLERY - open.pictures.length} more in ${open.name}`}
                    />
                  </span>
                </PhotoPick>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-10 rounded-3xl border border-accent/25 bg-white/60 p-5 text-center backdrop-blur">
        <p className="text-sm leading-relaxed text-foreground/70">
          This is a preview of the Personal Studio world. Everything you see here comes
          with the $5.95 tier — five named galleries, your own pictures, and the choice
          to keep each one private or offer it to the community.
        </p>
        <div className="mt-4 flex flex-col items-center gap-2">
          <Link
            to="/pricing"
            className="rounded-full border border-accent/50 px-6 py-2 text-xs tracking-[0.16em] text-accent uppercase"
          >
            See pricing
          </Link>
          <Link
            to="/studio/personal"
            className="flex items-center gap-1.5 text-xs tracking-[0.16em] text-foreground/55 uppercase"
          >
            Make a gallery
          </Link>

        </div>
      </div>
    </>
  );
}
