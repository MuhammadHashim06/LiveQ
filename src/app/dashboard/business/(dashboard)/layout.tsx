import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/dbConnect";
import Business from "@/models/Business";
import BusinessLayout from "@/components/dashboard/BusinessLayout";

export default async function ManagedBusinessLayout({ children }: { children: React.ReactNode }) {
    const user = await getUser();

    // Basic check again just in case, though the outer layout handles it
    if (!user || user.role !== "business") {
        redirect("/login");
    }

    // --- NEW: Onboarding Check ---
    // Since this layout ONLY wraps the main dashboard features (not onboarding),
    // we can safely redirect without a loop!
    await dbConnect();
    const business = await Business.findOne({ owner: user.id });

    if (!business) {
        redirect("/dashboard/business/onboarding");
    }

    return (
        <BusinessLayout>{children}</BusinessLayout>
    );
}
