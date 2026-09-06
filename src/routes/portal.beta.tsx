import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Check, Copy } from "lucide-react";

import { AdminPageHeader } from "@/components/portal/AdminPageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { listBetaCodes } from "@/lib/beta.functions";
import type { BetaCodeRow, BetaRedemptionRow } from "@/lib/beta.functions";

export const Route = createFileRoute("/portal/beta")({
  head: () => ({
    meta: [
      { title: "Beta Codes — Pictaria Project" },
      {
        name: "description",
        content: "Give away the Artist version with a beta code.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: Beta,
});

const CODE_LABELS: Record<string, string> = {
  ARTIST3: "Artist Studio — 3 months free",
  BRANDSTUDIO50: "Brand Studio — 50% off forever",
};

function Beta() {
  const load = useServerFn(listBetaCodes);

  const [codes, setCodes] = useState<BetaCodeRow[]>([]);
  const [redemptions, setRedemptions] = useState<BetaRedemptionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState("");

  const refresh = async () => {
    const result = await load({});
    setCodes(result.codes);
    setRedemptions(result.redemptions);
  };

  useEffect(() => {
    void refresh().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shareLink = (value: string) =>
    `${window.location.origin}/beta?code=${encodeURIComponent(value)}`;

  const copyLink = async (value: string) => {
    await navigator.clipboard.writeText(shareLink(value));
    setCopied(value);
    window.setTimeout(() => setCopied(""), 2000);
  };

  return (
    <div className="mx-auto max-w-2xl">
      <AdminPageHeader
        title="Beta Codes"
        description={loading ? "Opening the list…" : "Two codes, no fuss."}
      />

      <div className="space-y-3">
        {codes.map((row) => (
          <Card key={row.id}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="font-display text-xl tracking-wide text-foreground">
                  {row.code}
                </span>
                <Badge variant="secondary">
                  {row.uses}/{row.max_uses} claimed
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {CODE_LABELS[row.code] ?? row.note}
              </p>
              {row.expires_at && (
                <p className="mt-0.5 text-xs text-muted-foreground/70">
                  Code expires {new Date(row.expires_at).toLocaleDateString()}
                </p>
              )}
              <Button onClick={() => void copyLink(row.code)} className="mt-4 w-full">
                {copied === row.code ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied === row.code ? "Copied" : "Copy signup link"}
              </Button>
            </CardContent>
          </Card>
        ))}

        {!loading && codes.length === 0 && (
          <p className="text-sm text-muted-foreground">No active beta codes.</p>
        )}

        {redemptions.length > 0 && (
          <Card>
            <CardContent className="p-5">
              <p className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                Claimed by
              </p>
              <div className="mt-3 space-y-1.5">
                {redemptions.map((row) => (
                  <div
                    key={`${row.email}-${row.code}`}
                    className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2"
                  >
                    <span className="truncate text-sm text-foreground">{row.email}</span>
                    <span className="ml-3 shrink-0 text-xs tracking-[0.1em] text-muted-foreground uppercase">
                      {row.code}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
