/**
 * Canonical public URL of the app. Prefers NEXT_PUBLIC_APP_URL (set per
 * environment in Vercel) so links baked into transactional emails — e.g. the
 * signup confirmation — always point at the deployed site rather than whatever
 * origin the browser happened to be on (i.e. localhost during local dev, which
 * 404s when the link is opened anywhere else).
 */
export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  if (typeof window !== "undefined") return window.location.origin;
  return "";
}
