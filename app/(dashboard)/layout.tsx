import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase-server";
import { Sidebar } from "@/components/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <Sidebar email={user.email} />
      <main className="flex-1 lg:h-screen lg:overflow-y-auto">
        <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
