import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Production: enforce authentication.
  // Local dev: skip when DEV_BYPASS_AUTH=true.
  const isDevBypass =
    process.env.NODE_ENV !== "production" &&
    process.env.DEV_BYPASS_AUTH === "true";

  let userInfo: { name?: string | null; email?: string | null };

  if (isDevBypass) {
    userInfo = { name: "Admin SMPN 5 (DEV)", email: "admin@smpn5klaten.sch.id" };
  } else {
    const session = await auth();
    if (!session) redirect("/login");
    userInfo = session.user || {};
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 md:ml-60 flex flex-col min-h-screen min-w-0">
        <Topbar user={userInfo} />
        <main className="flex-1 p-4 md:p-7">{children}</main>
      </div>
    </div>
  );
}
