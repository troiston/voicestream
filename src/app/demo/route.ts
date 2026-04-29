import { redirect } from "next/navigation";
import { setSession } from "@/features/auth/session";

export async function GET() {
  await setSession({
    userId: "u_demo_enterprise",
    email: "demo@cloudvoice.app",
    name: "Demo Enterprise",
    emailVerified: true,
    role: "admin",
  });
  redirect("/dashboard");
}
