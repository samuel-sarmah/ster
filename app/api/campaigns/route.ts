import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "brand") {
    return NextResponse.json({ error: "Only brands can create campaigns" }, { status: 403 });
  }

  const body = await request.json();

  const { data: campaign, error } = await supabase
    .from("campaigns")
    .insert({
      brand_id: user.id,
      title: body.title,
      description: body.description || null,
      guidelines: body.guidelines || null,
      content_requirements: body.content_requirements || null,
      platforms: body.platforms ?? [],
      target_cpm: body.target_cpm,
      total_budget: body.total_budget,
      starts_at: body.starts_at ?? null,
      ends_at: body.ends_at ?? null,
      status: "draft",
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ id: campaign.id }, { status: 201 });
}
