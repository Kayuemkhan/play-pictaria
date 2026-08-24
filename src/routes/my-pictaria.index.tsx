import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronLeft, Folder, Lock, Pencil, Plus, Send } from "lucide-react";
import { PhotoPick, PhotoPlaceholder } from "@/components/PhotoField";

export const Route = createFileRoute("/my-pictaria/")({
  component: MyPictaria,
});

type Share = "private" | "submitted";

type Picture = {
  id: string;
  url: string;
  title: string;
  story?: string;
  share: Share;
  emails?: string;
};

type Album = {
  id: string;
  name: string;
  pictures: Picture[];
};

const PERSONAL_STARTER: Album[] = [
  { id: "g1", name: "Our Wedding", pictures: [] },
  { id: "g2", name: "Baby's First Year", pictures: [] },
  { id: "g3", name: "Sunset Hike", pictures: [] },
  { id: "g4", name: "The Puppy", pictures: [] },
  { id: "g5", name: "Water Park", pictures: [] },
];

const ARTIST_STARTER: Album[] = [
  { id: "a1", name: "Food Truck", pictures: [] },
  { id: "a2", name: "Date Night", pictures: [] },
  { id: "a3", name: "Coconuts Restaurant", pictures: [] },
  { id: "a4", name: "Girls' Night", pictures: [] },
  { id: "a5", name: "Baby's Birthday", pictures: [] },
  { id: "a6", name: "Reggae Night", pictures: [] },
  { id: "a7", name: "Brewery Tour", pictures: [] },
  { id: "a8", name: "Sunset Picnic", pictures: [] },
  { id: "a9", name: "Live Music on the Lawn", pictures: [] },
];

const BRAND_STARTER: Album[] = [
  { id: "b1", name: "Welcome to the Resort", pictures: [] },
  { id: "b2", name: "Today's Special", pictures: [] },
  { id: "b3", name: "Behind the Bar", pictures: [] },
  { id: "b4", name: "Our Team", pictures: [] },
  { id: "b5", name: "Sunset at the Property", pictures: [] },
  { id: "b6", name: "Guest Favorites", pictures: [] },
  { id: "b7", name: "New This Season", pictures: [] },
  { id: "b8", name: "Thank You Notes", pictures: [] },
];

const STORE_KEY_PREFIX = "pictaria.my-world.preview";
const MAX_PER_ALBUM = 5;

