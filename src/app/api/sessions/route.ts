import { NextRequest, NextResponse } from 'next/server';

import { getAuthenticatedUser } from '@/lib/apiAuth';
import { prisma } from '@/lib/prisma';

function mapSession(session: {
  id: string;
  userId: string;
  date: Date;
  trainingType: string;
  notes: string | null;
  durationMin: number | null;
  exercises: Array<{
    id: string;
    sessionId: string;
    exerciseId: string | null;
    name: string;
    setsDone: number;
    repsDone: number;
    weight: number;
    orderIndex: number;
  }>;
}) {
  return {
    id: session.id,
    user_id: session.userId,
    date: session.date.toISOString().slice(0, 10),
    training_type: session.trainingType,
    notes: session.notes,
    duration_min: session.durationMin,
    exercises: session.exercises.map((exercise) => ({
      id: exercise.id,
      session_id: exercise.sessionId,
      exercise_id: exercise.exerciseId,
      name: exercise.name,
      sets_done: exercise.setsDone,
      reps_done: exercise.repsDone,
      weight: exercise.weight,
      order_index: exercise.orderIndex,
    })),
  };
}

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Nao autenticado.' }, { status: 401 });
  }

  const sessions = await prisma.trainingSession.findMany({
    where: { userId: user.id },
    include: {
      exercises: {
        orderBy: { orderIndex: 'asc' },
      },
    },
    orderBy: { date: 'desc' },
  });

  return NextResponse.json({ data: sessions.map(mapSession) });
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Nao autenticado.' }, { status: 401 });
    }

    const body = await req.json();
    const exercises = Array.isArray(body.exercises) ? body.exercises : [];

    if (exercises.length === 0) {
      return NextResponse.json({ error: 'Adicione pelo menos um exercicio.' }, { status: 400 });
    }

    const session = await prisma.trainingSession.create({
      data: {
        userId: user.id,
        trainingType: body.trainingType || 'Livre',
        notes: body.notes || null,
        durationMin: body.durationMin == null ? null : Number(body.durationMin),
        date: new Date(),
        exercises: {
          create: exercises.map(
            (
              exercise: {
                exerciseId?: string | null;
                name: string;
                setsDone: number;
                repsDone: number;
                weight: number;
                orderIndex?: number;
              },
              index: number
            ) => ({
              exerciseId: exercise.exerciseId ?? null,
              name: exercise.name,
              setsDone: Number(exercise.setsDone),
              repsDone: Number(exercise.repsDone),
              weight: Number(exercise.weight),
              orderIndex: exercise.orderIndex ?? index,
            })
          ),
        },
      },
      include: {
        exercises: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    return NextResponse.json({ data: mapSession(session) });
  } catch (err) {
    console.error('[API] sessions create error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erro interno ao salvar treino.' },
      { status: 500 }
    );
  }
}
