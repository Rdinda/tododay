"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const SESSION_COOKIE = "tododay_session";

import { prisma } from "@/lib/prisma";

export async function loginWithPasscode(formData: FormData) {
  const submittedPasscode = String(formData.get("passcode") ?? "");
  console.log("LOGIN TENTATIVA - Passcode submetido:", submittedPasscode);

  // Busca o usuário pelo passcode
  const user = await prisma.user.findFirst({
    where: { passcodeHash: submittedPasscode },
  });

  if (!user) {
    redirect("/login?error=1");
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, user.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  redirect("/app");
}

export async function requestInvite(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!email || !email.includes("@")) {
    return { error: "E-mail inválido." };
  }

  // Verifica se o e-mail já existe
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return { error: "E-mail já registrado. Faça login com seu passcode." };
  }

  // Gera passcode de 6 dígitos aleatórios
  const passcode = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    await prisma.user.create({
      data: {
        email,
        passcodeHash: passcode,
        name: email.split("@")[0], // Nome default baseado no e-mail
      },
    });

    return { passcode };
  } catch (error) {
    console.error("Failed to create invite:", error);
    return { error: "Erro ao gerar convite. Tente novamente." };
  }
}
