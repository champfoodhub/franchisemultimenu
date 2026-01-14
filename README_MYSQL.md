# Franchise Menu Management System - MySQL Migration

This is a complete migration from Supabase (PostgreSQL) to MySQL for the Franchise Menu Management System.

## Features

- 🍔 Menu management for multiple franchise branches
- 🏪 HQ and Branch role-based access control
- 📅 Time-based and seasonal menu scheduling
- 📊 Stock management and reporting
- 🔐 JWT-based authentication

## Tech Stack

- **Backend**: Express.js + TypeScript
- **Database**: MySQL 8.0
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Frontend**: React + Vite

## Prerequisites

1. Node.js 18+
2. MySQL 8.0 installed locally
3. npm or yarn

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy the example environment file and update with your settings:

```bash
cp .env.example .env
```

Edit `.env` with your MySQL credentials:

```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=franchisemultimenu
```

### 3. Create Database

Create the MySQL database:

```bash
mysql -u root -p -e "CREATE DATABASE franchisemultimenu CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### 4. Run Database Schema

```bash
npm run db:schema
# Or manually:
mysql -u root -p franchisemultimenu < database/mysql_schema.sql
```

### 5. Seed Sample Data

```bash
npm run db:seed
```

This will create:
- 2 sample users (HQ Admin and Branch Manager)
- 3 branches
- 8 products
- 8 menu items
- 4 menu schedules (Breakfast, Lunch, Dinner, Summer Specials)
- Branch products with stock levels

### 6. Start the Server

```bash
npm run dev
```

Server will start at `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /auth/login` - Login with email/password
- `GET /auth/me` - Get current user
- `POST /auth/logout` - Logout

### HQ Management
- `GET /hq/products` - Get all products
- `POST /hq/products` - Create product
- `PUT /hq/products/:id` - Update product
- `DELETE /hq/products/:id` - Delete product
- `GET /hq/branches` - Get all branches
- `GET /hq/stock` - Get stock report

### Branch Management
- `GET /branch/branch` - Get branch info
- `GET /branch/products` - Get branch products
- `PUT /branch/stock/:id` - Update stock
- `PUT /branch/discount/:id` - Update discount
- `GET /branch/menu` - Get branch menu
- `PUT /branch/menu/:id` - Update branch menu item

### Menu
- `GET /menu` - Get all menu items
- `POST /menu` - Create menu item (HQ)
- `PUT /menu/:id` - Update menu item (HQ)
- `DELETE /menu/:id` - Delete menu item (HQ)
- `PATCH /menu/:id/branch` - Update branch menu (Branch)

### Schedules
- `POST /schedules/schedules` - Create schedule (HQ)
- `GET /schedules/schedules` - Get all schedules (HQ)
- `GET /schedules/schedules/:id` - Get schedule by ID (HQ)
- `PUT /schedules/schedules/:id` - Update schedule (HQ)
- `DELETE /schedules/schedules/:id` - Delete schedule (HQ)
- `POST /schedules/schedules/:schedule_id/items` - Add items to schedule (HQ)
- `GET /schedules/schedules/:schedule_id/items` - Get schedule items (HQ)
- `DELETE /schedules/schedules/items/:item_id` - Remove item from schedule (HQ)
- `GET /schedules/time-based-menu` - Get time-based menu (HQ/Branch)
- `GET /schedules/time-slots` - Get available time slots (HQ)

## Sample Login Credentials

After running the seed script:

| Role | Email | Password |
|------|-------|----------|
| HQ Admin | hq@franchise.com | hq123456 |
| Branch Manager | branch@franchise.com | branch123456 |

## Project Structure

```
franchisemultimenu/
├── database/
│   └── mysql_schema.sql      # MySQL schema
├── scripts/
│   └── seed.ts               # Database seeding script
├── src/
│   ├── config/
│   │   └── mysql.ts          # MySQL connection pool
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── branch.controller.ts
│   │   ├── hq.controller.ts
│   │   ├── menu.controller.ts
│   │   └── schedule.controller.ts
│   ├── middlewares/
│   │   └── auth.middleware.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── branch.routes.ts
│   │   ├── hq.routes.ts
│   │   ├── menu.routes.ts
│   │   └── schedule.routes.ts
│   ├── utils/
│   │   ├── auth.ts           # JWT utilities
│   │   └── errormessage.ts   # Error/success messages
│   ├── validators/
│   │   ├── schemas.ts
│   │   └── schedule.schemas.ts
│   ├── app.ts
│   └── server.ts
├── .env.example
├── package.json
└── README.md
```

## API Response Format

Success response:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

Error response:
```json
{
  "success": false,
  "message": "Error message",
  "error": "Error details"
}
```

## Troubleshooting

### MySQL Connection Failed

1. Check if MySQL is running:
   ```bash
   # On Linux
   sudo systemctl status mysql
   
   # On macOS
   brew services list | grep mysql
   ```

2. Verify credentials in `.env` file

3. Check if database exists:
   ```bash
   mysql -u root -p -e "SHOW DATABASES;"
   ```

### Port Already in Use

Change the port in `.env`:
```env
PORT=5001
```

## License

MIT

