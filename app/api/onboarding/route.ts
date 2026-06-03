import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const admin = await createAdminClient();

  if (body.role === "brand") {
    const { error } = await admin.from("brand_profiles").upsert({
      id: user.id,
      company_name: body.company_name,
      website: body.website ?? null,
      industry: body.industry ?? null,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    const { error } = await admin.from("creator_profiles").upsert({
      id: user.id,
      bio: body.bio ?? null,
      niche: body.niche ?? [],
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