function MyPictaria() {
  const search = useSearch({ from: "/my-pictaria/" }) as { tier?: string };
  const tier =
    search.tier === "artist" ? "artist" : search.tier === "brand" ? "brand" : "personal";
  const starter =
    tier === "artist" ? ARTIST_STARTER : tier === "brand" ? BRAND_STARTER : PERSONAL_STARTER;
  const studioLink =
    tier === "artist" ? "/studio/artist" : tier === "brand" ? "/studio/brand" : "/studio/personal";
  const maxAlbums = tier === "personal" ? 5 : tier === "artist" ? 20 : Infinity;
  const storeKey = `${STORE_KEY_PREFIX}.${tier}`;

  const [albums, setAlbums] = useState<Album[]>(starter);
  const [openId, setOpenId] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<string | null>(null);

  /* names persist locally so the preview feels like your own space */
  useEffect(() => {
    setAlbums(starter);
    try {
      const raw = localStorage.getItem(storeKey);
      if (!raw) return;
      const saved = JSON.parse(raw) as { id: string; name: string }[];
      setAlbums((prev) =>
        prev.map((g) => ({ ...g, name: saved.find((s) => s.id === g.id)?.name ?? g.name })),
      );
    } catch {
      /* ignore */
    }
  }, [tier, starter, storeKey]);

  const addAlbum = () => {
    const fresh: Album = { id: `${tier}-${Date.now()}`, name: "", pictures: [] };
    setAlbums((prev) => {
      if (prev.length >= maxAlbums) return prev;
      const next = [...prev, fresh];
      saveNames(next);
      setRenaming(fresh.id);
      return next;
    });
  };

  const saveNames = (next: Album[]) => {
    try {
      localStorage.setItem(
        storeKey,
        JSON.stringify(next.map(({ id, name }) => ({ id, name }))),
      );
    } catch {
      /* ignore */
    }
  };

  const update = (id: string, patch: (g: Album) => Album) => {
    setAlbums((prev) => {
      const next = prev.map((g) => (g.id === id ? patch(g) : g));
      saveNames(next);
      return next;
    });
  };

  const open = albums.find((g) => g.id === openId) ?? null;

  const addPhotos = (album: Album, files: FileList | null) => {
    if (!files?.length) return;
    const room = MAX_PER_ALBUM - album.pictures.length;
    const incoming = Array.from(files)
      .slice(0, Math.max(room, 0))
      .map((file, i) => ({
        id: `${Date.now()}-${i}`,
        url: URL.createObjectURL(file),
        title: "",
        share: "private" as Share,
      }));
    update(album.id, (g) => ({ ...g, pictures: [...g.pictures, ...incoming] }));
  };

  return (
    <>
      {!open && (
        <>
          <div className="mt-8 space-y-3">
            {albums.map((g) => (
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
                      placeholder="Name this album"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setRenaming(g.id)}
                      className="flex items-center gap-2 text-left"
                    >
                      <span className="truncate font-display text-xl text-foreground">
                        {g.name || "Untitled album"}
                      </span>
                      <Pencil className="h-3.5 w-3.5 shrink-0 text-foreground/35" strokeWidth={1.5} />
                    </button>
                  )}
                  <p className="mt-0.5 text-[0.65rem] tracking-[0.14em] text-foreground/60 uppercase">
                    {g.pictures.length} of {MAX_PER_ALBUM} pictures
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

          {albums.length < maxAlbums && (
            <button
              type="button"
              onClick={addAlbum}
              className="mt-4 flex h-10 w-full items-center justify-center gap-1.5 rounded-full border border-teal-600/40 bg-transparent px-4 text-[0.68rem] tracking-[0.14em] text-teal-700 uppercase transition hover:border-teal-600"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={1.5} /> Add another album
            </button>
          )}

          <p className="mt-6 text-center text-xs leading-relaxed text-foreground/50">
            Tap a album name to rename it — Water Park, Ohana Reunion, whatever this
            chapter is called.
            {maxAlbums !== Infinity
              ? ` You have room for ${maxAlbums} albums.`
              : " Add as many albums as you like."}
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
            <ChevronLeft className="h-4 w-4" strokeWidth={1.5} /> All albums
          </button>

          <h2 className="mt-4 font-display text-3xl text-foreground">{open.name}</h2>
          <p className="mt-1 text-[0.65rem] tracking-[0.14em] text-foreground/60 uppercase">
            {open.pictures.length} of {MAX_PER_ALBUM} pictures
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
                    className="w-full rounded-full border border-foreground/15 bg-white px-4 py-2 text-center font-display text-lg text-foreground outline-none placeholder:text-foreground/55 focus:border-accent/50"
                  />

                  <textarea
                    value={p.story ?? ""}
                    onChange={(e) =>
                      update(open.id, (g) => ({
                        ...g,
                        pictures: g.pictures.map((x) =>
                          x.id === p.id ? { ...x, story: e.target.value } : x,
                        ),
                      }))
                    }
                    rows={2}
                    placeholder="Tell the story of this photo…"
                    className="w-full resize-none rounded-2xl border border-foreground/15 bg-white px-4 py-2 text-center text-sm text-foreground outline-none placeholder:text-foreground/55 focus:border-teal-600/50"
                  />

                  <div className="rounded-2xl bg-accent/8 p-3">
                    <div className="grid grid-cols-2 gap-2">
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
                        className={`flex h-10 items-center justify-center gap-1.5 rounded-full border bg-transparent px-3 text-[0.68rem] tracking-[0.1em] uppercase transition ${
                          p.share === "private"
                            ? "border-teal-600 text-teal-700"
                            : "border-teal-600/40 text-teal-700/70"
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
                        className={`flex h-10 items-center justify-center gap-1.5 rounded-full border bg-transparent px-3 text-[0.68rem] tracking-[0.1em] uppercase transition ${
                          p.share === "submitted"
                            ? "border-teal-600 text-teal-700"
                            : "border-teal-600/40 text-teal-700/70"
                        }`}
                      >
                        <Send className="h-3.5 w-3.5" strokeWidth={1.5} /> Make public
                      </button>
                    </div>
                    {p.share === "submitted" && (
                      <Link
                        to="/my-pictaria/submitted"
                        className="mt-2 block text-center text-[0.68rem] leading-relaxed text-teal-700 underline underline-offset-2"
                      >
                        Your picture has been submitted for approval to be viewed by other Pictarians in Pictaria
                      </Link>
                    )}

                    <div className="mt-3 border-t border-foreground/10 pt-3">
                      <p className="text-center text-[0.6rem] tracking-[0.18em] text-teal-700/70 uppercase">
                        Send to friends (up to 50)
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
                        className="mt-2 w-full resize-none rounded-2xl border border-foreground/15 bg-white px-4 py-2 text-center text-sm text-foreground outline-none placeholder:text-foreground/55 focus:border-teal-600/50"
                      />
                      <button
                        type="button"
                        className="mt-3 flex h-10 w-full items-center justify-center rounded-full border border-teal-600/40 bg-transparent px-3 text-[0.68rem] tracking-[0.1em] text-teal-700 uppercase transition"
                      >
                        Send this puzzle
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            ))}

            {open.pictures.length < MAX_PER_ALBUM && (
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
                      hint={`Room for ${MAX_PER_ALBUM - open.pictures.length} more in ${open.name}`}
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
          {tier === "artist"
            ? "This is a preview of the Artist Studio world. Everything you see here comes with the $9.95 tier — up to 20 albums, full photo editing, and the choice to keep each picture private or share it with the community."
            : tier === "brand"
              ? "This is a preview of the Brand Studio world. Everything you see here comes with the $195 tier — unlimited branded albums, your logo and action buttons, tracked links, and the choice to keep each picture private or share it publicly."
              : "This is a preview of the Personal Studio world. Everything you see here comes with the $5.95 tier — five named albums, your own pictures, and the choice to keep each one private or offer it to the community."}
        </p>
        <div className="mt-4 flex flex-col items-center gap-2">
          <Link
            to={studioLink}
            className="inline-flex items-center gap-1.5 rounded-full border border-teal-600/40 bg-transparent px-6 py-2 text-xs tracking-[0.16em] text-teal-700 uppercase transition hover:border-teal-600"
          >
            Start my album
            <span aria-hidden>›</span>
          </Link>
        </div>
      </div>
    </>
  );
}
