/**
 * Messages for the `?error=` codes the /callback route redirects with. Kept in
 * one place so the login and signup pages can't drift apart on wording.
 */
export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  no_account:
    "That account doesn't exist yet. Choose your account type below to sign up — then you can sign in with the same provider.",
  auth_failed: "We couldn't complete that sign-in. Please try again.",
};

export function authErrorMessage(code: string | null): string | null {
  if (!code) return null;
  return AUTH_ERROR_MESSAGES[code] ?? null;
}
