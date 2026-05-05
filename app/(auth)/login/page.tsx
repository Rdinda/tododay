import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";

const SESSION_COOKIE = "tododay_session";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const cookieStore = await cookies();
  const params = await searchParams;

  if (cookieStore.get(SESSION_COOKIE)?.value === "1") {
    redirect("/app");
  }

  return <LoginForm hasError={params.error === "1"} />;
}
