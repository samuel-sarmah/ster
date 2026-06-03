import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { UserActionButtons } from "./user-action-buttons";

export default async function AdminUsersPage() {
  const supabase = await createClient();

  const { data: users } = await supabase
    .from("profiles")
    .select("id, role, display_name, is_suspended, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Users</h1>
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3 font-medium">Name</th>
              <th className="text-left p-3 font-medium">Role</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="text-left p-3 font-medium">Joined</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {(users ?? []).map((user) => (
              <tr key={user.id} className="hover:bg-muted/20">
                <td className="p-3">{user.display_name ?? "—"}</td>
                <td className="p-3">
                  <Badge variant="outline" className="capitalize">
                    {user.role}
                  </Badge>
                </td>
                <td className="p-3">
                  {user.is_suspended ? (
                    <Badge variant="destructive">Suspended</Badge>
                  ) : (
                    <Badge variant="secondary">Active</Badge>
                  )}
                </td>
                <td className="p-3 text-muted-foreground">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="p-3">
                  <UserActionButtons userId={user.id} isSuspended={user.is_suspended} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
