# NestJS Auth & User Management API

A robust, scalable, and secure REST API built with NestJS for handling user authentication, comprehensive user management, and advanced features like role-based access control and localization.

## ✨ Features

This project is a complete implementation of a modern backend service, including core functionalities and production-ready enhancements.

### Core Features

- **Authentication**: Secure user registration and login using JWT (JSON Web Tokens).
- **Password Recovery**: A full, secure flow for users to reset their forgotten passwords via a token-based system.
- **User Management CRUD**: A full suite of endpoints to Create, Read, Update, and Delete users.
- **Advanced User Queries**:
  - **Pagination**: Paginate user lists using `page` and `limit`.
  - **Filtering**: Filter users by their `isActive` status.
  - **Searching**: Search for users by `username` or `email`.
  - **Sorting**: Sort user lists by `createdAt` date (ascending or descending).

### Advanced Features

- **🛡️ Security**:
  - **Password Hashing**: Passwords are never stored in plain text. They are securely hashed using bcrypt.
  - **JWT Security**: Authentication is handled by stateless, secure JWTs.
- **👑 Role-Based Access Control (RBAC)**:
  - Two distinct roles: `USER` and `ADMIN`.
  - User management endpoints are protected and accessible only by `ADMIN` users.
- **🌍 Localization (i18n)**:
  - Support for multiple languages (`en`, `ar`).
  - API responses (success and error), and DTO validation messages are automatically translated based on the `Accept-Language` header.
- **📦 Standardized API Responses**:
  - A global interceptor wraps all successful API responses in a consistent `{ "statusCode": 2xx, "message": "...", "data": {...} }` structure for predictable frontend handling.
- **📄 API Documentation**:
  - Integrated Swagger (OpenAPI) for interactive, detailed, and auto-generated API documentation.

## 🏛️ Architecture

This project is built using a modern, scalable, and maintainable architecture designed for growth.

- **Modular (Feature-Based)**: The codebase is organized into self-contained modules for each feature (e.g., `UsersModule`, `AuthModule`), making the system easy to navigate and scale.
- **CQRS-Style Services**: The business logic within the `Users` module is split into a `UsersQueryService` (for reading data) and a `UsersCommandService` (for writing data). This separates concerns and optimizes logic for its specific purpose.
- **Repository Pattern**: A dedicated `UsersRepository` class is the only component that communicates directly with the database (via Prisma). This abstracts the data layer, making it easy to change the ORM or database without affecting business logic.

## 🛠️ Technology Stack

- **Framework**: NestJS
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Authentication**: Passport.js (JWT and Local strategies)
- **Validation**: class-validator & class-transformer
- **Security**: bcrypt for password hashing
- **Localization**: nestjs-i18n
- **API Documentation**: Swagger (OpenAPI)

## 🚀 Getting Started

Follow these instructions to get the project set up and running on your local machine.

### Prerequisites

- Node.js (v18 or later)
- npm
- PostgreSQL running locally or in a Docker container.

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/nestjs-auth-api.git
cd nestjs-auth-api
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root of the project by copying the example file:

```bash
cp .env.example .env
```

Now, open the `.env` file and update the `DATABASE_URL` with your PostgreSQL connection string.

```env
# Example .env file
DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/your_db_name?schema=public"

# JWT Configuration
JWT_SECRET="your-super-secret-key-that-is-at-least-32-chars-long"
JWT_EXPIRATION_TIME="3600s" # 1 hour
```

### 4. Run Database Migrations

Prisma will set up the database schema for you based on the `prisma/schema.prisma` file.

```bash
npx prisma migrate dev --name init
```

### 5. Run the Application

```bash
npm run start:dev
```

The application will be running on `http://localhost:3000`.

### 6. Access API Documentation

Once the application is running, you can access the interactive Swagger documentation at:

```
http://localhost:3000/api
```

## 📖 API Endpoints Guide

Below is a detailed list of all available endpoints.

### Authentication (/auth)

#### POST /auth/register

Registers a new user. Default role is `USER`.

- **Authorization**: Public
- **Request Body**:

```json
{
  "username": "johndoe",
  "email": "john.doe@example.com",
  "password": "Password123!",
  "confirmPassword": "Password123!"
}
```

- **Success Response (201 Created)**:

```json
{
  "statusCode": 201,
  "message": "User created successfully.",
  "data": {
    "id": "uuid-string",
    "username": "johndoe",
    "email": "john.doe@example.com",
    "isActive": true,
    "role": "USER",
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
}
```

#### POST /auth/login

Authenticates a user and returns a JWT.

- **Authorization**: Public
- **Request Body**:

```json
{
  "identifier": "john.doe@example.com",
  "password": "Password123!"
}
```

- **Success Response (200 OK)**:

```json
{
  "statusCode": 200,
  "message": "Login successful.",
  "data": {
    "accessToken": "your-jwt-token"
  }
}
```

#### POST /auth/forgot-password

Initiates the password reset process.

- **Authorization**: Public
- **Request Body**:

```json
{
  "email": "john.doe@example.com"
}
```

- **Success Response (200 OK)**:

```json
{
  "statusCode": 200,
  "message": "If a user with this email exists, a password reset link has been sent."
}
```

#### POST /auth/reset-password

Sets a new password using a valid reset token.

- **Authorization**: Public
- **Request Body**:

```json
{
  "token": "the-token-from-the-console/email",
  "newPassword": "NewSecurePassword123!",
  "confirmNewPassword": "NewSecurePassword123!"
}
```

- **Success Response (200 OK)**:

```json
{
  "statusCode": 200,
  "message": "Password has been reset successfully."
}
```

### User Management (/users)

**Note**: All endpoints in this section require a valid JWT and `ADMIN` role.

#### GET /users

Lists all users with pagination, filtering, searching, and sorting.

- **Authorization**: Admin JWT
- **Query Parameters**:
  - `page` (number, optional, default: 1)
  - `limit` (number, optional, default: 10)
  - `search` (string, optional): Search by username or email.
  - `isActive` (boolean, optional): Filter by active status.
  - `sortBy` (string, optional, default: "createdAt"): Field to sort by.
  - `sortOrder` (enum, optional, default: "desc"): `asc` or `desc`.
- **Success Response (200 OK)**:

```json
{
  "statusCode": 200,
  "message": "Users retrieved successfully.",
  "data": {
    "users": [
      {
        "id": "uuid-string",
        "username": "johndoe",
        "email": "john.doe@example.com",
        "isActive": true,
        "role": "USER",
        "createdAt": "timestamp"
      }
    ],
    "meta": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
}
```

#### GET /users/:id

Retrieves a single user by their ID.

- **Authorization**: Admin JWT
- **Success Response (200 OK)**:

```json
{
  "statusCode": 200,
  "message": "User retrieved successfully.",
  "data": {
    "id": "uuid-string",
    "username": "johndoe",
    "email": "john.doe@example.com"
  }
}
```

#### PUT /users/:id

Updates a user's information.

- **Authorization**: Admin JWT
- **Request Body**:

```json
{
  "username": "newusername",
  "email": "new.email@example.com"
}
```

#### PATCH /users/:id/status

Activates or deactivates a user's account.

- **Authorization**: Admin JWT
- **Request Body**:

```json
{
  "isActive": false
}
```

#### DELETE /users/:id

Deletes a user from the database.

- **Authorization**: Admin JWT
- **Success Response (204 No Content)**: Returns an empty response on success.
