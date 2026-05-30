const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  // Create SUPER_ADMIN user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@tasktracker.com' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'superadmin@tasktracker.com',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      tenantId: 'system',
    },
  });

  console.log('SUPER_ADMIN user created:');
  console.log('Email: superadmin@tasktracker.com');
  console.log('Password: admin123');
  console.log('ID:', superAdmin.id);
  console.log('Tenant ID:', superAdmin.tenantId);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
