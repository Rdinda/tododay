"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export type EncerrarDiaDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm?: (status: "DONE" | "FAILED", note: string) => Promise<void>;
};

export function EncerrarDiaDialog({
  open,
  onOpenChange,
  onConfirm,
}: EncerrarDiaDialogProps) {
  const [note, setNote] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleConfirm(status: "DONE" | "FAILED") {
    if (!onConfirm) return;
    startTransition(async () => {
      await onConfirm(status, note);
      setNote("");
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-xl" showCloseButton>
        <DialogHeader>
          <DialogTitle>Encerrar o dia?</DialogTitle>
          <DialogDescription>
            Você concluiu suas missões principais hoje?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="encerrar-nota">
            Nota (opcional):
          </label>
          <Textarea
            id="encerrar-nota"
            maxLength={280}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="min-h-[88px] rounded-xl"
            placeholder="Como foi seu dia?"
            disabled={isPending}
          />
          <p className="text-right text-xs text-muted-foreground tabular-nums">
            {note.length}/280
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            type="button"
            className="h-11 w-full rounded-xl bg-emerald-600 text-white hover:bg-emerald-600/90"
            disabled={isPending}
            onClick={() => handleConfirm("DONE")}
          >
            {isPending ? "Salvando…" : "✅ Sim, concluí!"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-11 w-full rounded-xl border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300"
            disabled={isPending}
            onClick={() => handleConfirm("FAILED")}
          >
            ❌ Não desta vez
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
