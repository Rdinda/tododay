import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.get("tododay_session")?.value === "1";

  if (isAuthenticated) {
    redirect("/app");
  }

  redirect("/login");
}
