import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useNavigate } from "@tanstack/react-router";
import { Mic, Square, Camera, Loader2, Trash2, Link2, Copy, Check, Image as ImageIcon } from "lucide-react";

import {
  PORTAL_CATEGORIES,
  PORTAL_FIELD_LABELS,
  PORTAL_STATUSES,
  emptyPortalFields,
  type PortalCategory,
  type PortalFields,
  type PortalRecord,
  type PortalStatus,
} from "@/lib/portal-types";
import {
  createPortalShareLink,
  deletePortalBusiness,
  organisePortalNote,
  savePortalBusiness,
} from "@/lib/portal.functions";
import type { WavRecorder } from "@/lib/wav-recorder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Props = { record?: PortalRecord };

const LONG_FIELDS: (keyof PortalFields)[] = [
  "product_service",
  "marketing_ideas",
  "story_ideas",
  "follow_up",
  "notes",
];

const SHORT_FIELDS: { key: keyof PortalFields; label: string; type?: string }[] = [
  { key: "company_name", label: "Company name" },
  { key: "contact_person", label: "Contact person" },
  { key: "phone", label: "Phone number", type: "tel" },
  { key: "email", label: "Email address", type: "email" },
  { key: "website", label: "Website" },
];

const LONG_LABELS: Record<string, string> = {
  product_service: "Product or service featured",
  marketing_ideas: "Marketing ideas",
  story_ideas: "Story ideas for the Pictaria",
  follow_up: "Follow-up reminder",
  notes: "General notes",
};

const labelClass =
  "text-[0.55rem] tracking-[0.18em] text-muted-foreground uppercase";

