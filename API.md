# Franchise Multi-Menu API Documentation

## Base URL
```
http://localhost:5000/api
```

## Content Type
All requests and responses use JSON:
```
Content-Type: application/json
```

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## Authentication Endpoints

### POST /auth/login
Authenticate user and get JWT token.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "HQ_ADMIN" | "BRANCH_MANAGER"
    },
    "session": {
      "access_token": "jwt-token",
      "refresh_token": "refresh-token"
    }
  }
}
```

**Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

**Validation Errors (400 Bad Request):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Invalid email format" },
    { "field": "password", "message": "Password must be at least 6 characters" }
  ]
}
```

---

## HQ Admin Endpoints

All HQ Admin endpoints require the `HQ_ADMIN` role.

### POST /hq/products
Create a new product.

**Request:**
```json
{
  "name": "Classic Burger",
  "base_price": 9.99,
  "category": "Burgers",
  "description": "A delicious classic burger"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Product created",
  "data": {
    "id": "uuid",
    "hq_id": "uuid",
    "name": "Classic Burger",
    "base_price": 9.99,
    "category": "Burgers",
    "is_active": true,
    "created_at": "2024-03-15T10:30:00Z"
  }
}
```

### PATCH /hq/products/:id
Update a product.

**Request:**
```json
{
  "name": "Deluxe Burger",
  "base_price": 12.99,
  "category": "Premium Burgers"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Product updated",
  "data": {
    "id": "uuid",
    "name": "Deluxe Burger",
    "base_price": 12.99,
    "category": "Premium Burgers"
  }
}
```

### DELETE /hq/products/:id
Soft delete (disable) a product.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Product disabled"
}
```

### GET /hq/stock-report
Get stock report for all branches.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Stock report retrieved",
  "data": [
    {
      "product_id": "uuid",
      "product_name": "Classic Burger",
      "branch_id": "uuid",
      "branch_name": "Main Branch",
      "stock": 100,
      "discount": 0
    }
  ]
}
```

---

## Schedule Management Endpoints (HQ Admin)

### POST /hq/schedules
Create a new schedule (TIME_SLOT or SEASONAL).

**Request (TIME_SLOT):**
```json
{
  "name": "Breakfast Menu",
  "type": "TIME_SLOT",
  "start_time": "06:00",
  "end_time": "11:00",
  "timezone": "America/New_York",
  "day_of_week": [1, 2, 3, 4, 5],
  "is_active": true
}
```

**Request (SEASONAL):**
```json
{
  "name": "Summer Specials 2024",
  "type": "SEASONAL",
  "start_date": "2024-06-01",
  "end_date": "2024-08-31",
  "timezone": "America/Los_Angeles",
  "is_active": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Schedule created successfully",
  "data": {
    "id": "uuid",
    "hq_id": "uuid",
    "name": "Breakfast Menu",
    "type": "TIME_SLOT",
    "start_time": "06:00",
    "end_time": "11:00",
    "timezone": "America/New_York",
    "day_of_week": [1, 2, 3, 4, 5],
    "is_active": true,
    "created_at": "2024-03-15T10:30:00Z"
  }
}
```

### GET /hq/schedules
List all schedules for HQ.

**Query Parameters:**
- `type` (optional): Filter by type (`TIME_SLOT` | `SEASONAL`)
- `is_active` (optional): Filter by active status (`true` | `false`)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Schedule retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "name": "Breakfast Menu",
      "type": "TIME_SLOT",
      "start_time": "06:00",
      "end_time": "11:00",
      "timezone": "UTC",
      "is_active": true
    }
  ]
}
```

### GET /hq/schedules/:id
Get schedule details.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Schedule retrieved successfully",
  "data": {
    "id": "uuid",
    "name": "Breakfast Menu",
    "type": "TIME_SLOT",
    "start_time": "06:00",
    "end_time": "11:00",
    "timezone": "America/New_York",
    "day_of_week": [1, 2, 3, 4, 5],
    "is_active": true
  }
}
```

### PUT /hq/schedules/:id
Update a schedule.

**Request:**
```json
{
  "name": "Updated Breakfast Menu",
  "start_time": "06:30",
  "is_active": false
}
```

