import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';

import { prisma } from '@/lib/prisma';

function generateRandomPassword(length = 10): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
  let password = '';

  for (let i = 0; i < length; i += 1) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }

  return password;
}

async function sendNewPasswordEmail(email: string, newPassword: string) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM ?? user;

  if (!host || !user || !pass || !from) {
    throw new Error('SMTP_NOT_CONFIGURED');
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from,
    to: email,
    subject: 'BullRep - Nova senha de acesso',
    text: `Sua nova senha temporaria e: ${newPassword}\n\nRecomendamos alterar essa senha apos entrar no sistema.`,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = typeof body?.email === 'string' ? body.email.toLowerCase().trim() : '';

    if (!email) {
      return NextResponse.json({ error: 'Informe o e-mail cadastrado.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ error: 'Nenhuma conta encontrada para esse e-mail.' }, { status: 404 });
    }

    const newPassword = generateRandomPassword();
    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    await sendNewPasswordEmail(user.email, newPassword);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[API] forgot-password error:', err);
    if (err instanceof Error && err.message === 'SMTP_NOT_CONFIGURED') {
      return NextResponse.json(
        { error: 'Recuperacao indisponivel: configure SMTP no .env.' },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'Nao foi possivel recuperar a senha. Tente novamente.' },
      { status: 500 }
    );
  }
}
