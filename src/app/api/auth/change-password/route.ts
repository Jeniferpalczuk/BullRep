import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

import { getAuthenticatedUser } from '@/lib/apiAuth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getAuthenticatedUser(req);
    if (!currentUser) {
      return NextResponse.json({ error: 'Nao autenticado.' }, { status: 401 });
    }

    const body = await req.json();
    const currentPassword = typeof body?.currentPassword === 'string' ? body.currentPassword : '';
    const newPassword = typeof body?.newPassword === 'string' ? body.newPassword : '';

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Senha atual e nova senha sao obrigatorias.' }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'A nova senha deve ter pelo menos 8 caracteres.' }, { status: 400 });
    }

    const valid = await bcrypt.compare(currentPassword, currentUser.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: 'Senha atual incorreta.' }, { status: 401 });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: currentUser.id },
      data: { passwordHash },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[API] change-password error:', err);
    return NextResponse.json({ error: 'Erro ao alterar senha.' }, { status: 500 });
  }
}
