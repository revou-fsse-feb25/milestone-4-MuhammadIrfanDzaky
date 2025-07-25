import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    
    // Create admin user
    const admin = await prisma.user.create({
        data: {
        email: 'admin@revobank.com',
        password: await bcrypt.hash('admin123', 10),
        name: 'Admin',
        role: 'ADMIN',
        },
    });

    // Create customer user
    const customer = await prisma.user.create({
        data: {
        email: 'customer@example.com',
        password: await bcrypt.hash('password123', 10),
        name: 'John Doe',
        role: 'CUSTOMER',
        },
    });

    // Create accounts
    const adminAccount = await prisma.account.create({
        data: {
        accountNumber: 'ADMIN001',
        type: 'CHECKING',
        userId: admin.id,
        },
    });

    const savingsAccount = await prisma.account.create({
        data: {
        accountNumber: 'SAV001',
        type: 'SAVINGS',
        userId: customer.id,
        },
    });

    const checkingAccount = await prisma.account.create({
        data: {
        accountNumber: 'CHK001',
        type: 'CHECKING',
        userId: customer.id,
        },
    });

    // Create sample transactions
    await prisma.transaction.createMany({
        data: [
            {
            amount: 10000000n, // Rp.10.000.000
            type: 'DEPOSIT',
            status: 'COMPLETED',
            toAccountId: savingsAccount.id,
            },
            {
            amount: 500000n, // Rp.500.000
            type: 'TRANSFER',
            status: 'COMPLETED',
            fromAccountId: savingsAccount.id,
            toAccountId: checkingAccount.id,
            },
            {
            amount: 2000000n, // Rp.2.000.000
            type: 'WITHDRAWAL',
            status: 'PENDING',
            fromAccountId: checkingAccount.id,
            }
        ],
    });

    console.log('Database seeded successfully');
}

main()
    .then(() => {
        console.log('Seeding completed successfully');
    })
    .catch((e) => {
        console.error('Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        console.log('Prisma disconnected');
    });