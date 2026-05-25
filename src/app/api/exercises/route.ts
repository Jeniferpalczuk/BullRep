import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const muscleGroup = searchParams.get('muscleGroup');
  const name = searchParams.get('name');

  const data = await prisma.exercise.findMany({
    where: {
      ...(muscleGroup ? { muscleGroup } : {}),
      ...(name ? { name: { equals: name, mode: 'insensitive' as const } } : {}),
    },
    orderBy: [{ muscleGroup: 'asc' }, { name: 'asc' }],
  });

  return NextResponse.json({ data });
}
