import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowDown, ArrowUp, Loader2, Trash2 } from "lucide-react";

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
  deleteLibraryCollection,
  deleteLibraryImage,
  getLibraryCollection,
  listCategories,
  reorderLibraryImages,
  saveLibraryCollection,
  saveLibraryImage,
} from "@/lib/puzzle-library.functions";
import type {
  LibraryCategory,
  LibraryCollectionDetail,
  LibraryImage,
} from "@/lib/puzzle-library-types";

export const Route = createFileRoute("/portal/library/$collectionId")({
  head: () => ({
    meta: [
      { title: "Manage collection — Pictaria Project" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: GuardedManageCollection,
});

const labelClass = "text-[0.55rem] tracking-[0.18em] text-muted-foreground uppercase";
const emptyImageDraft = { title: "", caption: "", meaning: "" };

function ManageCollection() {
  const { collectionId } = Route.useParams();
  const navigate = useNavigate();

  const loadCollection = useServerFn(getLibraryCollection);
  const loadCategories = useServerFn(listCategories);
  const saveCollection = useServerFn(saveLibraryCollection);
  const saveImage = useServerFn(saveLibraryImage);
  const removeImage = useServerFn(deleteLibraryImage);
  const reorderImages = useServerFn(reorderLibraryImages);
  const removeCollection = useServerFn(deleteLibraryCollection);

  const [collection, setCollection] = useState<LibraryCollectionDetail | null>(null);
  const [categories, setCategories] = useState<LibraryCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [cover, setCover] = useState("");
  const [savingCollection, setSavingCollection] = useState(false);

  const [newImage, setNewImage] = useState(emptyImageDraft);
  const [newPhoto, setNewPhoto] = useState("");
  const [addingImage, setAddingImage] = useState(false);
  const [busyImageId, setBusyImageId] = useState<string | null>(null);

  const refresh = async () => {
    try {
      const [collectionResult, categoriesResult] = await Promise.all([
        loadCollection({ data: { id: collectionId } }),
        loadCategories({}),
      ]);
      setCollection(collectionResult.collection);
      setCategories(categoriesResult.categories);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't load that collection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionId]);

  const pickCover = (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCover(String(reader.result));
    reader.readAsDataURL(file);
  };

  const pickNewPhoto = (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setNewPhoto(String(reader.result));
    reader.readAsDataURL(file);
  };

  const patch = <K extends keyof LibraryCollectionDetail>(
    key: K,
    value: LibraryCollectionDetail[K],
  ) => setCollection((prev) => (prev ? { ...prev, [key]: value } : prev));

  const submitCollection = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!collection) return;
    setSavingCollection(true);
    setError("");
    try {
      await saveCollection({
        data: {
          id: collection.id,
          title: collection.title,
          tagline: collection.tagline,
          categoryId: collection.category_id,
          free: collection.free,
          hidden: collection.hidden,
          ...(cover ? { cover } : {}),
        },
      });
      setCover("");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "That collection didn't save.");
    } finally {
      setSavingCollection(false);
    }
  };

  const destroy = async () => {
    if (!window.confirm("Delete this collection and every photo in it? This can't be undone.")) {
      return;
    }
    await removeCollection({ data: { id: collectionId } });
    await navigate({ to: "/portal/library" });
  };

  const submitNewImage = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!newPhoto) {
      setError("Choose a photo first.");
      return;
    }
    setAddingImage(true);
    setError("");
    try {
      await saveImage({
        data: {
          collectionId,
          title: newImage.title.trim(),
          caption: newImage.caption.trim(),
          meaning: newImage.meaning.trim(),
          photo: newPhoto,
        },
      });
      setNewImage(emptyImageDraft);
      setNewPhoto("");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "That photo didn't save.");
    } finally {
      setAddingImage(false);
    }
  };

  const updateImageField = (id: string, key: keyof LibraryImage, value: string) => {
    setCollection((prev) =>
      prev
        ? {
            ...prev,
            images: prev.images.map((image) =>
              image.id === id ? { ...image, [key]: value } : image,
            ),
          }
        : prev,
    );
  };

  const saveImageFields = async (image: LibraryImage) => {
    setBusyImageId(image.id);
    setError("");
    try {
      await saveImage({
        data: {
          id: image.id,
          collectionId,
          title: image.title,
          caption: image.caption,
          meaning: image.meaning,
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "That photo didn't save.");
    } finally {
      setBusyImageId(null);
    }
  };

  const destroyImage = async (id: string) => {
    if (!window.confirm("Delete this photo?")) return;
    setBusyImageId(id);
    setError("");
    try {
      await removeImage({ data: { id } });
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "That photo didn't delete.");
    } finally {
      setBusyImageId(null);
    }
  };

  const move = async (index: number, direction: -1 | 1) => {
    if (!collection) return;
    const target = index + direction;
    if (target < 0 || target >= collection.images.length) return;
    const reordered = [...collection.images];
    const [item] = reordered.splice(index, 1);
    reordered.splice(target, 0, item!);
    setCollection({ ...collection, images: reordered });
    try {
      await reorderImages({
        data: { collectionId, orderedIds: reordered.map((image) => image.id) },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "That order didn't save.");
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-deep">
        <Loader2 className="h-6 w-6 animate-spin text-shell/60" />
      </main>
    );
  }

  if (!collection) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-deep text-center text-shell">
        <p className="text-[12px]">That collection doesn&apos;t exist anymore.</p>
        <Link to="/portal/library" className="text-[11px] underline">
          Back to Photo Library
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-deep px-4 pt-12 pb-24">
      <header className="mx-auto max-w-2xl text-center">
        <h1 className="font-display text-[1.5rem] text-shell">{collection.title}</h1>
        <p className="mt-1 text-[10px] tracking-[0.2em] text-shell/60 uppercase">
          {collection.images.length} photo{collection.images.length === 1 ? "" : "s"}
        </p>
      </header>

      {error && (
        <p className="mx-auto mt-6 max-w-2xl text-center text-[11px] text-destructive">{error}</p>
      )}

      <div className="mx-auto mt-6 max-w-2xl space-y-6">
        {/* Collection details */}
        <section className="rounded-lg border border-accent/40 bg-shell/95 p-5 shadow-soft">
          <p className="text-center text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
            Collection details
          </p>
          <form onSubmit={submitCollection} className="mt-3 space-y-3">
            <PhotoPick label="Choose a different cover" onFiles={pickCover} fallbackToCamera>
              <span className="relative mx-auto block aspect-[3/4] w-32 overflow-hidden rounded-md border border-accent/40 bg-muted/40">
                <img
                  src={cover || collection.cover_url}
                  alt={collection.title}
                  className="h-full w-full object-cover"
                />
                {!cover && !collection.cover_url && <PhotoPlaceholder hint="Tap to choose" />}
              </span>
            </PhotoPick>
            <div>
              <Label className={labelClass}>Title</Label>
              <Input
                value={collection.title}
                onChange={(e) => patch("title", e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label className={labelClass}>Tagline</Label>
              <Textarea
                value={collection.tagline}
                onChange={(e) => patch("tagline", e.target.value)}
                rows={2}
                className="mt-1"
              />
            </div>
            <div>
              <Label className={labelClass}>Category</Label>
              <Select
                value={collection.category_id ?? "none"}
                onValueChange={(value) => patch("category_id", value === "none" ? null : value)}
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
                  checked={collection.free}
                  onCheckedChange={(checked) => patch("free", checked === true)}
                />
                Free to play
              </label>
              <label className="flex items-center gap-2 text-[12px] text-foreground">
                <Checkbox
                  checked={collection.hidden}
                  onCheckedChange={(checked) => patch("hidden", checked === true)}
                />
                Hidden (link only)
              </label>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={savingCollection} className="flex-1">
                {savingCollection ? "Saving…" : "Save changes"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => void destroy()}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </section>

        {/* Add a photo */}
        <section className="rounded-lg border border-accent/40 bg-shell/95 p-5 shadow-soft">
          <p className="text-center text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
            Add a photo
          </p>
          <form onSubmit={submitNewImage} className="mt-3 space-y-3">
            <PhotoPick label="Choose a photo" onFiles={pickNewPhoto} fallbackToCamera>
              <span className="relative mx-auto block aspect-[3/4] w-32 overflow-hidden rounded-md border border-accent/40 bg-muted/40">
                {newPhoto ? (
                  <img
                    src={newPhoto}
                    alt="New photo preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <PhotoPlaceholder hint="Tap to choose" />
                )}
              </span>
            </PhotoPick>
            <Input
              value={newImage.title}
              onChange={(e) => setNewImage({ ...newImage, title: e.target.value })}
              placeholder="Title (defaults to the collection title)"
            />
            <Input
              value={newImage.caption}
              onChange={(e) => setNewImage({ ...newImage, caption: e.target.value })}
              placeholder="Caption shown under the puzzle"
            />
            <Input
              value={newImage.meaning}
              onChange={(e) => setNewImage({ ...newImage, meaning: e.target.value })}
              placeholder="Optional tagline (e.g. what a name means)"
            />
            <Button type="submit" disabled={addingImage || !newPhoto} className="w-full">
              {addingImage ? "Adding…" : "Add photo"}
            </Button>
          </form>
        </section>

        {/* Photos */}
        <section>
          <p className="text-center text-[10px] tracking-[0.2em] text-shell/60 uppercase">
            Photos in this collection
          </p>
          <div className="mt-4 space-y-3">
            {collection.images.map((image, index) => (
              <div
                key={image.id}
                className="flex gap-3 rounded-lg border border-accent/40 bg-shell/95 p-3 shadow-soft"
              >
                <img
                  src={image.image_url}
                  alt={image.title}
                  className="h-24 w-20 shrink-0 rounded-md object-cover"
                />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <Input
                    value={image.title}
                    onChange={(e) => updateImageField(image.id, "title", e.target.value)}
                    onBlur={() => void saveImageFields(image)}
                    placeholder="Title"
                    className="h-8 text-[12px]"
                  />
                  <Input
                    value={image.caption}
                    onChange={(e) => updateImageField(image.id, "caption", e.target.value)}
                    onBlur={() => void saveImageFields(image)}
                    placeholder="Caption"
                    className="h-8 text-[12px]"
                  />
                </div>
                <div className="flex shrink-0 flex-col items-center justify-between gap-1">
                  <button
                    type="button"
                    onClick={() => void move(index, -1)}
                    disabled={index === 0}
                    aria-label="Move up"
                    className="text-muted-foreground disabled:opacity-30"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  {busyImageId === image.id ? (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  ) : (
                    <button
                      type="button"
                      onClick={() => void destroyImage(image.id)}
                      aria-label="Delete photo"
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => void move(index, 1)}
                    disabled={index === collection.images.length - 1}
                    aria-label="Move down"
                    className="text-muted-foreground disabled:opacity-30"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            {collection.images.length === 0 && (
              <p className="text-center text-[11px] text-shell/60">
                No photos yet — add one above.
              </p>
            )}
          </div>
        </section>

        <div className="text-center">
          <Link
            to="/portal/library"
            className="text-[10px] tracking-[0.18em] text-shell/60 uppercase underline"
          >
            Back to Photo Library
          </Link>
        </div>
      </div>
    </main>
  );
}

function GuardedManageCollection() {
  return (
    <PortalGuard>
      <ManageCollection />
    </PortalGuard>
  );
}
