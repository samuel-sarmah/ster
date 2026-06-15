import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [
    { count: totalUsers },
    { count: totalCampaigns },
    { count: pendingSubmissions },
    { count: openFlags },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("campaigns").select("*", { count: "exact", head: true }),
    supabase
      .from("submissions")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending_review"),
    supabase
      .from("admin_flags")
      .select("*", { count: "exact", head: true })
      .eq("resolved", false),
  ]);

  const stats = [
    { label: "Total users", value: totalUsers ?? 0 },
    { label: "Total campaigns", value: totalCampaigns ?? 0 },
    { label: "Pending review", value: pendingSubmissions ?? 0 },
    { label: "Open flags", value: openFlags ?? 0 },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <h1 className="text-2xl font-bold">Admin dashboard</h1>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value }) => (
          <Card key={label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
