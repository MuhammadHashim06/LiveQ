import BusinessLayout from "@/components/dashboard/BusinessLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <BusinessLayout>{children}</BusinessLayout>;
}
