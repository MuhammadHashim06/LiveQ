import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import SignupForm from "./SignupForm";

export default async function SignupPage() {
    const user = await getUser();

    // If already logged in, redirect them to their dashboard
    if (user) {
        redirect(`/dashboard/${user.role}`);
    }

    return <SignupForm />;
}
