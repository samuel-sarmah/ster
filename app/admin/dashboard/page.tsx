import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/app/page-header";
import { StatCard } from "@/components/app/stat-card";

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
    { label: "Users", value: totalUsers ?? 0 },
    { label: "Campaigns", value: totalCampaigns ?? 0 },
    { label: "Pending review", value: pendingSubmissions ?? 0, hot: (pendingSubmissions ?? 0) > 0 },
    { label: "Open flags", value: openFlags ?? 0, hot: (openFlags ?? 0) > 0 },
  ];

  return (
    <div className="space-y-8">
      <PageHeader title="Admin" description="Platform-wide counts and review queue." />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, hot }) => (
          <StatCard key={label} label={label} value={value} hot={hot} />
        ))}
      </div>
    </div>
  );
}
