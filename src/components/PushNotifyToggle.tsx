import { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";

import {
  getPushKey,
  removePushSubscription,
  savePushSubscription,
} from "@/lib/push.functions";

const WORKER_URL = "/pictaria-push-sw.js";

type Status =
  | "checking"
  | "unsupported"
  | "add-to-home"
  | "off"
  | "on"
  | "blocked"
  | "working";

function urlBase64ToUint8Array(base64: string) {
  const padded = base64.replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(padded + "=".repeat((4 - (padded.length % 4)) % 4));
  return Uint8Array.from(raw, (char) => char.charCodeAt(0));
}

function isIos() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

/**
 * "Send it to my phone" switch. Notifications arrive as a banner at the top of
 * the phone's screen (and on the lock screen), even when Pictaria is closed.
 */
export function PushNotifyToggle() {
  const [status, setStatus] = useState<Status>("checking");
  const [error, setError] = useState("");
  const loadKey = useServerFn(getPushKey);
  const save = useServerFn(savePushSubscription);
  const remove = useServerFn(removePushSubscription);

  useEffect(() => {
    let cancelled = false;

    const detect = async () => {
      const supported =
        "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
      const standalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (navigator as { standalone?: boolean }).standalone === true;

      if (!supported) {
        // iPhones only expose push once Pictaria lives on the home screen.
        if (!cancelled) setStatus(isIos() && !standalone ? "add-to-home" : "unsupported");
        return;
      }
      if (Notification.permission === "denied") {
        if (!cancelled) setStatus("blocked");
        return;
      }

      const registration = await navigator.serviceWorker.getRegistration(WORKER_URL);
      const existing = await registration?.pushManager.getSubscription();
      if (!cancelled) setStatus(existing ? "on" : "off");
    };

    void detect();
    return () => {
      cancelled = true;
    };
  }, []);

  const turnOn = async () => {
    setError("");
    setStatus("working");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus(permission === "denied" ? "blocked" : "off");
        return;
      }

      const { publicKey } = await loadKey({});
      const registration = await navigator.serviceWorker.register(WORKER_URL, { scope: "/" });
      await navigator.serviceWorker.ready;

      const subscription =
        (await registration.pushManager.getSubscription()) ??
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        }));

      const json = subscription.toJSON() as {
        endpoint?: string;
        keys?: { p256dh?: string; auth?: string };
      };
      if (!json.endpoint || !json.keys?.p256dh || !json.keys.auth) {
        throw new Error("This phone didn't hand us a notification address.");
      }

      await save({
        data: {
          endpoint: json.endpoint,
          p256dh: json.keys.p256dh,
          auth: json.keys.auth,
          userAgent: navigator.userAgent.slice(0, 400),
        },
      });
      setStatus("on");
    } catch (cause) {
      console.error(cause);
      setError(cause instanceof Error ? cause.message : "That didn't work — please try again.");
      setStatus("off");
    }
  };

  const turnOff = async () => {
    setStatus("working");
    try {
      const registration = await navigator.serviceWorker.getRegistration(WORKER_URL);
      const subscription = await registration?.pushManager.getSubscription();
      if (subscription) {
        await remove({ data: { endpoint: subscription.endpoint } });
        await subscription.unsubscribe();
      }
      setStatus("off");
    } catch (cause) {
      console.error(cause);
      setStatus("on");
    }
  };

  return (
    <div className="rounded-[6px] border border-accent/40 bg-deep/50 p-6 text-center backdrop-blur-sm">
      <h2 className="font-display text-lg text-shell">A telegram from Pictaria</h2>
      <p className="mx-auto mt-3 max-w-md text-[0.85rem] leading-relaxed text-shell/80">
        Every so often word arrives from Pictaria — “Telegram from Pictaria ·
        From Oceanic Aquarium.” It appears at the top of your phone screen, and
        nowhere else.
      </p>

      {status === "add-to-home" && (
        <p className="mt-5 text-[0.75rem] leading-relaxed text-shell/70">
          On iPhone, tap Share then <span className="text-accent">Add to Home Screen</span> first —
          then open Pictaria from your home screen and this button will appear.
        </p>
      )}

      {status === "unsupported" && (
        <p className="mt-5 text-[0.75rem] leading-relaxed text-shell/70">
          This browser doesn’t hand out notifications yet. Try Pictaria in Safari
          or Chrome on your phone.
        </p>
      )}

      {status === "blocked" && (
        <p className="mt-5 text-[0.75rem] leading-relaxed text-shell/70">
          Notifications are switched off for Pictaria in your phone settings.
          Allow them there and come back.
        </p>
      )}

      {(status === "off" || status === "checking" || status === "working") && (
        <button
          type="button"
          onClick={() => void turnOn()}
          disabled={status !== "off"}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-[0.55rem] tracking-[0.2em] text-primary-foreground uppercase shadow-lift transition-transform hover:scale-[1.03] disabled:opacity-60"
        >
          <Bell className="h-3.5 w-3.5" />
          {status === "working" ? "One moment…" : "Notify me"}
        </button>
      )}

      {status === "on" && (
        <div className="mt-6">
          <p className="text-[0.7rem] tracking-[0.18em] text-accent uppercase">
            Notifications are on
          </p>
          <button
            type="button"
            onClick={() => void turnOff()}
            className="mt-3 inline-flex items-center gap-1.5 text-[10px] tracking-[0.14em] text-shell/70 uppercase underline transition-colors hover:text-accent"
          >
            <BellOff className="h-3 w-3" />
            Turn them off
          </button>
        </div>
      )}

      {error && <p className="mt-3 text-[11px] text-destructive">{error}</p>}
    </div>
  );
}
