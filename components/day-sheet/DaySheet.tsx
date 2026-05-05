"use client";

import { useCallback, useState, useTransition } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

import {
  addExtraTask,
  closeDay,
  getOrCreateDay,
  saveDayMissions,
  toggleTask,
} from "@/lib/day-actions";
import { EncerrarDiaDialog } from "./EncerrarDiaDialog";
import { PomodoroTimer } from "./PomodoroTimer";
import type { DaySheetMode, DaySheetViewMeta } from "./types";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type Task = {
  id: string;
  title: string;
  priority: string;
  status: string;
  order: number;
};

export type DaySheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dateLabel: string;
  date: Date | null;
  mode: DaySheetMode;
  viewMeta?: DaySheetViewMeta;
  className?: string;
};

// ─────────────────────────────────────────────
// Root Component
// ─────────────────────────────────────────────

export function DaySheet({
  open,
  onOpenChange,
  dateLabel,
  date,
  mode,
  viewMeta = {
    dayStatus: "empty",
    dayNote: "",
    pomodoros: 0,
  },
  className,
}: DaySheetProps) {
  const [encerrarOpen, setEncerrarOpen] = useState(false);

  // Estado do dia carregado do banco
  const [dayId, setDayId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dayLoaded, setDayLoaded] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Carrega ou cria o day quando o sheet abre
  const loadDay = useCallback(() => {
    if (!date || dayLoaded) return;
    startTransition(async () => {
      try {
        const day = await getOrCreateDay(date);
        setDayId(day.id);
        setTasks(day.tasks as Task[]);
        setDayLoaded(true);
      } catch (err) {
        console.error("Erro ao carregar dia:", err);
      }
    });
  }, [date, dayLoaded]);

  function handleOpenChange(o: boolean) {
    if (o) loadDay();
    else setDayLoaded(false); // reseta ao fechar para recarregar no próximo open
    onOpenChange(o);
  }

  const highTasks = tasks.filter((t) => t.priority === "HIGH");
  const lowTasks = tasks.filter((t) => t.priority === "LOW");
  const pomodoroCount = 0; // será lido do banco futuramente

  const currentMode: DaySheetMode =
    mode === "execution" && highTasks.length === 0 ? "create" : mode;

  return (
    <>
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent
          side="right"
          showCloseButton
          className={cn(
            "flex w-full max-w-md flex-col border-border p-0 duration-300 ease-out",
            className
          )}
        >
          <SheetHeader className="gap-1 border-b border-border px-4 pt-2 pb-4 text-left">
            <SheetTitle className="text-lg">{dateLabel}</SheetTitle>
            {isPending && (
              <p className="text-xs text-muted-foreground">Carregando...</p>
            )}
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-4 py-4">
            {currentMode === "create" ? (
              <DaySheetCreate
                dayId={dayId}
                onSaved={(saved) => {
                  setTasks((prev) => [
                    ...prev.filter((t) => t.priority !== "HIGH"),
                    ...saved,
                  ]);
                }}
              />
            ) : null}
            {currentMode === "execution" ? (
              <DaySheetExecution
                dayId={dayId}
                highTasks={highTasks}
                lowTasks={lowTasks}
                pomodorosToday={pomodoroCount}
                onTaskToggle={(taskId, done) => {
                  setTasks((prev) =>
                    prev.map((t) =>
                      t.id === taskId
                        ? { ...t, status: done ? "DONE" : "PENDING" }
                        : t
                    )
                  );
                }}
                onExtraTaskAdded={(task) =>
                  setTasks((prev) => [...prev, task as Task])
                }
                onEncerrar={() => setEncerrarOpen(true)}
              />
            ) : null}
            {currentMode === "view" ? (
              <DaySheetView meta={viewMeta} />
            ) : null}
          </div>
        </SheetContent>
      </Sheet>
      <EncerrarDiaDialog
        open={encerrarOpen}
        onOpenChange={setEncerrarOpen}
        onConfirm={async (status, note) => {
          if (!dayId) return;
          await closeDay(dayId, status, note);
          setEncerrarOpen(false);
          onOpenChange(false);
        }}
      />
    </>
  );
}

// ─────────────────────────────────────────────
// Mode A: Criar missões
// ─────────────────────────────────────────────

function DaySheetCreate({
  dayId,
  onSaved,
}: {
  dayId: string | null;
  onSaved: (tasks: Task[]) => void;
}) {
  const [missions, setMissions] = useState(["", "", ""]);
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    if (!dayId) return;
    const [m1, m2, m3] = missions as [string, string, string];
    if (!m1.trim() || !m2.trim() || !m3.trim()) return;

    startTransition(async () => {
      const saved = await saveDayMissions(dayId, [m1, m2, m3]);
      onSaved(saved as Task[]);
    });
  }

  const allFilled = missions.every((m) => m.trim().length > 0);

  return (
    <div className="space-y-4 duration-300 ease-out">
      <h2 className="text-base font-medium">Quais são suas 3 missões de hoje?</h2>
      {([0, 1, 2] as const).map((i) => (
        <div key={i} className="space-y-2">
          <Label htmlFor={`m${i + 1}`}>
            Missão {i + 1} <span className="text-destructive">*</span>
          </Label>
          <Input
            id={`m${i + 1}`}
            name={`m${i + 1}`}
            className="rounded-xl"
            placeholder={`Missão ${i + 1}…`}
            value={missions[i]}
            onChange={(e) => {
              const next = [...missions];
              next[i] = e.target.value;
              setMissions(next);
            }}
            disabled={isPending}
          />
        </div>
      ))}
      <Button
        type="button"
        className="w-full rounded-xl"
        disabled={!allFilled || isPending || !dayId}
        onClick={handleSubmit}
        title={!dayId ? "Aguardando conexão com o banco…" : undefined}
      >
        {isPending ? "Salvando…" : !dayId ? "Carregando…" : "Salvar missões"}
      </Button>
    </div>
  );
}

