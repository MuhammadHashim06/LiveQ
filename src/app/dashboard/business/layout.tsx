import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import ResendVerificationButton from "@/components/auth/ResendVerificationButton";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const user = await getUser();

  if (!user || user.role !== "business") {
    redirect("/login");
  }

  // This outer layout provides the verification banner to ALL business pages (including onboarding)
  return (
    <>
      {!user.isEmailVerified && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3 flex items-center justify-center gap-3 text-yellow-800 z-50 relative">
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
          <p className="text-sm font-medium">
            Please verify your email address to unlock all features. We sent a code to <span className="font-bold">{user.email}</span>.
          </p>
          <ResendVerificationButton />
        </div>
      )}
      <div id="outer-layout-root">
        {children}
      </div>
    </>
  );
}
