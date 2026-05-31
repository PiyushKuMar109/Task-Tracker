const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteUser() {
  try {
    const email = 'admin2@gmail.com';
    
    // Find the user first
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.log('User not found with email:', email);
      return;
    }

    console.log('Found user:', user);

    // Check if user has tasks or comments
    const taskCount = await prisma.task.count({
      where: {
        OR: [
          { createdById: user.id },
          { assignedToId: user.id }
        ]
      }
    });

    const commentCount = await prisma.comment.count({
      where: { createdById: user.id }
    });

    if (taskCount > 0 || commentCount > 0) {
      console.log('Cannot delete user with associated tasks or comments');
      console.log('Tasks:', taskCount, 'Comments:', commentCount);
      return;
    }

    // Delete the user
    await prisma.user.delete({
      where: { id: user.id }
    });

    console.log('User deleted successfully');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteUser();
