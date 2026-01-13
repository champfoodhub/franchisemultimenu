# Time-Based + Seasonal Menus Implementation Plan

## Overview
Implement time-based and seasonal menu management for the franchise system with proper timezone handling for HQ and branches.

## Database Changes Required

### New Table: `menu_schedules`
```sql
CREATE TABLE menu_schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hq_id UUID NOT NULL,
  name VARCHAR(100) NOT NULL, -- e.g., "Breakfast Menu", "Summer Menu 2024"
  type VARCHAR(20) NOT NULL, -- 'TIME_SLOT' or 'SEASONAL'
  start_time TIME, -- for TIME_SLOT (e.g., "06:00")
  end_time TIME, -- for TIME_SLOT (e.g., "11:00")
  start_date DATE, -- for SEASONAL (e.g., "2024-12-01")
  end_date DATE, -- for SEASONAL (e.g., "2025-01-15")
  timezone VARCHAR(50) DEFAULT 'UTC', -- HQ timezone
  day_of_week INTEGER[], -- [0=Sunday, 1=Monday, ...] for recurring schedules
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Modified Table: `menu_items` (or new `menu_schedule_items`)
```sql
CREATE TABLE menu_schedule_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  schedule_id UUID NOT NULL REFERENCES menu_schedules(id),
  menu_item_id UUID NOT NULL, -- links to existing menu/products table
  priority INTEGER DEFAULT 0, -- display order within schedule
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### New RPC Function: `branch_menu_by_time`
```sql
CREATE OR REPLACE FUNCTION branch_menu_by_time(
  branch_id_input UUID,
  time_input TIME,
  date_input DATE
)
RETURNS JSON AS $$
  SELECT json_agg(
    json_build_object(
      'menu_item', mi.*,
      'schedule', ms.name,
      'schedule_type', ms.type,
      'price', COALESCE(bmp.price, mi.base_price),
      'discount', bmp.discount_percent
    )
  )
  FROM menu_schedule_items msi
  JOIN menu_schedules ms ON msi.schedule_id = ms.id
  JOIN menu_items mi ON msi.menu_item_id = mi.id
  LEFT JOIN branch_menu_prices bmp ON mi.id = bmp.menu_item_id 
    AND bmp.branch_id = branch_id_input
  WHERE ms.is_active = true
    AND (
      -- Time slot matching
      (ms.type = 'TIME_SLOT' 
        AND time_input >= ms.start_time 
        AND time_input <= ms.end_time
        AND (ms.day_of_week IS NULL 
          OR date_input::integer % 7 = ANY(ms.day_of_week))
      )
      OR
      -- Seasonal matching
      (ms.type = 'SEASONAL'
        AND date_input >= ms.start_date
        AND date_input <= ms.end_date
      )
    )
    AND mi.is_active = true
  ORDER BY msi.priority, msi.created_at;
$$ LANGUAGE sql SECURITY DEFINER;
```

## Files to Create/Modify

### New Files
1. `src/controllers/schedule.controller.ts` - Schedule management controllers
2. `src/routes/schedule.routes.ts` - Schedule routes
3. `src/validators/schedule.schemas.ts` - Validation schemas for schedules
4. `src/utils/timezone.ts` - Timezone utility functions
5. Database migration scripts

### Modified Files
1. `src/app.ts` - Register new schedule routes
2. `src/utils/errormessage.ts` - Add new error/success messages
3. `src/validators/schemas.ts` - Add schedule-related schemas

## API Endpoints

### HQ Admin Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/hq/schedules` | Create menu schedule |
| GET | `/hq/schedules` | List all schedules |
| GET | `/hq/schedules/:id` | Get schedule details |
| PUT | `/hq/schedules/:id` | Update schedule |
| DELETE | `/hq/schedules/:id` | Delete schedule |
| POST | `/hq/schedule-items` | Add items to schedule |
| DELETE | `/hq/schedule-items/:id` | Remove items from schedule |
| GET | `/hq/schedules/:id/items` | Get items in a schedule |

### Branch Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/branch/menu` | Get active menu (existing, enhanced) |
| GET | `/branch/menu/time-based` | Get menu for specific time |

## Implementation Steps

### Step 1: Add Error/Success Messages
Add new messages to `src/utils/errormessage.ts`

### Step 2: Create Timezone Utilities
Create `src/utils/timezone.ts` with functions:
- `convertTimezone(date, fromTz, toTz)`
- `getBranchLocalTime(branchId)`
- `isTimeInRange(time, start, end)`
- `getDayOfWeek(date)`

### Step 3: Create Validation Schemas
Create `src/validators/schedule.schemas.ts` with Zod schemas for schedule input validation

### Step 4: Create Schedule Controller
Create `src/controllers/schedule.controller.ts` with CRUD operations for schedules and schedule items

### Step 5: Create Schedule Routes
Create `src/routes/schedule.routes.ts` with proper route protection and validation

### Step 6: Register Routes
Update `src/app.ts` to include schedule routes with HQ admin protection

### Step 7: Update Branch Menu Endpoint
Enhance existing `GET /branch/menu` to support time-based filtering

## Timezone Handling Strategy

1. **HQ creates schedule** using their local timezone
2. **Store timezone** in `menu_schedules.timezone` column
3. **Branch requests menu** with optional `?time=12:30` parameter
4. **System converts** HQ timezone to branch local time for validation
5. **Return appropriate menu items** based on current time at branch location

## Validation Rules

- Time slots must have valid start_time < end_time
- Seasonal periods must have valid start_date < end_date
- Schedules cannot overlap for same day/time (configurable)
- Maximum 10 active schedules per HQ (configurable)
- Branch managers can only view, not modify schedules

## Error Messages to Add

- `SCHEDULE_NOT_FOUND`
- `SCHEDULE_CREATION_FAILED`
- `SCHEDULE_UPDATE_FAILED`
- `SCHEDULE_DELETION_FAILED`
- `INVALID_TIME_RANGE`
- `INVALID_DATE_RANGE`
- `TIMEZONE_CONVERSION_FAILED`
- `SCHEDULE_ITEM_NOT_FOUND`
- `SCHEDULE_ITEM_CREATION_FAILED`

## Success Messages to Add

- `SCHEDULE_CREATED`
- `SCHEDULE_UPDATED`
- `SCHEDULE_DELETED`
- `SCHEDULE_ITEMS_ADDED`
- `SCHEDULE_ITEMS_REMOVED`
- `SCHEDULE_RETRIEVED`

