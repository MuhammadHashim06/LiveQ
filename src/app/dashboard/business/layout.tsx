import BusinessLayout from "@/components/dashboard/BusinessLayout";
import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const user = await getUser();

  if (!user || user.role !== "business") {
    redirect("/login");
  }

  return <BusinessLayout>{children}</BusinessLayout>;
}
