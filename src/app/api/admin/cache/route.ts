import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

function isAdmin(email: string | null | undefined) {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail || !email) return false;
  return email.toLowerCase() === adminEmail.toLowerCase();
}

export async function POST() {
  const session = await auth();
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    // Revalidate all major routes
    const routes = ["/", "/browse", "/library", "/search"];
    for (const route of routes) {
      revalidatePath(route);
    }
    return NextResponse.json({ ok: true, revalidated: routes });
  } catch (err) {
    console.error("Cache revalidation error:", err);
    return NextResponse.json({ error: "Failed to revalidate cache" }, { status: 500 });
  }
}
