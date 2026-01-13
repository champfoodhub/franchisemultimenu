# Validation Implementation Plan

## Step 1: Install Dependencies
- [x] Create TODO list
- [x] Install Zod validation library

## Step 2: Create Validation Schemas
- [x] Create `src/validators/schemas.ts` with Zod schemas for all endpoints

## Step 3: Create Validation Middleware
- [x] Create `src/middlewares/validate.ts` reusable validation middleware

## Step 4: Update Routes with Validation
- [x] Update `src/routes/auth.routes.ts` - add login validation
- [x] Update `src/routes/branch.routes.ts` - add stock/discount validation
- [x] Update `src/routes/hq.routes.ts` - add product validation
- [x] Update `src/routes/menu.routes.ts` - add menu validation

## Step 5: Update Controllers with Validation
- [x] Update `src/controllers/auth.controller.ts` - validate login input
- [x] Update `src/controllers/branch.controller.ts` - validate stock/discount
- [x] Update `src/controllers/hq.controller.ts` - validate product input
- [x] Update `src/controllers/menu.controller.ts` - validate menu input

## Validation Rules
| Field | Validation |
|-------|------------|
| email | Required, valid email format |
| password | Required, min 6 chars |
| name | Required, non-empty string |
| base_price | Required, positive number |
| category | Required, non-empty string |
| stock | Required, integer >= 0 |
| discount | Required, number 0-30 |
| price | Required, positive number |
| is_active | Boolean (optional) |

## Error Response Format
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Invalid email format" }
  ],
  "error": "email: Invalid email format"
}
```

