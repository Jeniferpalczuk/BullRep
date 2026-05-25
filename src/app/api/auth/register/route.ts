import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, weight, height, goal, fitness_level, frequency, avatar_url } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Nome, e-mail e senha são obrigatórios.' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'A senha deve ter pelo menos 8 caracteres.' },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (existing) {
      return NextResponse.json(
        { error: 'Este e-mail já está cadastrado.' },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        passwordHash,
        name: name.trim(),
        weight: weight ? Number(weight) : null,
        height: height ? Number(height) : null,
        goal: goal || null,
        fitnessLevel: fitness_level || null,
        frequency: frequency || null,
        avatarUrl: typeof avatar_url === 'string' ? avatar_url.trim() : null,
      } as never,
    });

    
    const token = await signToken({ userId: user.id, email: user.email });

    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        weight: user.weight,
        height: user.height,
        goal: user.goal,
        fitness_level: user.fitnessLevel,
        frequency: user.frequency,
        avatar_url: typeof avatar_url === 'string' ? avatar_url : null,
        app_level: user.appLevel,
        xp: user.xp,
      },
    });

    response.cookies.set({
      name: 'bullrep_token',
      value: token,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (err) {
    console.error('[API] register error:', err);
    const message = err instanceof Error ? err.message : 'Erro interno ao criar conta. Tente novamente.';
    return NextResponse.json(
      { error: process.env.NODE_ENV === 'development' ? message : 'Erro interno ao criar conta. Tente novamente.' },
      { status: 500 }
    );
  }
}
