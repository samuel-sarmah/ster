import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  draft: "outline",
  active: "default",
  paused: "secondary",
  completed: "secondary",
  archived: "outline",
};

export default async function AdminCampaignsPage() {
  const supabase = await createClient();

  const { data: campaigns } = await supabase
    .from("campaigns")
    .select(`
      id, title, status, total_budget, spent_budget, created_at,
      profiles!brand_id(display_name),
      submissions(id)
    `)
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Campaigns</h1>
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3 font-medium">Brand</th>
              <th className="text-left p-3 font-medium">Title</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="text-left p-3 font-medium">Budget</th>
              <th className="text-left p-3 font-medium">Spent</th>
              <th className="text-left p-3 font-medium">Submissions</th>
              <th className="text-left p-3 font-medium">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {(campaigns as any[] ?? []).map((c) => (
              <tr key={c.id} className="hover:bg-muted/20">
                <td className="p-3">{c.profiles?.display_name ?? "—"}</td>
                <td className="p-3">{c.title}</td>
                <td className="p-3">
                  <Badge variant={STATUS_VARIANT[c.status] ?? "outline"}>{c.status}</Badge>
                </td>
                <td className="p-3">${Number(c.total_budget).toLocaleString()}</td>
                <td className="p-3">${Number(c.spent_budget).toFixed(2)}</td>
                <td className="p-3">{c.submissions?.length ?? 0}</td>
                <td className="p-3 text-muted-foreground">
                  {new Date(c.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {(campaigns ?? []).length === 0 && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-muted-foreground">
                  No campaigns yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
