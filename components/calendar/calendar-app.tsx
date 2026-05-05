"use client";

import { useEffect, useMemo, useState, useTransition } from "react";

import { DaySheet } from "@/components/day-sheet/DaySheet";
import type { DaySheetMode, DaySheetViewMeta } from "@/components/day-sheet/types";
import { logoutSession } from "@/lib/auth/logout-action";
import { getDaysInMonth } from "@/lib/day-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CellVisual = "empty" | "done" | "failed" | "today" | "future";

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function toLocalDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function cellVisual(
  dayDate: Date,
  today: Date,
  dayStatusMap: Record<string, string>
): CellVisual {
  const d0 = startOfDay(dayDate);
  const t0 = startOfDay(today);
  if (d0.getTime() > t0.getTime()) return "future";
  if (sameDay(d0, t0)) return "today";

  const key = toLocalDate(d0);
  const status = dayStatusMap[key];
  if (status === "DONE") return "done";
  if (status === "FAILED") return "failed";
  return "empty";
}

function sheetModeForVisual(v: CellVisual): DaySheetMode {
  if (v === "today") return "execution";
  if (v === "future") return "create";
  if (v === "empty") return "create";
  return "view";
}

function formatSheetTitle(d: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

export default function CalendarApp() {
  const today = useMemo(() => new Date(), []);
  const [viewMonth, setViewMonth] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Mapa de status dos dias vindos do banco: { "YYYY-MM-DD": "DONE" | "FAILED" | ... }
  const [dayStatusMap, setDayStatusMap] = useState<Record<string, string>>({});
  const [, startTransition] = useTransition();

  // Carrega os dias do mês atual do banco
  useEffect(() => {
    startTransition(async () => {
      try {
        const days = await getDaysInMonth(
          viewMonth.getFullYear(),
          viewMonth.getMonth()
        );
        const map: Record<string, string> = {};
        for (const d of days) {
          map[d.date] = d.status;
        }
        setDayStatusMap(map);
      } catch (err) {
        console.error("Erro ao carregar dias do mês:", err);
      }
    });
  }, [viewMonth]);

  const monthLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("pt-BR", {
        month: "long",
        year: "numeric",
      }).format(viewMonth),
    [viewMonth]
  );

  const { grid, numRows } = useMemo(() => {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    const firstDow = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: { day: number; inMonth: boolean }[] = [];
    for (let i = 0; i < firstDow; i++) cells.push({ day: 0, inMonth: false });
    for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, inMonth: true });
    while (cells.length % 7 !== 0) cells.push({ day: 0, inMonth: false });

    const numRows = Math.ceil(cells.length / 7);
    return { grid: cells, numRows };
  }, [viewMonth]);

  function openDay(day: number) {
    const d = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day);
    const v = cellVisual(d, today, dayStatusMap);
    if (v === "future") return;
    setSelectedDate(d);
    setSheetOpen(true);
  }

  const selectedVisual = selectedDate
    ? cellVisual(selectedDate, today, dayStatusMap)
    : null;
  const sheetMode = selectedVisual ? sheetModeForVisual(selectedVisual) : "create";

  // viewMeta só é relevante para days passados com status registrado
  const viewMeta: DaySheetViewMeta | undefined =
    sheetMode === "view" && selectedDate
      ? {
          dayStatus:
            dayStatusMap[toLocalDate(selectedDate)] === "DONE"
              ? "done"
              : dayStatusMap[toLocalDate(selectedDate)] === "FAILED"
              ? "failed"
              : "empty",
          dayNote: "",
          pomodoros: 0,
        }
      : undefined;

  return (
    <div className="flex h-screen min-h-[520px] flex-col overflow-hidden bg-background duration-300 ease-out">
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-border px-4 py-3 md:px-6">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-tight">TodoDay</p>
        </div>

        <div className="flex flex-1 items-center justify-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="rounded-xl"
            onClick={() =>
              setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))
            }
            aria-label="Mês anterior"
          >
            ‹
          </Button>
          <span className="min-w-[10rem] text-center text-sm font-medium capitalize md:text-base">
            {monthLabel}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="rounded-xl"
            onClick={() =>
              setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))
            }
            aria-label="Próximo mês"
          >
            ›
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Badge className="rounded-xl bg-primary/15 px-3 py-1 text-primary hover:bg-primary/20">
            🔥 5
          </Badge>
          <form action={logoutSession}>
            <Button type="submit" variant="outline" size="sm" className="rounded-xl">
              Sair
            </Button>
          </form>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col px-4 py-3 md:px-6">
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SAB"].map((d) => (
            <div key={d} className="py-2">
              {d}
            </div>
          ))}
        </div>

        <div
          className={cn(
            "grid min-h-0 flex-1 grid-cols-7 gap-1 pb-4",
            numRows === 5 ? "grid-rows-5" : "grid-rows-6"
          )}
        >
          {grid.map((cell, idx) => {
            if (!cell.inMonth || cell.day === 0) {
              return (
                <div key={`pad-${idx}`} className="min-h-0 rounded-xl bg-transparent" />
              );
            }
            const d = new Date(
              viewMonth.getFullYear(),
              viewMonth.getMonth(),
              cell.day
            );
            const v = cellVisual(d, today, dayStatusMap);
            const clickable = v !== "future";

            return (
              <button
                key={`day-${cell.day}`}
                type="button"
                disabled={!clickable}
                onClick={() => openDay(cell.day)}
                className={cn(
                  "flex min-h-[72px] flex-col items-start rounded-xl border border-transparent p-2 text-left text-sm transition-colors duration-300 ease-out",
                  v === "empty" && "bg-card text-muted-foreground hover:bg-accent",
                  v === "done" &&
                    "border-emerald-500/40 bg-emerald-500/10 text-foreground hover:bg-emerald-500/15",
                  v === "failed" &&
                    "border-red-500/40 bg-red-500/10 text-foreground hover:bg-red-500/15",
                  v === "today" && "border-primary/50 bg-primary/10 ring-1 ring-primary/50",
                  v === "future" && "cursor-not-allowed opacity-30",
                  clickable && "hover:brightness-110"
                )}
              >
                <span
                  className={cn(
                    "flex size-7 items-center justify-center rounded-full text-sm font-medium",
                    v === "today"
                      ? "bg-primary font-bold text-primary-foreground shadow-md shadow-primary/40"
                      : "",
                    v === "future" && "text-muted-foreground"
                  )}
                >
                  {cell.day}
                </span>
                <span className="mt-auto inline-flex size-2 rounded-full bg-transparent">
                  {v === "done" ? (
                    <span className="size-2 rounded-full bg-emerald-500" />
                  ) : null}
                  {v === "failed" ? (
                    <span className="size-2 rounded-full bg-red-500" />
                  ) : null}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <DaySheet
        open={sheetOpen}
        onOpenChange={(o) => {
          setSheetOpen(o);
          if (!o) {
            // Recarrega o calendário ao fechar para refletir mudanças
            startTransition(async () => {
              const days = await getDaysInMonth(
                viewMonth.getFullYear(),
                viewMonth.getMonth()
              );
              const map: Record<string, string> = {};
              for (const d of days) map[d.date] = d.status;
              setDayStatusMap(map);
            });
          }
        }}
        dateLabel={selectedDate ? formatSheetTitle(selectedDate) : ""}
        date={selectedDate}
        mode={sheetMode}
        viewMeta={viewMeta}
      />
    </div>
  );
}
