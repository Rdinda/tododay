import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";

const SESSION_COOKIE = "tododay_session";

async function logout() {
  "use server";
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect("/login");
}

export default async function AppShellPage() {
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.get(SESSION_COOKIE)?.value === "1";

  if (!isAuthenticated) {
    redirect("/login");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-6 py-8">
      <header className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">TodoDay</p>
          <h1 className="text-2xl font-semibold">Shell autenticado</h1>
        </div>
        <form action={logout}>
          <Button type="submit" variant="outline">
            Sair
          </Button>
        </form>
      </header>

      <section className="mt-6 rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-medium">Primeira rota funcional</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Base pronta para evoluir fluxo de dia, tarefas e sessao de foco.
        </p>
      </section>
    </main>
  );
}
