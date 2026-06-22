"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import type { Provider } from "@supabase/supabase-js";
import { GoogleIcon, XIcon, DiscordIcon } from "@/components/brand-icons";
import { createClient } from "@/lib/supabase/client";
import { getSiteUrl } from "@/lib/site-url";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Role = "creator" | "brand";

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("creator");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  async function handleOAuthSignup(provider: Provider) {
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        // Carry the chosen role through OAuth. OAuth sign-ups can't pass
        // signup metadata, so the DB trigger defaults them to 'creator' — the
        // /callback route reads this param to honour the brand/creator choice
        // for first-time users.
        redirectTo: `${window.location.origin}/callback?role=${role}`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role, display_name: displayName },
        // Land on the login page of the deployed site after the user clicks
        // the confirmation link. Supabase's verify endpoint marks the email
        // confirmed before this redirect, so the user can sign in straight
        // away. Using the canonical site URL (not window.origin) keeps the
        // link off localhost when signing up during local dev.
        emailRedirectTo: `${getSiteUrl()}/login`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Supabase returns session:null when email confirmation is required.
    // Redirect to onboarding only when the session is live.
    if (data.session) {
      router.push("/onboarding");
    } else {
      setEmailSent(true);
      setLoading(false);
    }
  }

  if (emailSent) {
    return (
      <Card className="hover:translate-y-0 hover:shadow-[var(--shadow-soft)]">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Check your email</CardTitle>
          <CardDescription>
            We sent a confirmation link to <strong>{email}</strong>. Click it to
            activate your account, then come back to sign in.
          </CardDescription>
        </CardHeader>
        <CardFooter className="justify-center">
          <Link href="/login" className="text-sm underline text-muted-foreground">
            Back to sign in
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="hover:translate-y-0 hover:shadow-[var(--shadow-soft)]">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Join Sterz</CardTitle>
        <CardDescription>Create your account</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {(["creator", "brand"] as Role[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`rounded-lg border p-4 text-left transition-colors ${
                role === r
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border hover:border-muted-foreground/50"
              }`}
            >
              <div className="font-medium capitalize">{r}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {r === "creator"
                  ? "Post content and earn based on views"
                  : "Run campaigns and pay creators per view"}
              </div>
            </button>
          ))}
        </div>

        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => handleOAuthSignup("google")}
            disabled={loading}
          >
            <GoogleIcon className="size-4" />
            Continue with Google
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled
            aria-disabled
          >
            <XIcon className="size-4" />
            Continue with X
            <span className="ml-auto text-xs font-normal text-muted-foreground">
              Coming soon
            </span>
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => handleOAuthSignup("discord")}
            disabled={loading}
          >
            <DiscordIcon className="size-4 text-[#5865F2]" />
            Continue with Discord
          </Button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">or</span>
          </div>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">
              {role === "brand" ? "Company name" : "Display name"}
            </Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                aria-label={showConfirm ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account…" : "Create account"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="underline">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
