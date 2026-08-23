/**
 * Puzzle notes — a reader's own titles and write-ups.
 *
 * Anyone using Pictaria can rename a puzzle and write their own story under it.
 * Notes are kept on the person's own device (localStorage), so they never need
 * an account and nothing is shared unless they choose to.
 */

import { useCallback, useEffect, useState } from "react";

const KEY = "pictaria.puzzle-notes.v1";

export type PuzzleNote = {
  /** Replaces the puzzle title when set. */
  title?: string;
  /** Replaces the story/caption paragraphs when set. */
  story?: string;
};

type NoteMap = Record<string, PuzzleNote>;

const listeners = new Set<() => void>();

function readAll(): NoteMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as NoteMap;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeAll(map: NoteMap) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(map));
  } catch {
    /* storage full or blocked — nothing we can do */
  }
  listeners.forEach((fn) => fn());
}

export function getPuzzleNote(puzzleId: string): PuzzleNote {
  return readAll()[puzzleId] ?? {};
}

export function savePuzzleNote(puzzleId: string, note: PuzzleNote) {
  const map = readAll();
  const clean: PuzzleNote = {};
  if (note.title?.trim()) clean.title = note.title.trim();
  if (note.story?.trim()) clean.story = note.story.trim();
  if (!clean.title && !clean.story) delete map[puzzleId];
  else map[puzzleId] = clean;
  writeAll(map);
}

export function clearPuzzleNote(puzzleId: string) {
  const map = readAll();
  delete map[puzzleId];
  writeAll(map);
}

/** Live note for one puzzle. Empty during SSR, fills in after hydration. */
export function usePuzzleNote(puzzleId: string) {
  const [note, setNote] = useState<PuzzleNote>({});

  const refresh = useCallback(() => {
    setNote(getPuzzleNote(puzzleId));
  }, [puzzleId]);

  useEffect(() => {
    refresh();
    listeners.add(refresh);
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) refresh();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(refresh);
      window.removeEventListener("storage", onStorage);
    };
  }, [refresh]);

  return note;
}

/** Live map of every note, for album grids. */
export function usePuzzleNotes() {
  const [notes, setNotes] = useState<NoteMap>({});

  useEffect(() => {
    const refresh = () => setNotes(readAll());
    refresh();
    listeners.add(refresh);
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) refresh();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(refresh);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return notes;
}

/** Split a written note into paragraphs for display. */
export function noteParagraphs(story: string): string[] {
  return story
    .split(/\n{2,}|\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}
