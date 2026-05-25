import { NextRequest, NextResponse } from 'next/server';

import { getAuthenticatedUser } from '@/lib/apiAuth';
import { prisma } from '@/lib/prisma';

type SessionExerciseInput = {
  exerciseId?: string | null;
  name: string;
  setsDone?: number;
  repsDone?: number;
  weight?: number;
  orderIndex?: number;
};

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Nao autenticado.' }, { status: 401 });
  }

  const { id } = await params;

  const session = await prisma.trainingSession.findFirst({
    where: { id, userId: user.id },
    select: { id: true },
  });

  if (!session) {
    return NextResponse.json({ error: 'Sessao nao encontrada.' }, { status: 404 });
  }

  await prisma.trainingSession.delete({
    where: { id: session.id },
  });

  return NextResponse.json({ ok: true });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Nao autenticado.' }, { status: 401 });
  }

  const { id } = await params;

  const session = await prisma.trainingSession.findFirst({
    where: { id, userId: user.id },
    select: { id: true },
  });

  if (!session) {
    return NextResponse.json({ error: 'Sessao nao encontrada.' }, { status: 404 });
  }

  try {
    const body = await req.json();

    // Begin a transaction to update training session and replace its exercises
    const updatedSession = await prisma.$transaction(async (tx) => {
      // 1. Update session details
      if (body.trainingType || body.notes) {
        await tx.trainingSession.update({
          where: { id: session.id },
          data: {
            trainingType: body.trainingType,
            notes: body.notes,
            durationMin: body.durationMin,
          },
        });
      }

      // 2. Refresh exercises if provided
      if (Array.isArray(body.exercises)) {
        await tx.trainingSessionExercise.deleteMany({
          where: { sessionId: session.id },
        });

        if (body.exercises.length > 0) {
          await tx.trainingSessionExercise.createMany({
            data: body.exercises.map((ex: SessionExerciseInput) => ({
              sessionId: session.id,
              exerciseId: ex.exerciseId || null,
              name: ex.name,
              setsDone: ex.setsDone || 1,
              repsDone: ex.repsDone || 1,
              weight: ex.weight || 0,
              orderIndex: ex.orderIndex || 0,
            })),
          });
        }
      }

      // Return updated info
      return tx.trainingSession.findUnique({
        where: { id: session.id },
        include: { exercises: true },
      });
    });

    return NextResponse.json({ data: updatedSession });
  } catch (error) {
    console.error('Error updating session:', error);
    return NextResponse.json({ error: 'Erro ao atualizar sessao.' }, { status: 500 });
  }
}
