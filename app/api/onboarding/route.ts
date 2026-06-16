import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { serverError } from "@/lib/api/error-response";

const brandSchema = z.object({
  company_name: z.string().trim().min(1, "Company name is required"),
  website: z.string().url().optional().or(z.literal("")),
  industry: z.string().optional(),
});

const creatorSchema = z.object({
  bio: z.string().optional(),
  niche: z.array(z.string()).default([]),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Use the user's actual role (set by the signup trigger), not a
  // client-supplied value — otherwise a request could upsert into whichever
  // profile table it likes regardless of the account's real role.
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const body = await request.json();
  const admin = await createAdminClient();

  if (profile.role === "brand") {
    const parsed = brandSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", fields: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { error } = await admin.from("brand_profiles").upsert({
      id: user.id,
      company_name: parsed.data.company_name,
      website: parsed.data.website || null,
      industry: parsed.data.industry ?? null,
    });
    if (error) return serverError(error, "onboarding.brand");
  } else if (profile.role === "creator") {
    const parsed = creatorSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", fields: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { error } = await admin.from("creator_profiles").upsert({
      id: user.id,
      bio: parsed.data.bio ?? null,
      niche: parsed.data.niche,
    });
    if (error) return serverError(error, "onboarding.creator");
  } else {
    return NextResponse.json({ error: "Unsupported role for onboarding" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
