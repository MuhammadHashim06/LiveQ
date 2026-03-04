import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  const user = await getUser();

  // If already logged in, redirect them to their dashboard
  if (user) {
    redirect(`/dashboard/${user.role}`);
  }

  return <LoginForm />;
}
