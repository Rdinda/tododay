"use client";

import { useEffect, useRef, useState, useTransition } from "react";

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
  onDayClosed?: () => void;
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
  onDayClosed,
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

  const [dayId, setDayId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [pomodorosCount, setPomodorosCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Ref para preservar o dayId mesmo depois que o Sheet começa a fechar
  const dayIdRef = useRef<string | null>(null);

  async function loadDay(d: Date) {
    setLoading(true);
    setLoadError(null);
    try {
      const day = await getOrCreateDay(d);
      setDayId(day.id);
      dayIdRef.current = day.id;
      setTasks(day.tasks as Task[]);
      setPomodorosCount(day.sessions?.length || 0);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setLoadError(msg);
      console.error("Erro ao carregar dia:", err);
    } finally {
      setLoading(false);
    }
  }

  // Radix não chama onOpenChange quando o pai seta open=true via prop —
  // useEffect garante que loadDay rode corretamente ao abrir.
  useEffect(() => {
    if (open && date && !dayId && !loading) {
      void loadDay(date);
    }
    if (!open && !encerrarOpen) {
      // Só reseta se o dialog de encerrar também estiver fechado
      setDayId(null);
      dayIdRef.current = null;
      setTasks([]);
      setPomodorosCount(0);
      setLoadError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, date]);

  const highTasks = tasks.filter((t) => t.priority === "HIGH");
  const lowTasks = tasks.filter((t) => t.priority === "LOW");

  const currentMode: DaySheetMode =
    mode === "execution" && highTasks.length === 0 ? "create" : mode;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
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
            {loading && (
              <p className="text-xs text-muted-foreground animate-pulse">Conectando ao banco…</p>
            )}
            {loadError && (
              <p className="text-xs text-destructive">
                Erro: {loadError}
              </p>
            )}
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-4 py-4">
            {currentMode === "create" ? (
              <DaySheetCreate
                dayId={dayId}
                loading={loading}
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
                pomodorosToday={pomodorosCount}
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
          // Usa ref para garantir que o dayId não seja null por race condition
          const id = dayIdRef.current;
          if (!id) return;
          await closeDay(id, status, note);
          setEncerrarOpen(false);

          if (onDayClosed) {
            onDayClosed();
            // REMOVED: onOpenChange(false) so the sheet stays open and transitions to view
          } else {
            // Limpa estado e fecha o sheet
            setDayId(null);
            dayIdRef.current = null;
            setTasks([]);
            onOpenChange(false);
          }
        }}
      />
    </>
  );
}

// ─────────────────────────────────────────────
// Mode A: Criar tarefas
// ─────────────────────────────────────────────

function DaySheetCreate({
  dayId,
  loading,
  onSaved,
}: {
  dayId: string | null;
  loading: boolean;
  onSaved: (tasks: Task[]) => void;
}) {
  const [missions, setMissions] = useState(["", "", ""]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!dayId) return;
    const [m1, m2, m3] = missions as [string, string, string];
    if (!m1.trim() || !m2.trim() || !m3.trim()) return;

    setSaving(true);
    setSaveError(null);
    try {
      const saved = await saveDayMissions(dayId, [m1, m2, m3]);
      onSaved(saved as Task[]);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  const allFilled = missions.every((m) => m.trim().length > 0);
  const buttonLabel = saving
    ? "Salvando…"
    : loading
      ? "Conectando…"
      : "Salvar tarefas";

  return (
    <div className="space-y-4 duration-300 ease-out">
      <h2 className="text-base font-medium">Quais são suas 3 tarefas principais de hoje?</h2>
      {([0, 1, 2] as const).map((i) => (
        <div key={i} className="space-y-2">
          <Label htmlFor={`m${i + 1}`}>
            Tarefa {i + 1} <span className="text-destructive">*</span>
          </Label>
          <Input
            id={`m${i + 1}`}
            name={`m${i + 1}`}
            className="rounded-xl"
            placeholder={`Tarefa ${i + 1}…`}
            value={missions[i]}
            onChange={(e) => {
              const next = [...missions];
              next[i] = e.target.value;
              setMissions(next);
            }}
            disabled={saving}
          />
        </div>
      ))}
      {saveError && (
        <p className="text-xs text-destructive">Erro ao salvar: {saveError}</p>
      )}
      <Button
        type="button"
        className="w-full rounded-xl"
        disabled={!allFilled || saving || loading || !dayId}
        onClick={handleSubmit}
      >
        {buttonLabel}
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
      {/* Tarefas principais */}
      <div>
        <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Tarefas do dia
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
