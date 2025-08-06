# RevoBank 
A fictional financial institution

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)](https://prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

A secure banking API with JWT authentication, account management, and transaction processing.

## Features

- 🔐 **JWT Authentication** (Login/Logout)
- 👥 **User Management** (Registration, Profile)
- 💳 **Account Operations** (Create accounts, check balances)
- 🔄 **Transaction Processing** (Transfers between accounts)
- 🛡️ **Password Hashing** with bcrypt
- ✅ **Data Validation** with class-validator
- 📊 **Prisma ORM** for PostgreSQL interactions

## Tech Stack

| Component               | Technology                          |
|-------------------------|-------------------------------------|
| **Framework**           | NestJS                              |
| **Database**            | PostgreSQL                          |
| **ORM**                 | Prisma                              |
| **Authentication**      | Passport.js + JWT                   |
| **Password Hashing**    | bcrypt                              |
| **API Testing**         | Postman                             |

## Prerequisites

- Node.js v18+
- PostgreSQL 15+
- npm/npx
- Postman (for API testing)

## Setup Instructions

### 1. Clone repository
```bash
git clone https://github.com/revou-fsse-feb25/milestone-4-MuhammadIrfanDzaky.git
cd milestone-4-MuhammadIrfanDzaky
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
create `.env` file:
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/db_name?schema=public"
JWT_SECRET="your-strong-secret-key"
JWT_EXPIRATION="1d"
```

### 4. Set up database
- Run Prisma migrations to build the DB schema.
```bash
npx prisma migrate dev --name init
```
- Generate prisma client
```bash
npx prisma generate
```

### 5. Seed initial data
```bash
npx prisma db seed
```

### 6. Run the Application
- Development Mode (Watch Mode):
```bash
npm run start:dev
```
- Production Build:
```bash
npm run build
npm run start:prod
```

## API Endpoints
| Endpoint         | Method | Description            | Auth Required |
|------------------|--------|------------------------|---------------|
| `/auth/register` | `POST` | Register new user      | No            |
| `/auth/login`    | `POST` | Login with credentials | NO            |