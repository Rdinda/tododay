"use client";

import { useState } from "react";

import { loginWithPasscode } from "@/lib/auth/login-action";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="currentColor"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="currentColor"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="currentColor"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

type LoginFormProps = {
  hasError: boolean;
};

export function LoginForm({ hasError }: LoginFormProps) {
  const [emailPathOpen, setEmailPathOpen] = useState(false);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center justify-center px-6 py-10">
      <Card className="w-full border-border bg-card shadow-none">
        <CardContent className="space-y-6 p-6 pt-8">
          <div className="flex flex-col items-center text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="TodoDay logo" width={48} height={48} className="mb-3 shrink-0 rounded-xl bg-white p-1 shadow-sm" />
            <h1 className="text-2xl font-bold tracking-tight">TodoDay</h1>
            <p className="mt-1 text-sm text-muted-foreground">Faça o que importa. Todo dia.</p>
          </div>

          <div className="space-y-4">
            <Button
              type="button"
              variant="default"
              size="lg"
              className="h-12 w-full gap-2 rounded-xl text-base"
              disabled
              title="Em breve"
            >
              <GoogleIcon className="size-5" />
              Entrar com Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Ou</span>
              </div>
            </div>

            <form action={loginWithPasscode} className="space-y-4">
              {hasError ? (
                <p className="rounded-lg border border-destructive/40 bg-destructive/10 p-2 text-sm text-destructive">
                  Passcode inválido.
                </p>
              ) : null}
              <div className="space-y-2 text-center">
                <Label htmlFor="passcode" className="justify-center">Passcode</Label>
                <div className="flex justify-center">
                  <InputOTP maxLength={6} name="passcode" id="passcode">
                    <InputOTPGroup>
                      <InputOTPSlot index={0} className="h-12 w-10 sm:w-12 text-lg" />
                      <InputOTPSlot index={1} className="h-12 w-10 sm:w-12 text-lg" />
                      <InputOTPSlot index={2} className="h-12 w-10 sm:w-12 text-lg" />
                      <InputOTPSlot index={3} className="h-12 w-10 sm:w-12 text-lg" />
                      <InputOTPSlot index={4} className="h-12 w-10 sm:w-12 text-lg" />
                      <InputOTPSlot index={5} className="h-12 w-10 sm:w-12 text-lg" />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>
              <Button type="submit" className="h-10 w-full rounded-xl">
                Acessar
              </Button>
            </form>
          </div>

          <p className="pt-2 text-center text-xs text-muted-foreground">
            Sem cartão de crédito. Sempre grátis.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
