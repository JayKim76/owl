const { PrismaClient } = require('@prisma/client');
const { randomBytes, scryptSync } = require('crypto');

const prisma = new PrismaClient();

function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

async function main() {
  const password = process.env.ADMIN_PASSWORD;

  if (!password) {
    throw new Error('ADMIN_PASSWORD is missing in .env');
  }

  await prisma.adminUser.upsert({
    where: { username: 'admin' },
    update: {
      passwordHash: hashPassword(password),
      isActive: true,
    },
    create: {
      username: 'admin',
      passwordHash: hashPassword(password),
      isActive: true,
    },
  });

  console.log('Admin user upserted: username=admin');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
