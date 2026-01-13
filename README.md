# Franchise Multi-Menu Backend API

A Node.js/Express backend API for managing franchise menus with time-based and seasonal menu scheduling.

## Features

- **Authentication**: JWT-based authentication via Supabase
- **Role-Based Access Control**: HQ_ADMIN and BRANCH_MANAGER roles
- **Time-Based Menus**: Schedule different menus for breakfast, lunch, dinner, etc.
- **Seasonal Menus**: Create special menus for holidays and seasons
- **Multi-Timezone Support**: Handle schedules across different time zones
- **Input Validation**: Zod schema validation for all inputs
- **Stock Management**: Track inventory across branches
- **Discount Management**: Apply branch-specific discounts

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Validation**: Zod
- **Testing**: Jest + ts-jest

## Project Structure

```
franchisemultimenu/
├── database/
│   ├── migration.sql          # Database migration script
│   └── migration_time_based_menus.sql
├── src/
│   ├── app.ts                 # Express app configuration
│   ├── server.ts              # Server entry point
│   ├── config/
│   │   └── supabase.ts        # Supabase client configuration
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── branch.controller.ts
│   │   ├── hq.controller.ts
│   │   ├── menu.controller.ts
│   │   └── schedule.controller.ts
│   ├── middlewares/
│   │   ├── auth.middleware.ts
│   │   ├── role.middleware.ts
│   │   └── validate.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── branch.routes.ts
│   │   ├── hq.routes.ts
│   │   ├── menu.routes.ts
│   │   └── schedule.routes.ts
│   ├── types/
│   │   └── express.d.ts       # TypeScript declarations
│   ├── utils/
│   │   ├── errormessage.ts    # Centralized error messages
│   │   ├── response.ts        # Response helpers
│   │   └── timezone.ts        # Timezone utilities
│   └── validators/
│       ├── schemas.ts         # General validation schemas
│       └── schedule.schemas.ts # Schedule validation schemas
├── tests/
│   └── unit/
│       ├── validators.test.ts
│       ├── timezone.test.ts
│       ├── response.test.ts
│       └── schedule.schemas.test.ts
├── API.md                      # API Documentation
├── TIME_BASED_MENU_PLAN.md
├── TODO.md
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- A Supabase project

### Installation

1. **Clone the repository**
   ```bash
   cd /home/dev/Downloads/franchisemultimenu
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your Supabase credentials:
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   PORT=5000
   ```

4. **Set up the database**
   
   Run the migration script in your Supabase SQL Editor:
   ```bash
   # Copy the contents of database/migration.sql
   # And execute in Supabase SQL Editor
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

   The server will start on `http://localhost:5000`

## Running Tests

```bash
# Run all tests with coverage
npm test

# Run tests in watch mode
npm run test:watch

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration
```

## Building for Production

```bash
# Compile TypeScript
npm run build

# Start production server
npm start
```

## API Endpoints

### Authentication
- `POST /auth/login` - User login

### HQ Admin
- `POST /hq/products` - Create product
- `PATCH /hq/products/:id` - Update product
- `DELETE /hq/products/:id` - Disable product
- `GET /hq/stock-report` - Get stock report
- `POST /hq/schedules` - Create schedule
- `GET /hq/schedules` - List schedules
- `GET /hq/schedules/:id` - Get schedule
- `PUT /hq/schedules/:id` - Update schedule
- `DELETE /hq/schedules/:id` - Delete schedule
- `POST /hq/schedule-items` - Add items to schedule
- `GET /hq/schedules/:schedule_id/items` - Get schedule items
- `DELETE /hq/schedule-items/:item_id` - Remove schedule item
- `GET /hq/time-slots` - Get available time slots

### Branch Manager
- `PATCH /branch/products/:id/stock` - Update stock
- `PATCH /branch/products/:id/discount` - Update discount
- `GET /branch/menu` - Get branch menu
- `GET /branch/menu/time-based` - Get time-based menu

## Database Schema

### Tables
- `branches` - Branch information
- `products` - Product catalog (HQ level)
- `branch_products` - Branch-specific product data
- `menu` - Menu items
- `branch_menu` - Branch-specific menu data
- `menu_schedules` - Time slot and seasonal schedules
- `menu_schedule_items` - Menu items linked to schedules

### RPC Functions
- `branch_menu(branch_id)` - Get branch menu
- `branch_menu_by_time(...)` - Get menu by time
- `available_time_slots(...)` - Get time slots for date
- `hq_stock_report()` - Get HQ-wide stock report

## Time-Based Menu Features

### Time Slots
Create schedules for different times of day:
- Breakfast: 06:00 - 11:00
- Lunch: 11:00 - 15:00
- Dinner: 17:00 - 22:00

### Seasonal Menus
Create temporary menus for:
- Holiday specials
- Summer promotions
- Limited time offers

### Timezone Support
- Schedules are stored with timezone information
- Branch queries use local time
- Automatic conversion between timezones

## Validation

All endpoints use Zod for input validation:
- Email format validation
- Password length requirements
- Price and discount ranges
- Time and date format validation
- UUID format validation

## Error Handling

The API uses standardized error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

## License

MIT License

