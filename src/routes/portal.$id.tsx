import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2 } from "lucide-react";

import { AdminPageHeader } from "@/components/portal/AdminPageHeader";
import { BusinessEditor } from "@/components/portal/BusinessEditor";

import { getPortalBusiness } from "@/lib/portal.functions";
import type { PortalRecord } from "@/lib/portal-types";

export const Route = createFileRoute("/portal/$id")({
  head: () => ({
    meta: [
      { title: "Pictaria Project" },
      { name: "description", content: "A community project for Maui support." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: BusinessRecord,
});

function BusinessRecord() {
  const { id } = Route.useParams();
  const load = useServerFn(getPortalBusiness);
  const [locked, setLocked] = useState<boolean | null>(null);
  const [record, setRecord] = useState<PortalRecord | null>(null);

  const check = async () => {
    try {
      const result = await load({ data: { id } });
      if (result.locked) {
        setLocked(true);
        return;
      }
      setLocked(false);
      setRecord(result.record);
    } catch {
      // Never leave a blank screen if the record can't be fetched.
      setLocked(false);
      setRecord(null);
    }
  };

  useEffect(() => {
    void check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (locked === null)
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );

  if (!record) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <p className="text-sm text-muted-foreground">That business record no longer exists.</p>
        <Link to="/portal/new" className="text-sm text-primary underline">
          Back to New Business
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <AdminPageHeader
        title={record.company_name || "Untitled business"}
        description={`${record.status} · updated ${new Date(record.updated_at).toLocaleDateString()}`}
      />
      <BusinessEditor record={record} />
    </div>
  );
}
