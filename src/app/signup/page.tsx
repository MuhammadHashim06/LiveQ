import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import SignupForm from "./SignupForm";

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ role?: string }> }) {
    const user = await getUser();

    // If already logged in, redirect them to their dashboard
    if (user) {
        redirect(`/dashboard/${user.role}`);
    }

    const role = (await searchParams).role === "business" ? "business" : "customer";
    return <SignupForm initialRole={role} />;
}
