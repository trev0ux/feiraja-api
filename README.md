# Feiraja API

Marketplace de produtos locais - Backend API with Prisma database integration.

## Features

- ✅ **Structured Architecture**: Organized with controllers, routes, middleware, and services
- ✅ **Database**: PostgreSQL with Prisma ORM for type-safe database operations
- ✅ **Authentication**: JWT-based admin authentication
- ✅ **File Upload**: Image upload support with multer
- ✅ **CORS**: Configured for multiple frontend origins
- ✅ **Error Handling**: Comprehensive error handling with proper HTTP status codes

## Project Structure

```
feiraja-api/
├── api/
│   └── index.js              # Entry point for Vercel deployment
├── src/
│   ├── controllers/          # Request handlers
│   │   ├── authController.js
│   │   ├── categoryController.js
│   │   ├── productController.js
│   │   ├── boxPriceController.js
│   │   └── addressController.js
│   ├── routes/               # Route definitions
│   │   ├── auth.js
│   │   ├── categories.js
│   │   ├── products.js
│   │   ├── boxPrices.js
│   │   └── addresses.js
│   ├── middleware/           # Custom middleware
│   │   └── auth.js
│   ├── utils/                # Utilities and database connection
│   │   └── database.js
│   └── app.js                # Express app configuration
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── seed.js               # Database seeder
├── .env.example              # Environment variables template
└── package.json
```

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- PostgreSQL database

### Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Set up environment variables:

```bash
cp .env.example .env
```

Edit `.env` with your database credentials:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/feiraja?schema=public"
JWT_SECRET="your-secret-key-change-in-production"
NODE_ENV="development"
PORT=3001
```

3. Generate Prisma client and push schema to database:

```bash
npm run db:generate
npm run db:push
```

4. Seed the database with initial data:

```bash
npm run db:seed
```

5. Start the development server:

```bash
npm run dev
```

The API will be available at `http://localhost:3001/api`

## API Endpoints

### Health Check
- `GET /api/health` - API health status

### Authentication
- `POST /api/admin/login` - Admin login

### Categories
- `GET /api/categories` - Get all categories (public)
- `POST /api/admin/categories` - Create category (authenticated)
- `PUT /api/admin/categories/:id` - Update category (authenticated)
- `DELETE /api/admin/categories/:id` - Delete category (authenticated)

### Products
- `GET /api/products` - Get products with filtering and pagination
- `POST /api/admin/products` - Create product with image upload (authenticated)

### Box Prices
- `GET /api/admin/box-prices` - Get box pricing (authenticated)
- `PUT /api/admin/box-prices/:id` - Update box price (authenticated)

### Addresses
- `GET /api/addresses` - Get addresses (with optional userId filter)
- `GET /api/addresses/:id` - Get address by ID
- `POST /api/admin/addresses` - Create address (authenticated)

## Database Scripts

- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Prisma Studio (database GUI)
- `npm run db:seed` - Seed database with initial data

## Deployment

The API is configured for deployment on Vercel. The `vercel.json` configuration routes all requests through the `/api/index.js` handler.

### Environment Variables for Production

Ensure these environment variables are set in your production environment:

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing secret
- `NODE_ENV=production`

## Admin Credentials

Default admin credentials (for development):
- Username: `admin`
- Password: `admin123`
- Email: `admin@feiraja.com`

**⚠️ Change these credentials in production!**