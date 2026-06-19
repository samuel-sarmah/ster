"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Status = { type: "ok" | "error"; message: string } | null;

function StatusLine({ status }: { status: Status }) {
  if (!status) return null;
  return (
    <p
      className={
        status.type === "ok"
          ? "text-sm text-muted-foreground"
          : "text-sm text-destructive"
      }
    >
      {status.message}
    </p>
  );
}

/**
 * Edit the display name (stored on `profiles` and mirrored into the auth user
 * metadata so it stays in sync) and shows the account email read-only.
 */
export function ProfileSection({
  initialDisplayName,
  email,
}: {
  initialDisplayName: string;
  email: string;
}) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setStatus(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setStatus({ type: "error", message: "Your session expired. Sign in again." });
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName })
      .eq("id", user.id);

    if (error) {
      setStatus({ type: "error", message: error.message });
      setSaving(false);
      return;
    }

    // Keep the auth metadata copy in sync — it seeds the display name elsewhere.
    await supabase.auth.updateUser({ data: { display_name: displayName } });

    setSaving(false);
    setStatus({ type: "ok", message: "Profile updated." });
    router.refresh();
  }

  return (
    <form onSubmit={handleSave} className="rounded-lg border p-4 space-y-4">
      <div>
        <h2 className="font-semibold">Profile</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Update how your name appears across Sterz.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={email} disabled readOnly />
      </div>

      <div className="space-y-2">
        <Label htmlFor="displayName">Display name</Label>
        <Input
          id="displayName"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
        />
      </div>

      <StatusLine status={status} />

      <Button
        type="submit"
        disabled={saving || displayName.trim() === initialDisplayName.trim()}
      >
        {saving ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}

/** Change the account password via Supabase auth. */
export function PasswordSection() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setStatus({ type: "error", message: "Passwords do not match." });
      return;
    }
    setSaving(true);
    setStatus(null);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    setSaving(false);
    if (error) {
      setStatus({ type: "error", message: error.message });
      return;
    }
    setPassword("");
    setConfirm("");
    setStatus({ type: "ok", message: "Password updated." });
  }

  return (
    <form onSubmit={handleSave} className="rounded-lg border p-4 space-y-4">
      <div>
        <h2 className="font-semibold">Password</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Choose a new password for your account.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="newPassword">New password</Label>
        <div className="relative">
          <Input
            id="newPassword"
            type={show ? "text" : "password"}
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            aria-label={show ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmNewPassword">Confirm new password</Label>
        <Input
          id="confirmNewPassword"
          type={show ? "text" : "password"}
          minLength={8}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
      </div>

      <StatusLine status={status} />

      <Button type="submit" disabled={saving || password.length === 0}>
        {saving ? "Saving…" : "Update password"}
      </Button>
    </form>
  );
}
