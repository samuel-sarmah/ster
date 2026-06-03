"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function UserActionButtons({
  userId,
  isSuspended,
}: {
  userId: string;
  isSuspended: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    await fetch(`/api/admin/users/${userId}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ suspended: !isSuspended }),
    });
    router.refresh();
    setLoading(false);
  }

  return (
    <Button size="sm" variant="outline" onClick={toggle} disabled={loading}>
      {isSuspended ? "Unsuspend" : "Suspend"}
    </Button>
  );
}