### DELETE /hq/schedules/:id
Delete a schedule (cascades to schedule items).

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Schedule deleted successfully"
}
```

### POST /hq/schedule-items
Add items to a schedule.

**Request:**
```json
{
  "schedule_id": "uuid",
  "menu_item_ids": [
    "uuid1",
    "uuid2",
    "uuid3"
  ],
  "priority": 1,
  "is_featured": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Items added to schedule successfully",
  "data": [
    {
      "id": "uuid",
      "schedule_id": "uuid",
      "menu_item_id": "uuid1",
      "priority": 1,
      "is_featured": true
    }
  ]
}
```

### GET /hq/schedules/:schedule_id/items
Get items in a schedule.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Schedule retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "schedule_id": "uuid",
      "menu_item_id": "uuid",
      "priority": 1,
      "is_featured": false,
      "menu_items": {
        "id": "uuid",
        "name": "Classic Burger",
        "price": 9.99,
        "category": "Burgers"
      }
    }
  ]
}
```

### DELETE /hq/schedule-items/:item_id
Remove an item from a schedule.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Items removed from schedule successfully"
}
```

### GET /hq/time-slots
Get available time slots for a date.

**Query Parameters:**
- `date` (optional): Date in YYYY-MM-DD format (defaults to today)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Schedule retrieved successfully",
  "data": {
    "date": "2024-03-15",
    "day_name": "Friday",
    "available_slots": [
      {
        "schedule_id": "uuid",
        "schedule_name": "Breakfast Menu",
        "start_time": "06:00",
        "end_time": "11:00",
        "timezone": "UTC"
      }
    ]
  }
}
```

---

## Branch Manager Endpoints

All Branch Manager endpoints require the `BRANCH_MANAGER` role.

### PATCH /branch/products/:id/stock
Update product stock.

**Request:**
```json
{
  "stock": 50
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Stock updated"
}
```

### PATCH /branch/products/:id/discount
Update product discount.

**Request:**
```json
{
  "discount": 10
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Discount updated"
}
```

### GET /branch/menu
Get branch menu.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Menu retrieved",
  "data": [
    {
      "id": "uuid",
      "name": "Classic Burger",
      "price": 9.99,
      "category": "Burgers",
      "stock": 50,
      "discount_percent": 10
    }
  ]
}
```

### GET /branch/menu/time-based
Get time-based menu for branch.

**Query Parameters:**
- `time` (optional): Time in HH:MM format (defaults to current time)
- `date` (optional): Date in YYYY-MM-DD format (defaults to today)
- `schedule_type` (optional): Filter by type (`TIME_SLOT` | `SEASONAL` | `ALL`)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Menu retrieved",
  "data": {
    "current_time": "08:30",
    "current_date": "2024-03-15",
    "timezone": "America/New_York",
    "active_schedules": 1,
    "schedules": [
      {
        "schedule": {
          "id": "uuid",
          "name": "Breakfast Menu",
          "type": "TIME_SLOT",
          "timezone": "America/New_York"
        },
        "items": [
          {
            "id": "uuid",
            "menu_item_id": "uuid",
            "priority": 1,
            "is_featured": false,
            "menu_items": {
              "id": "uuid",
              "name": "Pancakes",
              "price": 7.99,
              "category": "Breakfast"
            }
          }
        ],
        "itemCount": 1
      }
    ]
  }
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request / Validation Error |
| 401 | Unauthorized |
| 403 | Forbidden (Insufficient permissions) |
| 404 | Not Found |
| 500 | Internal Server Error |

## Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "error": "field: Error message"
}
```

---

## User Roles

| Role | Description |
|------|-------------|
| `HQ_ADMIN` | Headquarters administrator with full access |
| `BRANCH_MANAGER` | Branch manager with limited access |

---

## Timezones Supported

- UTC
- America/New_York (Eastern Time)
- America/Chicago (Central Time)
- America/Denver (Mountain Time)
- America/Los_Angeles (Pacific Time)
- Europe/London
- Europe/Paris
- Asia/Tokyo
- Asia/Shanghai
- Asia/Kolkata
- Australia/Sydney

---

## Environment Variables

Create a `.env` file in the root directory:

```env
# Supabase Configuration
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Server Configuration
PORT=5000
```

