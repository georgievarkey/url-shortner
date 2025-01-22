import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create test users
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: await bcrypt.hash('admin123', 10),
      role: 'ADMIN',
    },
  });

  const testUser = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      name: 'Test User',
      password: await bcrypt.hash('user123', 10),
      role: 'USER',
    },
  });

  // Create some test URLs
  const urls = [
    {
      longUrl: 'https://example.com/page1',
      shortUrl: 'test1',
      userId: testUser.id,
    },
    {
      longUrl: 'https://example.com/page2',
      shortUrl: 'test2',
      userId: testUser.id,
    },
    {
      longUrl: 'https://example.com/admin',
      shortUrl: 'admin1',
      userId: adminUser.id,
    },
  ];

  for (const url of urls) {
    await prisma.urlMapping.upsert({
      where: { shortUrl: url.shortUrl },
      update: {},
      create: url,
    });
  }

  console.log('Seeding completed successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
