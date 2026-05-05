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
  addHighTask,
  closeDay,
  getOrCreateDay,
  migrateTask,
  saveDayMissions,
  toggleTask,
} from "@/lib/day-actions";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
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

  const currentMode: DaySheetMode = mode === "view" ? "view" : "execution";

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
                onTaskMigrated={(taskId) => {
                  setTasks((prev) =>
                    prev.map((t) =>
                      t.id === taskId ? { ...t, status: "SKIPPED" } : t
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
              <DaySheetView
                meta={viewMeta}
                tasks={tasks}
                onTaskMigrated={(taskId) => {
                  setTasks((prev) =>
                    prev.map((t) =>
                      t.id === taskId ? { ...t, status: "SKIPPED" } : t
                    )
                  );
                }}
              />
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
// Mode B: Execução
// ─────────────────────────────────────────────

function DaySheetExecution({
  dayId,
  highTasks,
  lowTasks,
  pomodorosToday,
  onTaskToggle,
  onTaskMigrated,
  onExtraTaskAdded,
  onEncerrar,
}: {
  dayId: string | null;
  highTasks: Task[];
  lowTasks: Task[];
  pomodorosToday: number;
  onTaskToggle: (taskId: string, done: boolean) => void;
  onTaskMigrated: (taskId: string, targetDate: string) => void;
  onExtraTaskAdded: (task: Task) => void;
  onEncerrar: () => void;
}) {
  const [newExtra, setNewExtra] = useState("");
  const [newHighTask, setNewHighTask] = useState("");
  const [isPending, startTransition] = useTransition();
  const [migratingId, setMigratingId] = useState<string | null>(null);

  const missingHighCount = 3 - highTasks.length;

  function handleToggle(taskId: string, done: boolean) {
    onTaskToggle(taskId, done);
    startTransition(async () => {
      await toggleTask(taskId, done);
    });
  }

  function handleMigrate(taskId: string, targetDate: string) {
    setMigratingId(taskId);
    startTransition(async () => {
      try {
        await migrateTask(taskId, targetDate);
        onTaskMigrated(taskId, targetDate);
      } catch (err) {
        console.error("Erro ao migrar tarefa:", err);
      } finally {
        setMigratingId(null);
      }
    });
  }

  function handleAddHighTask() {
    if (!dayId || !newHighTask.trim()) return;
    startTransition(async () => {
      const task = await addHighTask(dayId, newHighTask);
      onExtraTaskAdded(task as Task);
      setNewHighTask("");
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

  // Mínimo para o input date: amanhã
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}`;

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
            const skipped = task.status === "SKIPPED";
            return (
              <li key={task.id} className="flex items-center gap-2">
                <Checkbox
                  id={`task-${task.id}`}
                  className="mt-0.5 shrink-0"
                  checked={done}
                  disabled={skipped}
                  onCheckedChange={(checked) =>
                    handleToggle(task.id, checked === true)
                  }
                />
                <label
                  htmlFor={`task-${task.id}`}
                  className={cn(
                    "flex-1 cursor-pointer text-sm leading-snug transition-colors",
                    done && "line-through text-muted-foreground",
                    skipped && "italic text-muted-foreground/60 line-through"
                  )}
                >
                  {task.title}
                  {skipped && (
                    <span className="ml-2 inline-flex items-center rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground not-italic">
                      Migrada →
                    </span>
                  )}
                </label>
                {!done && !skipped && (
                  <MigrateButton
                    taskId={task.id}
                    minDate={minDate}
                    migrating={migratingId === task.id}
                    onMigrate={handleMigrate}
                  />
                )}
              </li>
            );
          })}
        </ul>
        {missingHighCount > 0 && (
          <div className="mt-3 space-y-2">
            <p className="text-xs text-muted-foreground">
              Faltam {missingHighCount} tarefa{missingHighCount > 1 ? "s" : ""} principal{missingHighCount > 1 ? "is" : ""}.
            </p>
            <div className="flex gap-2">
              <Input
                placeholder={`Tarefa ${highTasks.length + 1}…`}
                className="rounded-xl text-sm"
                value={newHighTask}
                onChange={(e) => setNewHighTask(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddHighTask()}
                disabled={isPending || !dayId}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="shrink-0 rounded-xl"
                disabled={!newHighTask.trim() || isPending || !dayId}
                onClick={handleAddHighTask}
              >
                + Adicionar
              </Button>
            </div>
          </div>
        )}
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
              const skipped = task.status === "SKIPPED";
              return (
                <li key={task.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`low-${task.id}`}
                    className="mt-0.5 shrink-0"
                    checked={done}
                    disabled={skipped}
                    onCheckedChange={(checked) =>
                      handleToggle(task.id, checked === true)
                    }
                  />
                  <label
                    htmlFor={`low-${task.id}`}
                    className={cn(
                      "flex-1 cursor-pointer text-sm transition-colors",
                      done && "line-through text-muted-foreground",
                      skipped && "italic text-muted-foreground/60 line-through"
                    )}
                  >
                    {task.title}
                    {skipped && (
                      <span className="ml-2 inline-flex items-center rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground not-italic">
                        Migrada →
                      </span>
                    )}
                  </label>
                  {!done && !skipped && (
                    <MigrateButton
                      taskId={task.id}
                      minDate={minDate}
                      migrating={migratingId === task.id}
                      onMigrate={handleMigrate}
                    />
                  )}
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
// Migrate Button with Popover
// ─────────────────────────────────────────────

function MigrateButton({
  taskId,
  minDate,
  migrating,
  onMigrate,
}: {
  taskId: string;
  minDate: string;
  migrating: boolean;
  onMigrate: (taskId: string, targetDate: string) => void;
}) {
  const [open, setOpen] = useState(false);

  // Parse minDate string (YYYY-MM-DD) to Date for the Calendar disabled prop
  const minDateObj = new Date(minDate + "T00:00:00");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
          className={cn(
            "inline-flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
          )}
          title="Migrar para outro dia"
          disabled={migrating}
        >
          {migrating ? (
            <span className="size-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          )}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-auto p-0">
        <div className="p-3 pb-1">
          <p className="text-xs font-medium text-muted-foreground">Migrar para:</p>
        </div>
        <Calendar
          mode="single"
          disabled={{ before: minDateObj }}
          defaultMonth={minDateObj}
          onSelect={(date) => {
            if (date) {
              const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
              onMigrate(taskId, dateStr);
              setOpen(false);
            }
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

// ─────────────────────────────────────────────
// Mode C: Visualização histórica
// ─────────────────────────────────────────────

function DaySheetView({
  meta,
  tasks,
  onTaskMigrated,
}: {
  meta: DaySheetViewMeta;
  tasks: Task[];
  onTaskMigrated: (taskId: string, targetDate: string) => void;
}) {
  const [migratingId, setMigratingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}`;

  function handleMigrate(taskId: string, targetDate: string) {
    setMigratingId(taskId);
    startTransition(async () => {
      try {
        await migrateTask(taskId, targetDate);
        onTaskMigrated(taskId, targetDate);
      } catch (err) {
        console.error("Erro ao migrar tarefa:", err);
      } finally {
        setMigratingId(null);
      }
    });
  }

  const badge =
    meta.dayStatus === "done" ? (
      <Badge className="rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/20">
        Concluído
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

  const highTasks = tasks.filter((t) => t.priority === "HIGH");
  const lowTasks = tasks.filter((t) => t.priority === "LOW");
  const allTasks = [...highTasks, ...lowTasks];
  const hasPending = allTasks.some((t) => t.status === "PENDING");

  return (
    <div className="space-y-4 duration-300 ease-out">
      <div>{badge}</div>

      {/* Lista de tarefas */}
      {allTasks.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Tarefas
          </p>
          <ul className="space-y-2">
            {allTasks.map((task) => {
              const done = task.status === "DONE";
              const skipped = task.status === "SKIPPED";
              const pending = task.status === "PENDING";
              return (
                <li key={task.id} className="flex items-center gap-2">
                  <span className={cn(
                    "size-4 shrink-0 flex items-center justify-center rounded text-[10px]",
                    done && "text-emerald-500",
                    pending && "text-yellow-500",
                    skipped && "text-muted-foreground/50"
                  )}>
                    {done ? "✓" : pending ? "○" : "→"}
                  </span>
                  <span
                    className={cn(
                      "flex-1 text-sm leading-snug",
                      done && "line-through text-muted-foreground",
                      skipped && "italic text-muted-foreground/60 line-through"
                    )}
                  >
                    {task.title}
                    {skipped && (
                      <span className="ml-2 inline-flex items-center rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground not-italic">
                        Migrada →
                      </span>
                    )}
                  </span>
                  {pending && (
                    <MigrateButton
                      taskId={task.id}
                      minDate={minDate}
                      migrating={migratingId === task.id}
                      onMigrate={handleMigrate}
                    />
                  )}
                </li>
              );
            })}
          </ul>
          {hasPending && (
            <p className="mt-3 text-xs text-muted-foreground">
              Clique na seta → para migrar tarefas pendentes para outro dia.
            </p>
          )}
        </div>
      )}

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
