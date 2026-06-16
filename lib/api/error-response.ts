import { NextResponse } from "next/server";

/**
 * Logs the real error server-side and returns a generic message to the
 * client — raw Postgres/Stripe error text can leak schema/internal details.
 */
export function serverError(error: unknown, context: string) {
  console.error(`[${context}]`, error);
  return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
}