export function BusinessEditor({ record }: Props) {
  const navigate = useNavigate();
  const save = useServerFn(savePortalBusiness);
  const organise = useServerFn(organisePortalNote);
  const remove = useServerFn(deletePortalBusiness);
  const makeLink = useServerFn(createPortalShareLink);

  const [fields, setFields] = useState<PortalFields>(() =>
    record
      ? {
          company_name: record.company_name,
          contact_person: record.contact_person,
          phone: record.phone,
          email: record.email,
          website: record.website,
          category: record.category,
          product_service: record.product_service,
          marketing_ideas: record.marketing_ideas,
          story_ideas: record.story_ideas,
          follow_up: record.follow_up,
          notes: record.notes,
          transcript: record.transcript,
          status: record.status,
        }
      : emptyPortalFields(),
  );
  const [photo, setPhoto] = useState("");
  const [photoUrl, setPhotoUrl] = useState(record?.photo_url ?? "");
  const [recording, setRecording] = useState(false);
  const [organising, setOrganising] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(false);
  const [shareCode, setShareCode] = useState(record?.share_code ?? "");
  const [linking, setLinking] = useState(false);
  const [copied, setCopied] = useState(false);
  const recorder = useRef<WavRecorder | null>(null);
  const cameraInput = useRef<HTMLInputElement>(null);
  const libraryInput = useRef<HTMLInputElement>(null);

  const set = <K extends keyof PortalFields>(key: K, value: PortalFields[K]) =>
    setFields((prev) => ({ ...prev, [key]: value }));

  const pickPhoto = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result);
      setPhoto(url);
      setPhotoUrl(url);
      if (fields.status === "New") set("status", "Photo Collected");
      input.value = "";
    };
    reader.readAsDataURL(file);
  };


  const startRecording = async () => {
    setError("");
    try {
      const { startWavRecording } = await import("@/lib/wav-recorder");
      recorder.current = await startWavRecording();
      setRecording(true);
    } catch {
      setError("Microphone access is needed to record a voice note.");
    }
  };

  const stopRecording = async () => {
    const active = recorder.current;
    if (!active) return;
    recorder.current = null;
    setRecording(false);
    setOrganising(true);
    setError("");
    try {
      const audio = await active.stop();
      const { transcript, fields: organised } = await organise({ data: { audio } });
      setFields((prev) => {
        const next = { ...prev };
        for (const [key, value] of Object.entries(organised)) {
          if (typeof value === "string" && value.trim()) {
            (next as Record<string, string>)[key] = value.trim();
          }
        }
        next.transcript = [prev.transcript, transcript].filter(Boolean).join("\n\n");
        return next;
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "That note couldn't be organised.",
      );
    } finally {
      setOrganising(false);
    }
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const { id } = await save({
        data: { ...fields, ...(record ? { id: record.id } : {}), ...(photo ? { photo } : {}) },
      });
      void id;
      await navigate({ to: "/portal" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "That record couldn't be saved.");
      setSaving(false);
    }
  };

  const shareUrl = shareCode
    ? `${typeof window === "undefined" ? "https://play-pictaria.lovable.app" : window.location.origin}/p/${shareCode}`
    : "";

  const generateLink = async () => {
    if (!record) return;
    setLinking(true);
    setError("");
    try {
      const { code } = await makeLink({ data: { id: record.id } });
      setShareCode(code);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "That link couldn't be created.",
      );
    } finally {
      setLinking(false);
    }
  };

  const copyLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Copying isn't allowed here — press and hold the link instead.");
    }
  };

  const destroy = async () => {
    if (!record) return;
    if (!window.confirm("Delete this business record?")) return;
    await remove({ data: { id: record.id } });
    await navigate({ to: "/portal" });
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      {cameraOpen && (
        <CameraCapture
          onClose={() => setCameraOpen(false)}
          onCapture={(url) => {
            setPhoto(url);
            setPhotoUrl(url);
            if (fields.status === "New") set("status", "Photo Collected");
          }}
        />
      )}
      {/* Photograph */}
      <section className="rounded-lg border border-accent/50 bg-shell p-4 shadow-soft">
        <button
          type="button"
          onClick={() => setCameraOpen(true)}
          className="relative block w-full overflow-hidden rounded-md border border-accent/40 bg-muted/40"
          style={{ aspectRatio: "3 / 4" }}
        >
          {photoUrl ? (
            <img src={photoUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
              <Camera className="h-7 w-7" />
              <span className="text-[10px] tracking-[0.18em] uppercase">
                Take the photo
              </span>
            </span>
          )}
        </button>
        <div className="mt-3 flex items-center gap-2">
          <Button
            type="button"
            onClick={() => setCameraOpen(true)}
            className="flex-1 rounded-full bg-primary text-[0.55rem] tracking-[0.2em] text-primary-foreground uppercase"
          >
            <Camera className="mr-1.5 h-3.5 w-3.5" />
            Open camera
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => libraryInput.current?.click()}
            className="flex-1 rounded-full text-[0.55rem] tracking-[0.2em] uppercase"
          >
            <ImageIcon className="mr-1.5 h-3.5 w-3.5" />
            Choose photo
          </Button>
        </div>
        <input
          ref={libraryInput}
          type="file"
          accept="image/*"
          onChange={pickPhoto}
          className="hidden"
        />
      </section>



      {/* Share link */}
      {record && (
        <section className="rounded-lg border border-accent/50 bg-shell p-4 shadow-soft">
          <p className={labelClass}>Share link for this community Pictaria</p>
          {shareCode ? (
            <>
              <p className="mt-2 rounded-md border border-accent/40 bg-muted/40 px-3 py-2 text-[12px] break-all text-foreground">
                {shareUrl}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <Button
                  type="button"
                  onClick={copyLink}
                  className="flex-1 rounded-full bg-primary text-[0.55rem] tracking-[0.2em] text-primary-foreground uppercase"
                >
                  {copied ? (
                    <Check className="mr-1.5 h-3.5 w-3.5" />
                  ) : (
                    <Copy className="mr-1.5 h-3.5 w-3.5" />
                  )}
                  {copied ? "Copied" : "Copy link"}
                </Button>
                <a
                  href={shareUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-accent/50 px-4 py-2 text-[0.55rem] tracking-[0.2em] text-foreground uppercase"
                >
                  Open
                </a>
              </div>
              <p className="mt-2 text-[11px] leading-snug text-muted-foreground">
                Send this to the business for their socials and customer base —
                it opens their photo as a playable Pictaria.
              </p>
            </>
          ) : (
            <>
              <p className="mt-1.5 text-[12px] leading-snug text-muted-foreground">
                Turn the saved photograph into a shareable Pictaria link they can
                post right away.
              </p>
              <Button
                type="button"
                onClick={generateLink}
                disabled={linking}
                className="mt-3 w-full rounded-full bg-primary text-[0.55rem] tracking-[0.2em] text-primary-foreground uppercase disabled:opacity-60"
              >
                {linking ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Link2 className="mr-1.5 h-3.5 w-3.5" />
                )}
                {linking ? "Creating link…" : "Create share link"}
              </Button>
            </>
          )}
        </section>
      )}

      {/* Voice note */}
      <section className="rounded-lg border border-accent/50 bg-shell p-4 text-center shadow-soft">
        <p className={labelClass}>Voice note</p>
        <p className="mt-1.5 text-[12px] leading-snug text-muted-foreground">
          Speak naturally for 30–60 seconds. Everything you say is sorted into the
          fields below.
        </p>
        <Button
          type="button"
          onClick={recording ? stopRecording : startRecording}
          disabled={organising}
          className={`mx-auto mt-4 flex h-16 w-16 items-center justify-center rounded-full shadow-lift ${
            recording ? "bg-destructive" : "bg-primary"
          } text-primary-foreground`}
        >
          {organising ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : recording ? (
            <Square className="h-5 w-5" />
          ) : (
            <Mic className="h-6 w-6" />
          )}
        </Button>
        <p className="mt-2 text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
          {organising
            ? "Organising your note…"
            : recording
              ? "Listening — tap to finish"
              : "Tap to record"}
        </p>
        {fields.transcript && (
          <details className="mt-3 text-left">
            <summary className="cursor-pointer text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
              Transcript
            </summary>
            <p className="mt-2 text-[12px] leading-relaxed whitespace-pre-wrap text-foreground">
              {fields.transcript}
            </p>
          </details>
        )}
      </section>

      {error && (
        <p className="text-[12px] text-destructive" role="alert">
          {error}
        </p>
      )}

      {/* Fields */}
      <section className="space-y-4 rounded-lg border border-accent/50 bg-shell p-4 shadow-soft">
        {SHORT_FIELDS.map(({ key, label, type }) => (
          <div key={key}>
            <Label htmlFor={key} className={labelClass}>
              {label}
            </Label>
            <Input
              id={key}
              type={type ?? "text"}
              value={String(fields[key])}
              onChange={(event) => set(key, event.target.value as never)}
              className="mt-1.5"
            />
          </div>
        ))}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="category" className={labelClass}>
              Category
            </Label>
            <select
              id="category"
              value={fields.category}
              onChange={(event) => set("category", event.target.value as PortalCategory)}
              className="mt-1.5 h-9 w-full rounded-md border border-input bg-background px-2 text-[13px] text-foreground"
            >
              {PORTAL_CATEGORIES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="status" className={labelClass}>
              Status
            </Label>
            <select
              id="status"
              value={fields.status}
              onChange={(event) => set("status", event.target.value as PortalStatus)}
              className="mt-1.5 h-9 w-full rounded-md border border-input bg-background px-2 text-[13px] text-foreground"
            >
              {PORTAL_STATUSES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        {LONG_FIELDS.map((key) => (
          <div key={key}>
            <Label htmlFor={key} className={labelClass}>
              {LONG_LABELS[key]}
            </Label>
            <Textarea
              id={key}
              rows={key === "follow_up" ? 2 : 4}
              value={String(fields[key])}
              onChange={(event) => set(key, event.target.value as never)}
              className="mt-1.5"
            />
          </div>
        ))}
      </section>

      {/* AI preview */}
      {preview && (
        <section className="space-y-3 rounded-lg border border-accent/50 bg-shell p-4 shadow-soft">
          <p className={labelClass}>Preview — how the note was organised</p>
          {photoUrl && (
            <img
              src={photoUrl}
              alt=""
              className="w-24 rounded-md border border-accent/40 object-cover"
              style={{ aspectRatio: "3 / 4" }}
            />
          )}
          <dl className="space-y-2.5">
            <div>
              <dt className={labelClass}>Category</dt>
              <dd className="text-[13px] text-foreground">{fields.category}</dd>
            </div>
            <div>
              <dt className={labelClass}>Status</dt>
              <dd className="text-[13px] text-foreground">{fields.status}</dd>
            </div>
            {Object.entries(PORTAL_FIELD_LABELS).map(([key, label]) => (
              <div key={key}>
                <dt className={labelClass}>{label}</dt>
                <dd className="text-[13px] leading-relaxed whitespace-pre-wrap text-foreground">
                  {String((fields as Record<string, unknown>)[key] ?? "").trim() ||
                    "—"}
                </dd>
              </div>
            ))}
          </dl>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setPreview(false)}
            className="text-[0.55rem] tracking-[0.2em] uppercase"
          >
            Back to editing
          </Button>
        </section>
      )}

      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => setPreview((value) => !value)}
          className="rounded-full text-[0.55rem] tracking-[0.2em] uppercase"
        >
          {preview ? "Hide preview" : "Preview"}
        </Button>
        <Button
          type="submit"
          disabled={saving || organising}
          className="flex-1 rounded-full bg-primary text-[0.55rem] tracking-[0.2em] text-primary-foreground uppercase shadow-lift disabled:opacity-60"
        >
          {saving ? "Saving…" : record ? "Save changes" : "Save business"}
        </Button>
        {record && (
          <Button
            type="button"
            variant="ghost"
            onClick={destroy}
            className="text-muted-foreground"
            aria-label="Delete record"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </form>
  );
}
