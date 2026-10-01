import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const usersData = [
  {
    name: 'Front Officer',
    email: 'frontofficer@gmail.com',
    role: UserRole.FRONT_OFFICER,
  },
  {
    name: 'Verificator',
    email: 'verificator@gmail.com',
    role: UserRole.VERIFICATOR,
  },
  {
    name: 'Head Administrative Office',
    email: 'headadministrativeoffice@gmail.com',
    role: UserRole.HEAD_OF_ADMINISTRATIVE_OFFICE,
  },
  {
    name: 'Head Office',
    email: 'headoffice@gmail.com',
    role: UserRole.HEAD_OF_OFFICE,
  },
  {
    name: 'Delivery Officer',
    email: 'deliveryofficer@gmail.com',
    role: UserRole.DELIVERY_OFFICER,
  },
  {
    name: 'Central Officer',
    email: 'centralofficer@gmail.com',
    role: UserRole.CENTRAL_OFFICER,
  },
];

async function main() {
  const validRoles = [
    'FRONT_OFFICER',
    'VERIFICATOR',
    'HEAD_OF_ADMINISTRATIVE_OFFICE',
    'HEAD_OF_OFFICE',
    'DELIVERY_OFFICER',
    'CENTRAL_OFFICER',
  ];

  await prisma.$runCommandRaw({
    delete: 'User',
    deletes: [
      {
        q: { role: { $nin: validRoles } },
        limit: 0,
      },
    ],
  });

  const passwordHash = await bcrypt.hash('password123', 10);

  for (const userData of usersData) {
    await prisma.user.upsert({
      where: { email: userData.email },
      update: {
        name: userData.name,
        role: userData.role,
        passwordHash,
        isActive: true,
      },
      create: {
        name: userData.name,
        email: userData.email,
        passwordHash,
        role: userData.role,
        isActive: true,
      },
    });
  }

  console.log('Seeded 6 users successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
