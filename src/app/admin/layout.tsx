import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export const metadata = {
  title: "Admin Dashboard | MangaVerse",
  description: "MangaVerse site statistics, content analytics, and user settings panel.",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Route security gate: Redirect non-admins to homepage
  if (!session?.user?.isAdmin) {
    redirect("/");
  }

  const user = {
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
  };

  return (
    <div className="admin-layout-wrapper">
      <AdminSidebar user={user} />
      <main className="admin-main-container">
        {children}
      </main>
    </div>
  );
}
