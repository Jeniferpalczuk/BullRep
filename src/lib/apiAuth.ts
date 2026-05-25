import { NextRequest } from 'next/server';

import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function getAuthenticatedUser(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const bearerToken = authHeader?.replace('Bearer ', '');
  const cookieToken = req.cookies.get('bullrep_token')?.value;
  const token = bearerToken || cookieToken;

  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload) return null;

  return prisma.user.findUnique({
    where: { id: payload.userId },
  });
}
