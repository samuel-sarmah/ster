import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending_review: "outline",
  approved: "secondary",
  tracking: "default",
  paid: "secondary",
  rejected: "destructive",
};

export default async function AdminSubmissionsPage() {
  const supabase = await createClient();

  const { data: submissions } = await supabase
    .from("submissions")
    .select(`
      id, platform, post_url, status, submitted_at,
      campaigns!inner(title),
      profiles!creator_id(display_name)
    `)
    .order("submitted_at", { ascending: false })
    .limit(100);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Submissions</h1>
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3 font-medium">Creator</th>
              <th className="text-left p-3 font-medium">Campaign</th>
              <th className="text-left p-3 font-medium">Platform</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="text-left p-3 font-medium">Submitted</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {(submissions ?? []).map((s: any) => (
              <tr key={s.id} className="hover:bg-muted/20">
                <td className="p-3">{s.profiles?.display_name ?? "—"}</td>
                <td className="p-3">{s.campaigns?.title}</td>
                <td className="p-3 capitalize">{s.platform}</td>
                <td className="p-3">
                  <Badge variant={STATUS_VARIANT[s.status] ?? "outline"}>
                    {s.status.replace(/_/g, " ")}
                  </Badge>
                </td>
                <td className="p-3 text-muted-foreground">
                  {new Date(s.submitted_at).toLocaleDateString()}
                </td>
                <td className="p-3">
                  <Link
                    href={`/admin/submissions/${s.id}`}
                    className="text-primary underline text-sm"
                  >
                    Review
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
