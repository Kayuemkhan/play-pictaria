import { useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import {
  clearPuzzleNote,
  getPuzzleNote,
  savePuzzleNote,
  usePuzzleNote,
} from "@/lib/puzzle-notes";

type Props = {
  puzzleId: string;
  /** The original title, shown as a placeholder. */
  defaultTitle: string;
  /** The original write-up, shown as a placeholder. */
  defaultStory?: string;
};

/**
 * A quiet pencil under a puzzle: anyone can give the picture their own
 * title and write their own story about it. Saved on their own device.
 */
export function PuzzleNoteEditor({
  puzzleId,
  defaultTitle,
  defaultStory,
}: Props) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [story, setStory] = useState("");
  const saved = usePuzzleNote(puzzleId);
  const hasSaved = Boolean(saved.title?.trim() || saved.story?.trim());

  useEffect(() => {
    if (!open) return;
    const note = getPuzzleNote(puzzleId);
    setTitle(note.title ?? "");
    setStory(note.story ?? "");
  }, [open, puzzleId]);

  if (hasSaved) {
    return null;
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-primary/25 px-3 py-1 text-[0.66rem] tracking-[0.18em] text-muted-foreground uppercase transition-colors duration-300 hover:border-primary/50 hover:text-primary"
      >
        <Pencil aria-hidden className="h-3 w-3" />
        Make it yours
      </button>
    );
  }

  return (
    <div className="mt-3 rounded-2xl border border-primary/20 bg-card/80 p-4 text-left shadow-soft backdrop-blur-sm">
      <label className="block text-[0.62rem] tracking-[0.22em] text-muted-foreground uppercase">
        Your title
      </label>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={defaultTitle}
        className="mt-1 w-full rounded-full border border-primary/20 bg-background/70 px-4 py-2 font-display text-lg outline-none focus:border-primary/50"
      />

      <label className="mt-3 block text-[0.62rem] tracking-[0.22em] text-muted-foreground uppercase">
        Your write-up
      </label>
      <textarea
        value={story}
        onChange={(e) => setStory(e.target.value)}
        rows={5}
        placeholder={defaultStory ?? "What do you remember about this one?"}
        className="mt-1 w-full rounded-2xl border border-primary/20 bg-background/70 px-4 py-3 text-[0.84rem] leading-relaxed outline-none focus:border-primary/50"
      />
      <p className="mt-1 text-[0.62rem] text-muted-foreground/80">
        Leave a blank line between paragraphs. Saved on this device.
      </p>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => {
            savePuzzleNote(puzzleId, { title, story });
            setOpen(false);
          }}
          className="rounded-full bg-primary px-5 py-2 text-[0.7rem] tracking-[0.18em] text-primary-foreground uppercase"
        >
          Save
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-full border border-primary/25 px-5 py-2 text-[0.7rem] tracking-[0.18em] text-muted-foreground uppercase"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => {
            clearPuzzleNote(puzzleId);
            setTitle("");
            setStory("");
            setOpen(false);
          }}
          className="rounded-full px-4 py-2 text-[0.66rem] tracking-[0.14em] text-muted-foreground/70 uppercase hover:text-primary"
        >
          Use original
        </button>
      </div>
    </div>
  );
}
