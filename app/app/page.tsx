import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import CalendarApp from "@/components/calendar/calendar-app";

const SESSION_COOKIE = "tododay_session";

export default async function AppShellPage() {
  const cookieStore = await cookies();
  const sessionValue = cookieStore.get(SESSION_COOKIE)?.value;
  const isAuthenticated = !!sessionValue && sessionValue.length > 0 && sessionValue !== "1";

  if (!isAuthenticated) {
    redirect("/login");
  }

  return <CalendarApp />;
}
