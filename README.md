# 🏦 RevoBank 
A fictional financial institution

## Project Overview
**RevoBank** is a backend system that helps users manage their financial transactions. Built with NestJS and PostgreSQL, it provides secure authentication, expense management, and transfer capabilities between accounts. The system follows RESTful principles and includes comprehensive API documentation.

## Live Demo
- Supabase (Database) : https://vjgrfbdmsrrrcnxrayms.supabase.co
- Railway (Backend) : https://milestone-4-muhammadirfandzaky-production.up.railway.app/
- Swagger : https://milestone-4-muhammadirfandzaky-production.up.railway.app/api

## Tech Stack
| Technology |                                             Feature/Description                                              |
|------------|--------------------------------------------------------------------------------------------------------------|
| NestJS     | Modular backend framework based on TypeScript with Dependency Injection support and an MVC architecture      |
| npm        | Official Node.js package manager for handling dependencies and scripts                                       |
| Prisma     | Type-safe ORM for managing schema definitions, migrations, and database queries                              |
| PostgreSQL | Reliable open-source relational database for structured data storage                                         |
| Postman    | Tool for testing and exploring API endpoints                                                                 |
| JWT        | JSON Web Token–based authentication and authorization scheme                                                 |
| RBAC       | Role-Based Access Control for fine-grained permission management via roles and policies                      |
| Jest       | Unit and integration testing framework with mocking and coverage reporting                                   |
| Swagger    | Interactive API documentation generated from OpenAPI decorators                                              |
| Supabase   | Open-source BaaS that provisions a dedicated Postgres instance along with auth, realtime, and storage layers |
| Railway    | Cloud platform for automated application deployment                                                          |

## API Endpoints
|     Module     |           Endpoint             |          Description          |
|----------------|--------------------------------|-------------------------------|
|     `AUTH`     | `POST /auth/register:`         | Register new user             |
|                | `POST /auth/login:`            | User login                    |
|     `USER`     | `GET /user/profile:`           | Get user profile              |
|                | `PATCH /user/profile:`         | Update user profile           |
|   `ACCOUNTS`   | `POST /accounts:`              | Create new account            |
|                | `GET /accounts/my-accounts:`   | Get all accounts (Admin Only) |
|                | `GET /accounts/:`              | Get user accounts             |
|                | `GET /accounts/{id}:`          | Get account details           |
|                | `PATCH /accounts/{id}:`        | Update account                |
|                | `DELETE /accounts/{id}:`       | Delete account                |
| `TRANSACTIONS` | `POST /transactions/deposit:`  | Deposit money                 |
|                | `POST /transactions/withdraw:` | Withdraw money                |
|                | `POST /transactions/transfer:` | Transfer money                |
|                | `GET /transactions/history:`   | Get transaction History       |

## Installation & Setup
### 1. Clone the Repository
```bash
git clone https://github.com/revou-fsse-feb25/milestone-4-MuhammadIrfanDzaky.git
```

### 2. Change Directory
```bash
cd milestone-4-MuhammadIrfanDzaky
```

### 3. install Dependencies
Choose one of the following
```bash
npm install
# or
pnpm install
# or
yarn install
```

### 4. Environment Configuration
Create a `.env` file based on the `.env.example` file in your project root
```bash
# .env.example
# DATABASE CONNECTION
DATABASE_URL="postgresql://user:password@localhost:5432/database_name?schema=public"

# JWT CONFIGURATION
JWT_SECRET="your_strong_secret_here"
JWT_EXPIRATION="1d"

# APPLICATION SETTINGS
PORT=3000
NODE_ENV="development"
```
**Replace** `user`, `password`, `database_name` with your postgreSQL setup

### 5. Database Setup
```bash
npx prisma migrate dev --name init # Create Database Schema
npx prisma generate # Generate Prisma Client
```

### 6. Run the Project
```bash
npm run start:dev
```
Check `http://localhost:3000` in your browser

## Author
Jek