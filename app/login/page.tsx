import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";

const SESSION_COOKIE = "tododay_session";

async function login(formData: FormData) {
  "use server";

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

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-6">
      <section className="w-full rounded-xl border border-border bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Entrar no TodoDay</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Fluxo inicial de autenticacao por passcode para liberar o shell do produto.
        </p>

        {params.error ? (
          <p className="mt-4 rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-700">
            Passcode invalido.
          </p>
        ) : null}

        <form action={login} className="mt-6 space-y-4">
          <div className="space-y-2">
            <label htmlFor="passcode" className="text-sm font-medium">
              Passcode
            </label>
            <input
              id="passcode"
              name="passcode"
              type="password"
              required
              className="w-full rounded-md border border-border bg-background px-3 py-2 outline-none ring-primary/30 focus:ring-2"
            />
          </div>
          <Button type="submit" className="w-full">
            Acessar
          </Button>
        </form>
      </section>
    </main>
  );
}
