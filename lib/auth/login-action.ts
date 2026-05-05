"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const SESSION_COOKIE = "tododay_session";

export async function loginWithPasscode(formData: FormData) {
  const submittedPasscode = String(formData.get("passcode") ?? "");
  const expectedPasscode = process.env.TODODAY_ACCESS_PASSCODE ?? "tododay-dev";

  if (submittedPasscode !== expectedPasscode) {
    redirect("/login?error=1");
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  redirect("/app");
}
