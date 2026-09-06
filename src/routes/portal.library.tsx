import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Image as ImageIcon, Loader2, Trash2 } from "lucide-react";

import { PortalGuard } from "@/components/portal/PortalGuard";
import { PhotoPick, PhotoPlaceholder } from "@/components/PhotoField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  deleteCategory,
  deleteLibraryCollection,
  listCategories,
  listLibraryCollections,
  saveCategory,
  saveLibraryCollection,
} from "@/lib/puzzle-library.functions";
import type { LibraryCategory, LibraryCollectionSummary } from "@/lib/puzzle-library-types";

export const Route = createFileRoute("/portal/library")({
  head: () => ({
    meta: [
      { title: "Photo Library — Pictaria Project" },
      {
        name: "description",
        content: "Add puzzle collections, categories and images without a deploy.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: GuardedLibrary,
});

const labelClass = "text-[0.55rem] tracking-[0.18em] text-muted-foreground uppercase";

const emptyDraft = {
  title: "",
  tagline: "",
  categoryId: "" as string,
  free: false,
  hidden: false,
};

function Library() {
  const loadCategories = useServerFn(listCategories);
  const loadCollections = useServerFn(listLibraryCollections);
  const addCategory = useServerFn(saveCategory);
  const removeCategory = useServerFn(deleteCategory);
  const saveCollection = useServerFn(saveLibraryCollection);
  const removeCollection = useServerFn(deleteLibraryCollection);

  const [categories, setCategories] = useState<LibraryCategory[]>([]);
  const [collections, setCollections] = useState<LibraryCollectionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [newCategoryName, setNewCategoryName] = useState("");
  const [savingCategory, setSavingCategory] = useState(false);

  const [draft, setDraft] = useState(emptyDraft);
  const [cover, setCover] = useState("");
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const refresh = async () => {
    try {
      const [categoriesResult, collectionsResult] = await Promise.all([
        loadCategories({}),
        loadCollections({}),
      ]);
      setCategories(categoriesResult.categories);
      setCollections(collectionsResult.collections);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't load the library.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitCategory = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!newCategoryName.trim()) return;
    setSavingCategory(true);
    setError("");
    try {
      await addCategory({ data: { name: newCategoryName.trim() } });
      setNewCategoryName("");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "That category didn't save.");
    } finally {
      setSavingCategory(false);
    }
  };

  const destroyCategory = async (id: string) => {
    if (!window.confirm("Delete this category? Collections keep their photos but lose the tag.")) {
      return;
    }
    setError("");
    try {
      await removeCategory({ data: { id } });
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "That category didn't delete.");
    }
  };

  const pickCover = (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCover(String(reader.result));
    reader.readAsDataURL(file);
  };

  const submitCollection = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft.title.trim()) return;
    setCreating(true);
    setError("");
    try {
      await saveCollection({
        data: {
          title: draft.title.trim(),
          tagline: draft.tagline.trim(),
          categoryId: draft.categoryId || null,
          free: draft.free,
          hidden: draft.hidden,
          ...(cover ? { cover } : {}),
        },
      });
      setDraft(emptyDraft);
      setCover("");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "That collection didn't save.");
    } finally {
      setCreating(false);
    }
  };

  const destroyCollection = async (id: string) => {
    if (!window.confirm("Delete this collection and every photo in it? This can't be undone."))
      return;
    setBusyId(id);
    setError("");
    try {
      await removeCollection({ data: { id } });
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "That collection didn't delete.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <main className="min-h-screen bg-deep px-4 pt-12 pb-24">
      <header className="mx-auto max-w-2xl text-center">
        <h1 className="font-display text-[1.5rem] text-shell">Photo Library</h1>
        <p className="mt-1 text-[10px] tracking-[0.2em] text-shell/60 uppercase">
          {loading ? "opening the shelves…" : "add images, categories and collections"}
        </p>
      </header>

      {error && (
        <p className="mx-auto mt-6 max-w-2xl text-center text-[11px] text-destructive">{error}</p>
      )}

      <div className="mx-auto mt-6 max-w-2xl space-y-6">
        {/* Categories */}
        <section className="rounded-lg border border-accent/40 bg-shell/95 p-5 shadow-soft">
          <p className="text-center text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
            Categories
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {categories.map((category) => (
              <span
                key={category.id}
                className="flex items-center gap-1.5 rounded-full border border-accent/40 bg-background/60 px-3 py-1 text-[11px] text-foreground"
              >
                {category.name}
                <button
                  type="button"
                  onClick={() => void destroyCategory(category.id)}
                  aria-label={`Delete ${category.name}`}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </span>
            ))}
            {categories.length === 0 && !loading && (
              <p className="text-[11px] text-muted-foreground">No categories yet.</p>
            )}
          </div>
          <form onSubmit={submitCategory} className="mt-3 flex gap-2">
            <Input
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="New category name"
              className="flex-1"
            />
            <Button type="submit" disabled={savingCategory || !newCategoryName.trim()}>
              {savingCategory ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
            </Button>
          </form>
        </section>

        {/* Add a collection */}
        <section className="rounded-lg border border-accent/40 bg-shell/95 p-5 shadow-soft">
          <p className="text-center text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
            Add a collection
          </p>
          <form onSubmit={submitCollection} className="mt-3 space-y-3">
            <PhotoPick
              label={cover ? "Choose a different cover" : "Choose a cover photo"}
              onFiles={pickCover}
              fallbackToCamera
            >
              <span className="relative mx-auto block aspect-[3/4] w-32 overflow-hidden rounded-md border border-accent/40 bg-muted/40">
                {cover ? (
                  <img src={cover} alt="Cover preview" className="h-full w-full object-cover" />
                ) : (
                  <PhotoPlaceholder hint="Tap to choose" />
                )}
              </span>
            </PhotoPick>

            <div>
              <Label className={labelClass}>Title</Label>
              <Input
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                placeholder="e.g. Sunset Beaches"
                className="mt-1"
              />
            </div>
            <div>
              <Label className={labelClass}>Tagline</Label>
              <Textarea
                value={draft.tagline}
                onChange={(e) => setDraft({ ...draft, tagline: e.target.value })}
                rows={2}
                placeholder="A short line shown under the title"
                className="mt-1"
              />
            </div>
            <div>
              <Label className={labelClass}>Category</Label>
              <Select
                value={draft.categoryId || "none"}
                onValueChange={(value) =>
                  setDraft({ ...draft, categoryId: value === "none" ? "" : value })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="No category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No category</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-[12px] text-foreground">
                <Checkbox
                  checked={draft.free}
                  onCheckedChange={(checked) => setDraft({ ...draft, free: checked === true })}
                />
                Free to play
              </label>
              <label className="flex items-center gap-2 text-[12px] text-foreground">
                <Checkbox
                  checked={draft.hidden}
                  onCheckedChange={(checked) => setDraft({ ...draft, hidden: checked === true })}
                />
                Hidden (link only)
              </label>
            </div>
            <Button type="submit" disabled={creating || !draft.title.trim()} className="w-full">
              {creating ? "Creating…" : "Create collection"}
            </Button>
          </form>
        </section>

        {/* Existing collections */}
        <section>
          <p className="text-center text-[10px] tracking-[0.2em] text-shell/60 uppercase">
            Collections · {collections.length}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {collections.map((collection) => (
              <div
                key={collection.id}
                className="overflow-hidden rounded-[8px] border border-accent/40 bg-shell/95 shadow-soft"
              >
                <Link
                  to="/portal/library/$collectionId"
                  params={{ collectionId: collection.id }}
                  className="block"
                >
                  <span className="relative block aspect-[3/4] w-full overflow-hidden bg-muted/40">
                    {collection.cover_url ? (
                      <img
                        src={collection.cover_url}
                        alt={collection.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      </span>
                    )}
                  </span>
                  <span className="block px-2.5 py-2">
                    <span className="block truncate text-[12px] text-foreground">
                      {collection.title}
                    </span>
                    <span className="block truncate text-[9px] tracking-[0.1em] text-muted-foreground uppercase">
                      {collection.category_name ?? "No category"} · {collection.image_count} photo
                      {collection.image_count === 1 ? "" : "s"}
                    </span>
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => void destroyCollection(collection.id)}
                  disabled={busyId === collection.id}
                  className="flex w-full items-center justify-center gap-1.5 border-t border-accent/30 py-1.5 text-[10px] tracking-[0.14em] text-destructive uppercase disabled:opacity-50"
                >
                  <Trash2 className="h-3 w-3" />
                  {busyId === collection.id ? "Deleting…" : "Delete"}
                </button>
              </div>
            ))}
          </div>
          {!loading && collections.length === 0 && (
            <p className="mt-4 text-center text-[11px] text-shell/60">
              No collections yet — add one above.
            </p>
          )}
        </section>

        <div className="text-center">
          <Link
            to="/portal/new"
            className="text-[10px] tracking-[0.18em] text-shell/60 uppercase underline"
          >
            Back to Pictaria Project
          </Link>
        </div>
      </div>
    </main>
  );
}

function GuardedLibrary() {
  return (
    <PortalGuard>
      <Library />
    </PortalGuard>
  );
}
