// Script to set Admin@admin.com as admin
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL not set');
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const result = await prisma.user.updateMany({
    where: { email: 'admin@admin.com' },
    data: { isAdmin: true },
  });

  console.log(`Updated ${result.count} user(s) to admin.`);

  const admins = await prisma.user.findMany({
    where: { isAdmin: true },
    select: { id: true, email: true, name: true, isAdmin: true },
  });

  console.log('Current admins:', admins);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
