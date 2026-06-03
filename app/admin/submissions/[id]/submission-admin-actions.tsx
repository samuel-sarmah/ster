"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SubmissionAdminActions({
  submissionId,
  currentStatus,
  earningsId,
}: {
  submissionId: string;
  currentStatus: string;
  earningsId?: string;
}) {
  const router = useRouter();
  const [rejectionReason, setRejectionReason] = useState("");
  const [viewOverride, setViewOverride] = useState("");
  const [loading, setLoading] = useState(false);

  async function updateStatus(action: "approve" | "reject") {
    setLoading(true);
    await fetch(`/api/admin/submissions/${submissionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        rejection_reason: action === "reject" ? rejectionReason : undefined,
      }),
    });
    router.refresh();
    setLoading(false);
  }

  async function overrideViews() {
    const views = parseInt(viewOverride, 10);
    if (isNaN(views) || views < 0) return;
    setLoading(true);
    await fetch(`/api/admin/submissions/${submissionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "override_views", verified_views: views }),
    });
    router.refresh();
    setLoading(false);
  }

  return (
    <div className="space-y-4">
      {currentStatus === "pending_review" && (
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => updateStatus("approve")}
            disabled={loading}
          >
            Approve
          </Button>
          <div className="flex gap-2 items-center flex-1">
            <Input
              placeholder="Rejection reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="text-sm"
            />
            <Button
              size="sm"
              variant="destructive"
              onClick={() => updateStatus("reject")}
              disabled={loading || !rejectionReason.trim()}
            >
              Reject
            </Button>
          </div>
        </div>
      )}

      {earningsId && (
        <div className="space-y-2">
          <Label className="text-sm">Override verified views</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              min={0}
              placeholder="View count"
              value={viewOverride}
              onChange={(e) => setViewOverride(e.target.value)}
              className="text-sm max-w-xs"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={overrideViews}
              disabled={loading || !viewOverride}
            >
              Apply
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
