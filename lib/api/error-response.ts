import { NextResponse } from "next/server";

/**
 * Logs the real error server-side and returns a generic message to the
 * client — raw Postgres/Stripe error text can leak schema/internal details.
 */
export function serverError(error: unknown, context: string) {
  console.error(`[${context}]`, error);
  const body: { error: string; detail?: string } = {
    error: "Something went wrong",
  };
  // In non-production, include the real message so failures are diagnosable
  // from the client without digging through server logs.
  if (process.env.NODE_ENV !== "production") {
    body.detail = error instanceof Error ? error.message : String(error);
  }
  return NextResponse.json(body, { status: 500 });
}
