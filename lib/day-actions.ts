"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE = "tododay_session";

/** Retorna o userId da sessão ou redireciona para login. */
async function requireUser(): Promise<string> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE);
  if (!session || session.value !== "1") {
    redirect("/login");
  }

  // Garante que o usuário "default" existe no banco
  const user = await prisma.user.upsert({
    where: { id: "default-user" },
    update: {},
    create: {
      id: "default-user",
      passcodeHash: process.env.TODODAY_ACCESS_PASSCODE ?? "tododay-dev",
      name: "Usuário",
    },
  });

  return user.id;
}

/** Formata uma data como ISO local: "YYYY-MM-DD" */
function toLocalDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

// ─────────────────────────────────────────────
// Day Actions
// ─────────────────────────────────────────────

/** Busca ou cria um Day para a data passada. */
export async function getOrCreateDay(date: Date) {
  const userId = await requireUser();
  const dateStr = toLocalDate(date);

  return prisma.day.upsert({
    where: { userId_date: { userId, date: dateStr } },
    update: {},
    create: {
      userId,
      date: dateStr,
      status: "OPEN",
    },
    include: {
      tasks: { orderBy: [{ priority: "asc" }, { order: "asc" }] },
      sessions: true,
    },
  });
}

/** Retorna estatísticas do usuário (oficial). */
export async function getUserStats() {
  const userId = await requireUser();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { currentStreak: true, bestStreak: true }
  });
  const pomodoros = await prisma.pomodoroSession.count({
    where: { day: { userId } }
  });
  return {
    currentStreak: user?.currentStreak || 0,
    totalPomodoros: pomodoros,
  };
}

/** Retorna todos os dias do mês para pintar o calendário. */
export async function getDaysInMonth(year: number, month: number) {
  const userId = await requireUser();
  const firstDay = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const lastDay = `${year}-${String(month + 1).padStart(2, "0")}-${new Date(year, month + 1, 0).getDate().toString().padStart(2, "0")}`;

  return prisma.day.findMany({
    where: {
      userId,
      date: { gte: firstDay, lte: lastDay },
    },
    select: { 
      date: true, 
      status: true,
      note: true,
      _count: {
        select: { sessions: true }
      },
      tasks: {
        where: { priority: "HIGH" },
        select: { id: true, title: true, status: true },
        orderBy: { order: "asc" },
      }
    },
  });
}

/** Encerra o dia (DONE ou FAILED). */
export async function closeDay(dayId: string, status: "DONE" | "FAILED", note: string) {
  return prisma.day.update({
    where: { id: dayId },
    data: {
      status,
      note,
      closedAt: new Date(),
    },
  });
}

// ─────────────────────────────────────────────
// Task Actions
// ─────────────────────────────────────────────

/** Cria as 3 tarefas principais do dia. */
export async function saveDayMissions(dayId: string, titles: [string, string, string]) {
  // Remove as antigas HIGH se existirem
  await prisma.task.deleteMany({
    where: { dayId, priority: "HIGH" },
  });

  const tasks = titles
    .filter((t) => t.trim().length > 0)
    .map((title, i) => ({
      dayId,
      title: title.trim(),
      priority: "HIGH",
      status: "PENDING",
      order: i,
    }));

  await prisma.task.createMany({ data: tasks });

  // Muda status do dia para IN_PROGRESS
  await prisma.day.update({
    where: { id: dayId },
    data: { status: "IN_PROGRESS" },
  });

  return prisma.task.findMany({
    where: { dayId, priority: "HIGH" },
    orderBy: { order: "asc" },
  });
}

/** Adiciona uma tarefa HIGH individual ao dia (para completar as 3 principais). */
export async function addHighTask(dayId: string, title: string) {
  const count = await prisma.task.count({ where: { dayId, priority: "HIGH" } });
  return prisma.task.create({
    data: {
      dayId,
      title: title.trim(),
      priority: "HIGH",
      status: "PENDING",
      order: count,
    },
  });
}

/** Alterna o status de uma tarefa (PENDING ↔ DONE). */
export async function toggleTask(taskId: string, done: boolean) {
  return prisma.task.update({
    where: { id: taskId },
    data: { status: done ? "DONE" : "PENDING" },
  });
}

/** Adiciona uma tarefa LOW (extra). */
export async function addExtraTask(dayId: string, title: string) {
  const count = await prisma.task.count({ where: { dayId, priority: "LOW" } });
  return prisma.task.create({
    data: {
      dayId,
      title: title.trim(),
      priority: "LOW",
      status: "PENDING",
      order: count,
    },
  });
}

// ─────────────────────────────────────────────
// Pomodoro Actions
// ─────────────────────────────────────────────

/** Registra um pomodoro concluído. */
export async function recordPomodoro(dayId: string, taskId: string | null, durationMin: number) {
  const now = new Date();
  const startedAt = new Date(now.getTime() - durationMin * 60 * 1000);

  return prisma.pomodoroSession.create({
    data: {
      dayId,
      taskId: taskId ?? undefined,
      startedAt,
      endedAt: now,
      durationMin,
      completed: true,
    },
  });
}

// ─────────────────────────────────────────────
// Migration Actions
// ─────────────────────────────────────────────

/** Migra uma tarefa pendente para outro dia. Marca a original como SKIPPED. */
export async function migrateTask(taskId: string, targetDateStr: string) {
  const userId = await requireUser();

  // Busca a tarefa original
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { day: true },
  });
  if (!task) throw new Error("Tarefa não encontrada");
  if (task.status === "DONE") throw new Error("Tarefa já concluída");

  // Busca ou cria o dia destino
  const targetDay = await prisma.day.upsert({
    where: { userId_date: { userId, date: targetDateStr } },
    update: {},
    create: {
      userId,
      date: targetDateStr,
      status: "OPEN",
    },
  });

  // Conta quantas tarefas já existem no dia destino para definir a ordem
  const existingCount = await prisma.task.count({
    where: { dayId: targetDay.id, priority: task.priority },
  });

  // Cria cópia no dia destino
  await prisma.task.create({
    data: {
      dayId: targetDay.id,
      title: task.title,
      priority: task.priority,
      status: "PENDING",
      order: existingCount,
    },
  });

  // Marca a original como SKIPPED
  const updated = await prisma.task.update({
    where: { id: taskId },
    data: { status: "SKIPPED" },
  });

  return { task: updated, targetDate: targetDateStr };
}

