import CustomerLayout from "@/components/dashboard/CustomerLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <CustomerLayout>{children}</CustomerLayout>;
}
