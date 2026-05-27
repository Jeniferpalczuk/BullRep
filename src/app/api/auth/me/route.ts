import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const bearerToken = authHeader?.replace('Bearer ', '');
    const cookieToken = req.cookies.get('bullrep_token')?.value;
    const token = bearerToken || cookieToken;

    if (!token) {
      return NextResponse.json({ error: 'Token n�o fornecido.' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Token inv�lido ou expirado.' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usu�rio n�o encontrado.' }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        weight: user.weight,
        height: user.height,
        goal: user.goal,
        fitness_level: user.fitnessLevel,
        frequency: user.frequency,
        avatar_url: user.avatarUrl,
        app_level: user.appLevel,
        xp: user.xp,
        is_admin: user.isAdmin,
      },
    });
  } catch (err) {
    console.error('[API] me error:', err);
    return NextResponse.json(
      { error: 'Erro ao buscar perfil.' },
      { status: 500 }
    );
  }
}
