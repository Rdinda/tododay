"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { recordPomodoro } from "@/lib/day-actions";

const POMODORO_DURATION = 25 * 60; // 25 minutos em segundos
const SHORT_BREAK = 5 * 60;        // 5 minutos em segundos

export type PomodoroPhase = "idle" | "running" | "paused" | "break";

export type PomodoroTimerProps = {
  dayId?: string;
  taskId?: string | null;
  /** Quantos pomodoros já foram feitos hoje (vindos do banco) */
  initialPomodoros?: number;
  className?: string;
};

// SVG Icons
function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="6 3 20 12 6 21 6 3"></polygon>
    </svg>
  );
}

function PauseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="4" width="4" height="16"></rect>
      <rect x="14" y="4" width="4" height="16"></rect>
    </svg>
  );
}

function SkipForwardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="5 4 15 12 5 20 5 4"></polygon>
      <line x1="19" y1="5" x2="19" y2="19"></line>
    </svg>
  );
}

function CoffeeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
      <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
      <line x1="6" y1="1" x2="6" y2="4"></line>
      <line x1="10" y1="1" x2="10" y2="4"></line>
      <line x1="14" y1="1" x2="14" y2="4"></line>
    </svg>
  );
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function PomodoroTimer({
  dayId,
  taskId,
  initialPomodoros = 0,
  className,
}: PomodoroTimerProps) {
  const [phase, setPhase] = useState<PomodoroPhase>("idle");
  const [timeLeft, setTimeLeft] = useState(POMODORO_DURATION);
  const [totalDuration, setTotalDuration] = useState(POMODORO_DURATION);
  const [pomodorosToday, setPomodorosToday] = useState(initialPomodoros);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startTick = useCallback(() => {
    clearTimer();
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [clearTimer]);

  // Detecta quando o tempo zera para avançar de fase
  useEffect(() => {
    if (timeLeft > 0) return;

    if (phase === "running") {
      // Pomodoro concluído!
      setPomodorosToday((p) => p + 1);
      if (dayId) {
        recordPomodoro(dayId, taskId ?? null, 25).catch(console.error);
      }
      // Inicia pausa automática
      setPhase("break");
      setTotalDuration(SHORT_BREAK);
      setTimeLeft(SHORT_BREAK);
      startTick();
    } else if (phase === "break") {
      // Pausa concluída, volta para idle
      setPhase("idle");
      setTotalDuration(POMODORO_DURATION);
      setTimeLeft(POMODORO_DURATION);
    }
  }, [timeLeft, phase, dayId, taskId, startTick]);

  // Cleanup na desmontagem
  useEffect(() => () => clearTimer(), [clearTimer]);

  function handleStart() {
    setPhase("running");
    startTick();
  }

  function handlePause() {
    setPhase("paused");
    clearTimer();
  }

  function handleResume() {
    setPhase("running");
    startTick();
  }

  function handleSkip() {
    clearTimer();
    if (phase === "break") {
      // Pular pausa → volta para idle
      setPhase("idle");
      setTotalDuration(POMODORO_DURATION);
      setTimeLeft(POMODORO_DURATION);
    } else {
      // Pular pomodoro → vai para pausa sem contar
      setPhase("break");
      setTotalDuration(SHORT_BREAK);
      setTimeLeft(SHORT_BREAK);
      startTick();
    }
  }

  const progressValue = totalDuration > 0
    ? Math.round(((totalDuration - timeLeft) / totalDuration) * 100)
    : 0;

  const headerLabel = {
    idle: "pronto",
    running: "em andamento",
    paused: "pausado",
    break: "pausa",
  }[phase];

  return (
    <div className={cn("flex flex-col rounded-2xl border border-border bg-[#141414] p-6 duration-300 ease-out", className)}>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase">
          {phase === "running" && <span className="size-2 rounded-full bg-primary animate-pulse" />}
          {phase === "break" && <CoffeeIcon className="size-3.5 text-emerald-500" />}

          <span
            className={cn(
              "text-muted-foreground",
              phase === "running" && "text-primary",
              phase === "paused" && "text-yellow-500",
              phase === "break" && "text-emerald-500"
            )}
          >
            {headerLabel}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">🍅 {pomodorosToday}</span>
      </div>

      {/* Timer */}
      <div className="mb-6 text-center">
        <span className={cn(
          "text-5xl font-bold tabular-nums tracking-tight text-foreground transition-colors",
          phase === "break" && "text-emerald-400",
          phase === "paused" && "text-yellow-400",
        )}>
          {formatTime(timeLeft)}
        </span>
        <p className="mt-1 text-xs text-muted-foreground">
          {phase === "break" ? "pausa curta" : "pomodoro"}
        </p>
      </div>

      {/* Progress */}
      <Progress
        value={progressValue}
        className={cn(
          "mb-8 h-1.5 w-full bg-surface-2",
          phase === "break"
            ? "[&_[data-slot=progress-indicator]]:bg-emerald-500"
            : "[&_[data-slot=progress-indicator]]:bg-primary",
          phase === "running" && "[&_[data-slot=progress-indicator]]:transition-all [&_[data-slot=progress-indicator]]:duration-1000",
        )}
      />

      {/* Buttons */}
      <div className="flex items-center justify-center gap-3">
        {phase === "idle" && (
          <Button
            type="button"
            variant="default"
            className="h-10 rounded-lg bg-primary px-6 text-white hover:bg-primary/90"
            onClick={handleStart}
          >
            <PlayIcon className="mr-2 size-4 fill-current" />
            Iniciar
          </Button>
        )}

        {phase === "running" && (
          <>
            <Button
              type="button"
              variant="default"
              className="h-10 rounded-lg bg-primary px-6 text-white hover:bg-primary/90"
              onClick={handlePause}
            >
              <PauseIcon className="mr-2 size-4 fill-current" />
              Pausar
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-lg border-border px-6 text-foreground hover:bg-surface-2"
              onClick={handleSkip}
            >
              <SkipForwardIcon className="mr-2 size-4" />
              Pular
            </Button>
          </>
        )}

        {phase === "paused" && (
          <>
            <Button
              type="button"
              variant="default"
              className="h-10 rounded-lg bg-primary px-6 text-white hover:bg-primary/90"
              onClick={handleResume}
            >
              <PlayIcon className="mr-2 size-4 fill-current" />
              Retomar
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-lg border-border px-6 text-foreground hover:bg-surface-2"
              onClick={handleSkip}
            >
              <SkipForwardIcon className="mr-2 size-4" />
              Pular
            </Button>
          </>
        )}

        {phase === "break" && (
          <Button
            type="button"
            variant="default"
            className="h-10 rounded-lg bg-emerald-500 px-6 text-white hover:bg-emerald-600"
            onClick={handleSkip}
          >
            <SkipForwardIcon className="mr-2 size-4" />
            Pular pausa
          </Button>
        )}
      </div>
    </div>
  );
}
