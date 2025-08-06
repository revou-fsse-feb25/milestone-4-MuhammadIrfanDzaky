import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../prisma/prisma.service';

describe('RevoBank API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let accountId1: number;
  let accountId2: number;

  const TEST_RUN_ID = Date.now();
  const TEST_EMAIL_BASE = `testuser-${TEST_RUN_ID}`;
  const ANOTHER_EMAIL = `anotheruser-${TEST_RUN_ID}@revobank.com`;

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${authToken}`,
  });

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    const prismaService = app.get(PrismaService);
    prismaService.enableShutdownHooks(app);

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      })
    );
    await app.init();

    prisma = app.get(PrismaService);
    // Reset sequences before starting
    await prisma.$executeRaw`ALTER SEQUENCE "User_id_seq" RESTART WITH 1;`;
    await prisma.$executeRaw`ALTER SEQUENCE "Account_id_seq" RESTART WITH 1;`;
    await prisma.$executeRaw`ALTER SEQUENCE "Transaction_id_seq" RESTART WITH 1;`;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Authentication', () => {
    beforeEach(async () => {
      await prisma.$executeRaw`BEGIN TRANSACTION;`;
    });

    afterEach(async () => {
      await prisma.$executeRaw`ROLLBACK;`;
    });

    it('should register a new user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `${TEST_EMAIL_BASE}-auth@revobank.com`,
          password: 'SecurePass123!',
          name: 'Test User',
        })
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(Number),
        email: `${TEST_EMAIL_BASE}-auth@revobank.com`,
        name: 'Test User',
      });
    });

    it('should login and get access token', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: `${TEST_EMAIL_BASE}-auth@revobank.com`,
          password: 'SecurePass123!',
        })
        .expect(200);

      expect(response.body).toEqual({
        access_token: expect.any(String),
        userId: expect.any(Number),
      });

      authToken = response.body.access_token;
    });
  });

  describe('Account Management', () => {
    beforeEach(async () => {
      await prisma.$executeRaw`BEGIN TRANSACTION;`;
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `${TEST_EMAIL_BASE}-account@revobank.com`,
          password: 'SecurePass123!',
          name: 'Test User',
        })
        .expect(201);

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: `${TEST_EMAIL_BASE}-account@revobank.com`,
          password: 'SecurePass123!',
        })
        .expect(200);

      authToken = loginResponse.body.access_token;
    });

    afterEach(async () => {
      await prisma.$executeRaw`ROLLBACK;`;
    });

    it('should create a savings account', async () => {
      const accountResponse = await request(app.getHttpServer())
        .post('/accounts')
        .set(getAuthHeaders())
        .send({ type: 'SAVINGS' })
        .expect(201);

      accountId1 = accountResponse.body.id;
      expect(accountResponse.body.accountNumber).toMatch(/^REVO\d{6}$/);
      expect(accountResponse.body.balanceRaw).toBe('0');
    });

    it('should create a checking account', async () => {
      const response = await request(app.getHttpServer())
        .post('/accounts')
        .set(getAuthHeaders())
        .send({ type: 'CHECKING' })
        .expect(201);

      accountId2 = response.body.id;
      expect(response.body.accountNumber).toMatch(/^REVO\d{6}$/);
      expect(response.body.balanceRaw).toBe('0');
    });

    it('should get user accounts', async () => {
      await request(app.getHttpServer())
        .post('/accounts')
        .set(getAuthHeaders())
        .send({ type: 'SAVINGS' })
        .expect(201);

      await request(app.getHttpServer())
        .post('/accounts')
        .set(getAuthHeaders())
        .send({ type: 'CHECKING' })
        .expect(201);

      const response = await request(app.getHttpServer())
        .get('/accounts/my-accounts')
        .set(getAuthHeaders())
        .expect(200);

      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            accountNumber: expect.stringMatching(/^REVO\d{6}$/),
            type: 'SAVINGS',
            balanceRaw: '0',
          }),
          expect.objectContaining({
            accountNumber: expect.stringMatching(/^REVO\d{6}$/),
            type: 'CHECKING',
            balanceRaw: '0',
          }),
        ])
      );
    });
  });

  describe('Transactions', () => {
    let testCounter = 0;

    beforeEach(async () => {
      await prisma.$executeRaw`BEGIN TRANSACTION;`;
      try {
        const uniqueEmail = `${TEST_EMAIL_BASE}-trans-${testCounter}@revobank.com`;
        testCounter++;

        await request(app.getHttpServer())
          .post('/auth/register')
          .send({
            email: uniqueEmail,
            password: 'SecurePass123!',
            name: 'Test User',
          })
          .expect(201);

        const loginResponse = await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: uniqueEmail,
            password: 'SecurePass123!',
          })
          .expect(200);

        authToken = loginResponse.body.access_token;

        const savingsResponse = await request(app.getHttpServer())
          .post('/accounts')
          .set(getAuthHeaders())
          .send({ type: 'SAVINGS' })
          .expect(201);

        accountId1 = savingsResponse.body.id;

        const checkingResponse = await request(app.getHttpServer())
          .post('/accounts')
          .set(getAuthHeaders())
          .send({ type: 'CHECKING' })
          .expect(201);

        accountId2 = checkingResponse.body.id;
      } catch (error) {
        console.error('Error in Transactions beforeEach:', error);
        await prisma.$executeRaw`ROLLBACK;`;
        throw error;
      }
    });

    afterEach(async () => {
      await prisma.$executeRaw`ROLLBACK;`;
    });

    it('should deposit money', async () => {
      const response = await request(app.getHttpServer())
        .post('/transactions/deposit')
        .set(getAuthHeaders())
        .send({
          accountId: accountId1,
          amount: 1000000,
        })
        .expect(201);

      expect(response.body.newBalance).toBe('1000000');
    });

    it('should withdraw money', async () => {
      await request(app.getHttpServer())
        .post('/transactions/deposit')
        .set(getAuthHeaders())
        .send({
          accountId: accountId1,
          amount: 1000000,
        })
        .expect(201);

      const response = await request(app.getHttpServer())
        .post('/transactions/withdraw')
        .set(getAuthHeaders())
        .send({
          accountId: accountId1,
          amount: 200000,
        })
        .expect(201);

      expect(response.body.newBalance).toBe('800000');
    });

    it('should transfer money', async () => {
      await request(app.getHttpServer())
        .post('/transactions/deposit')
        .set(getAuthHeaders())
        .send({
          accountId: accountId1,
          amount: 1000000,
        })
        .expect(201);

      const response = await request(app.getHttpServer())
        .post('/transactions/transfer')
        .set(getAuthHeaders())
        .send({
          fromAccountId: accountId1,
          toAccountId: accountId2,
          amount: 300000,
        })
        .expect(201);

      expect(response.body.amountRaw).toBe('300000');
    });

    it('should get transaction history', async () => {
      await request(app.getHttpServer())
        .post('/transactions/deposit')
        .set(getAuthHeaders())
        .send({
          accountId: accountId1,
          amount: 1000000,
        })
        .expect(201);

      await request(app.getHttpServer())
        .post('/transactions/withdraw')
        .set(getAuthHeaders())
        .send({
          accountId: accountId1,
          amount: 200000,
        })
        .expect(201);

      await request(app.getHttpServer())
        .post('/transactions/transfer')
        .set(getAuthHeaders())
        .send({
          fromAccountId: accountId1,
          toAccountId: accountId2,
          amount: 300000,
        })
        .expect(201);

      const response = await request(app.getHttpServer())
        .get('/transactions/history')
        .query({ accountId: accountId1 })
        .set(getAuthHeaders())
        .expect(200);

      expect(response.body.length).toBe(3);
    });
  });

  describe('Security', () => {
    beforeEach(async () => {
      await prisma.$executeRaw`BEGIN TRANSACTION;`;
    });

    afterEach(async () => {
      await prisma.$executeRaw`ROLLBACK;`;
    });

    it('should prevent accessing accounts without auth token', async () => {
      await request(app.getHttpServer())
        .get('/accounts/my-accounts')
        .expect(401);
    });

    it('should prevent accessing other users accounts', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: ANOTHER_EMAIL,
          password: 'AnotherPass123!',
          name: 'Another User',
        })
        .expect(201);

      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: ANOTHER_EMAIL,
          password: 'AnotherPass123!',
        })
        .expect(200);

      const anotherUserToken = loginRes.body.access_token;

      const response = await request(app.getHttpServer())
        .get('/accounts/my-accounts')
        .set('Authorization', `Bearer ${anotherUserToken}`)
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });
});