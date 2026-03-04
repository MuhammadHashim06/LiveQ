import CustomerLayout from "@/components/dashboard/CustomerLayout";
import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const user = await getUser();

  if (!user || user.role !== "customer") {
    redirect("/login");
  }

  return <CustomerLayout>{children}</CustomerLayout>;
}
