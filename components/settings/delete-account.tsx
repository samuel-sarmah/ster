"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const CONFIRM_WORD = "DELETE";

export function DeleteAccountSection() {
  const router = useRouter();
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setLoading(true);
    setError(null);

    const res = await fetch("/api/account/delete", { method: "POST" });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Failed to delete account. Please try again.");
      setLoading(false);
      return;
    }

    // Session cookies are cleared server-side; drop any local browser state
    // too, then leave the app.
    await createClient().auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="space-y-4 border-t pt-6">
      <div>
        <h2 className="font-semibold text-destructive">Delete account</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Permanently delete your account and all associated data. This cannot
          be undone.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm-delete">
          Type <span className="font-mono font-semibold">{CONFIRM_WORD}</span> to
          confirm
        </Label>
        <Input
          id="confirm-delete"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder={CONFIRM_WORD}
          autoComplete="off"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button
        variant="destructive"
        disabled={confirmText !== CONFIRM_WORD || loading}
        onClick={handleDelete}
      >
        {loading ? "Deleting…" : "Delete my account"}
      </Button>
    </div>
  );
}
