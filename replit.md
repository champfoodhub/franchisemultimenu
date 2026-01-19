# FoodHub - Franchise Restaurant Management System

## Overview

FoodHub is a full-stack franchise restaurant management system that enables a central Headquarters (HQ) to manage menus across multiple branch locations. The platform features time-based and seasonal menus, role-based access control, and inventory management for individual branches.

Key capabilities:
- HQ administrators can create products, manage branches, and configure time-based menu schedules
- Branch managers can update stock levels, apply discounts, and manage branch-specific availability
- Public-facing menu displays products based on current time and active schedules
- Support for breakfast, lunch, and dinner schedules with timezone awareness

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with hot module replacement
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS with custom design tokens and CSS variables
- **Component Library**: shadcn/ui components (Radix UI primitives)
- **Custom Components**: Located in `client/src/components/ui-custom.tsx` for branded buttons, inputs, and cards

### Backend Architecture
- **Runtime**: Node.js with Express 5
- **Language**: TypeScript with ES modules
- **Authentication**: Passport.js with local strategy and session-based auth
- **Session Storage**: Memory store (development) with express-session
- **Password Hashing**: Scrypt with timing-safe comparison

### Database Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` - defines users, products, branches, inventory, schedules
- **Migrations**: Drizzle Kit with `db:push` command
- **Connection**: node-postgres Pool via DATABASE_URL environment variable

### Role-Based Access Control
Three user roles with distinct permissions:
- **HQ_ADMIN**: Full product catalog management, branch oversight, schedule creation
- **BRANCH_MANAGER**: Inventory updates, discount application, branch-specific settings
- **ADMIN**: System superadmin with complete access

### API Design
- Routes defined in `shared/routes.ts` with Zod schema validation
- Type-safe API contracts shared between client and server
- RESTful endpoints under `/api/*` prefix
- Authentication routes: `/api/login`, `/api/logout`, `/api/user`

### Build System
- Development: `tsx` for TypeScript execution with Vite dev server
- Production: esbuild bundles server code, Vite builds client assets
- Output: `dist/` directory with `index.cjs` (server) and `public/` (client assets)

## External Dependencies

### Database
- **PostgreSQL**: Primary database via DATABASE_URL environment variable
- **Drizzle ORM**: Schema management and query building

### Authentication
- **Passport.js**: Authentication middleware with local strategy
- **express-session**: Session management
- **memorystore**: In-memory session storage for development

### UI Components
- **Radix UI**: Accessible component primitives (dialog, dropdown, tabs, etc.)
- **shadcn/ui**: Pre-built component library based on Radix
- **Lucide React**: Icon library
- **class-variance-authority**: Component variant management

### Form Handling
- **React Hook Form**: Form state management
- **Zod**: Schema validation (shared between client/server)
- **@hookform/resolvers**: Zod integration for React Hook Form

### Development Tools
- **Vite**: Frontend build tool and dev server
- **Replit plugins**: Error overlay, cartographer, dev banner for Replit environment