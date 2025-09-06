import prisma from './src/utils/database.js';
import bcrypt from 'bcryptjs';

const checkAndCreateAdmin = async () => {
  try {
    // Check if any admin exists
    const adminCount = await prisma.admin.count();
    console.log('Admin count:', adminCount);
    
    if (adminCount === 0) {
      console.log('No admins found. Creating default admin...');
      
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const admin = await prisma.admin.create({
        data: {
          username: 'admin',
          email: 'admin@feiraja.com',
          password: hashedPassword
        }
      });
      
      console.log('Admin created:', { username: admin.username, email: admin.email });
      console.log('Use username: admin, password: admin123');
    } else {
      // Show existing admins
      const admins = await prisma.admin.findMany({
        select: { username: true, email: true }
      });
      console.log('Existing admins:', admins);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
};

checkAndCreateAdmin();