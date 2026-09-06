import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Check, Copy, Download } from "lucide-react";

import { AdminPageHeader } from "@/components/portal/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listSubscribers } from "@/lib/subscribers.functions";
import type { SubscriberRow } from "@/lib/subscribers.functions";

export const Route = createFileRoute("/portal/subscribers")({
  head: () => ({
    meta: [
      { title: "Subscribers — Portal" },
      {
        name: "description",
        content: "Every email address on the Pictaria daily list.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: Subscribers,
});

function Subscribers() {
  const load = useServerFn(listSubscribers);
  const [rows, setRows] = useState<SubscriberRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    void load({})
      .then((result) => setRows(result.rows))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const emails = rows.map((row) => row.email).join(", ");

  const copy = async () => {
    await navigator.clipboard.writeText(emails);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const download = () => {
    const csv = [
      "email,source,joined",
      ...rows.map((row) => `${row.email},${row.source ?? ""},${row.created_at}`),
    ].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "pictaria-subscribers.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-2xl">
      <AdminPageHeader
        title="Subscribers"
        description={loading ? "Opening the list…" : `${rows.length} on the list`}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void copy()}
              disabled={rows.length === 0}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy emails"}
            </Button>
            <Button variant="outline" size="sm" onClick={download} disabled={rows.length === 0}>
              <Download className="h-4 w-4" />
              CSV
            </Button>
          </>
        }
      />

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Source</TableHead>
                <TableHead className="text-right">Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={`${row.email}-${row.created_at}`}>
                  <TableCell className="font-medium">{row.email}</TableCell>
                  <TableCell className="text-muted-foreground">{row.source ?? "—"}</TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {new Date(row.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!loading && rows.length === 0 && (
            <p className="p-5 text-sm text-muted-foreground">No one has joined the list yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
