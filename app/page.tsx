import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  const cookieStore = await cookies();
  const sessionValue = cookieStore.get("tododay_session")?.value;
  const isAuthenticated = !!sessionValue && sessionValue.length > 0 && sessionValue !== "1";

  if (isAuthenticated) {
    redirect("/app");
  }

  redirect("/login");
}
