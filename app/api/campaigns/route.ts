import { NextResponse } from "next/server";
import { z } from "zod";
import { requireActiveUser } from "@/lib/auth/require-active-user";
import { serverError } from "@/lib/api/error-response";

const PLATFORMS = ["tiktok", "instagram", "youtube", "x"] as const;

const createCampaignSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().optional(),
  guidelines: z.string().optional(),
  content_requirements: z.string().optional(),
  platforms: z.array(z.enum(PLATFORMS)).min(1, "Select at least one platform"),
  target_cpm: z.number().finite().positive(),
  total_budget: z.number().finite().positive(),
  starts_at: z.string().datetime().optional().nullable(),
  ends_at: z.string().datetime().optional().nullable(),
});

export async function POST(request: Request) {
  const result = await requireActiveUser();
  if ("error" in result) return result.error;
  const { user, profile, supabase } = result;

  if (profile?.role !== "brand") {
    return NextResponse.json({ error: "Only brands can create campaigns" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = createCampaignSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", fields: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }
  const data = parsed.data;

  const { data: campaign, error } = await supabase
    .from("campaigns")
    .insert({
      brand_id: user.id,
      title: data.title,
      description: data.description || null,
      guidelines: data.guidelines || null,
      content_requirements: data.content_requirements || null,
      platforms: data.platforms,
      target_cpm: data.target_cpm,
      total_budget: data.total_budget,
      starts_at: data.starts_at ?? null,
      ends_at: data.ends_at ?? null,
      status: "draft",
    })
    .select("id")
    .single();

  if (error) return serverError(error, "campaigns.create");

  return NextResponse.json({ id: campaign.id }, { status: 201 });
}
