import { NextRequest, NextResponse } from 'next/server';

import { getAuthenticatedUser } from '@/lib/apiAuth';
import { prisma } from '@/lib/prisma';

function mapUser(user: {
  id: string;
  email: string;
  name: string;
  weight: number | null;
  height: number | null;
  goal: string | null;
  fitnessLevel: string | null;
  frequency: string | null;
  avatarUrl: string | null;
  appLevel: number;
  xp: number;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    weight: user.weight,
    height: user.height,
    goal: user.goal,
    fitness_level: user.fitnessLevel,
    frequency: user.frequency,
    avatar_url: user.avatarUrl,
    is_admin: false,
    app_level: user.appLevel,
    xp: user.xp,
    created_at: user.createdAt.toISOString(),
    updated_at: user.updatedAt.toISOString(),
  };
}

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Nao autenticado.' }, { status: 401 });
  }

  return NextResponse.json({ profile: mapUser(user) });
}

export async function PATCH(req: NextRequest) {
  try {
    const currentUser = await getAuthenticatedUser(req);
    if (!currentUser) {
      return NextResponse.json({ error: 'Nao autenticado.' }, { status: 401 });
    }

    const body = await req.json();
    const weight = body.weight == null ? null : Number(body.weight);
    const height = body.height == null ? null : Number(body.height);

    if (weight != null && !Number.isFinite(weight)) {
      return NextResponse.json({ error: 'Peso invalido.' }, { status: 400 });
    }
    if (height != null && !Number.isFinite(height)) {
      return NextResponse.json({ error: 'Altura invalida.' }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        name: typeof body.name === 'string' ? body.name.trim() : currentUser.name,
        weight,
        height,
        goal: typeof body.goal === 'string' ? body.goal : null,
        fitnessLevel: typeof body.fitness_level === 'string' ? body.fitness_level : null,
        frequency: typeof body.frequency === 'string' ? body.frequency : null,
        avatarUrl: typeof body.avatar_url === 'string' ? body.avatar_url : currentUser.avatarUrl,
      },
    });

    return NextResponse.json({ profile: mapUser(user) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao atualizar perfil.' },
      { status: 500 }
    );
  }
}