// ─────────────────────────────────────────────
// Mode B: Execução
// ─────────────────────────────────────────────

function DaySheetExecution({
  dayId,
  highTasks,
  lowTasks,
  pomodorosToday,
  onTaskToggle,
  onExtraTaskAdded,
  onEncerrar,
}: {
  dayId: string | null;
  highTasks: Task[];
  lowTasks: Task[];
  pomodorosToday: number;
  onTaskToggle: (taskId: string, done: boolean) => void;
  onExtraTaskAdded: (task: Task) => void;
  onEncerrar: () => void;
}) {
  const [newExtra, setNewExtra] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleToggle(taskId: string, done: boolean) {
    onTaskToggle(taskId, done);
    startTransition(async () => {
      await toggleTask(taskId, done);
    });
  }

  function handleAddExtra() {
    if (!dayId || !newExtra.trim()) return;
    startTransition(async () => {
      const task = await addExtraTask(dayId, newExtra);
      onExtraTaskAdded(task as Task);
      setNewExtra("");
    });
  }

  return (
    <div className="space-y-6 duration-300 ease-out">
      {/* Missões principais */}
      <div>
        <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Missões do dia
        </p>
        <ul className="space-y-3">
          {highTasks.map((task) => {
            const done = task.status === "DONE";
            return (
              <li key={task.id} className="flex items-start gap-2">
                <Checkbox
                  id={`task-${task.id}`}
                  className="mt-0.5"
                  checked={done}
                  onCheckedChange={(checked) =>
                    handleToggle(task.id, checked === true)
                  }
                />
                <label
                  htmlFor={`task-${task.id}`}
                  className={cn(
                    "cursor-pointer text-sm leading-snug transition-colors",
                    done && "line-through text-muted-foreground"
                  )}
                >
                  {task.title}
                </label>
              </li>
            );
          })}
        </ul>
      </div>

      <Separator />

      {/* Timer Pomodoro */}
      <div>
        <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Timer
        </p>
        <PomodoroTimer
          dayId={dayId ?? undefined}
          initialPomodoros={pomodorosToday}
        />
      </div>

      <Separator />

      {/* Tarefas extras (LOW) */}
      <div>
        <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Tarefas adicionais
        </p>
        {lowTasks.length > 0 && (
          <ul className="mb-2 space-y-2">
            {lowTasks.map((task) => {
              const done = task.status === "DONE";
              return (
                <li key={task.id} className="flex items-start gap-2">
                  <Checkbox
                    id={`low-${task.id}`}
                    className="mt-0.5"
                    checked={done}
                    onCheckedChange={(checked) =>
                      handleToggle(task.id, checked === true)
                    }
                  />
                  <label
                    htmlFor={`low-${task.id}`}
                    className={cn(
                      "cursor-pointer text-sm transition-colors",
                      done && "line-through text-muted-foreground"
                    )}
                  >
                    {task.title}
                  </label>
                </li>
              );
            })}
          </ul>
        )}
        <div className="flex gap-2">
          <Input
            placeholder="Nova tarefa extra…"
            className="rounded-xl text-sm"
            value={newExtra}
            onChange={(e) => setNewExtra(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddExtra()}
            disabled={isPending || !dayId}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="shrink-0 rounded-xl"
            disabled={!newExtra.trim() || isPending || !dayId}
            onClick={handleAddExtra}
          >
            + Adicionar
          </Button>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full rounded-xl border-destructive/40 text-destructive hover:bg-destructive/10"
        onClick={onEncerrar}
      >
        Encerrar dia
      </Button>
    </div>
  );
}

// ─────────────────────────────────────────────
// Mode C: Visualização histórica
// ─────────────────────────────────────────────

function DaySheetView({ meta }: { meta: DaySheetViewMeta }) {
  const badge =
    meta.dayStatus === "done" ? (
      <Badge className="rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/20">
        Concluído ✅
      </Badge>
    ) : meta.dayStatus === "failed" ? (
      <Badge className="rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/20">
        Falhado
      </Badge>
    ) : (
      <Badge variant="secondary" className="rounded-lg">
        Sem registro
      </Badge>
    );

  return (
    <div className="space-y-4 duration-300 ease-out">
      <div>{badge}</div>
      <div>
        <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Nota do dia
        </p>
        <Card className="border-border bg-surface-2">
          <CardContent className="p-3 text-sm text-foreground/90">
            {meta.dayNote ? `"${meta.dayNote}"` : "—"}
          </CardContent>
        </Card>
      </div>
      <p className="text-sm text-muted-foreground">
        🍅 {meta.pomodoros} pomodoros
      </p>
    </div>
  );
}
