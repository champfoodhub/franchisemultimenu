import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === ENUMS ===
export const roles = ["HQ_ADMIN", "BRANCH_MANAGER", "ADMIN"] as const;
export const scheduleTypes = ["TIME_SLOT", "SEASONAL"] as const;

// === USERS & AUTH ===
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: roles }).notNull().default("BRANCH_MANAGER"),
  branchId: integer("branch_id"), // Null for HQ_ADMIN/ADMIN
  name: text("name").notNull(),
  createdAt: text("created_at"),
});

export const branches = sqliteTable("branches", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  address: text("address").notNull(),
  timezone: text("timezone").notNull().default("UTC"),
  isActive: integer("is_active").default(1),
});

// === CATALOG & INVENTORY ===
export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description").notNull(),
  basePrice: text("base_price").notNull(), // SQLite doesn't have decimal type
  category: text("category").notNull(),
  menu: text("menu"), // Dropdown field for menu classification
  imageUrl: text("image_url").notNull(),
  isActive: integer("is_active").default(1),
});

export const inventory = sqliteTable("inventory", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  branchId: integer("branch_id").notNull(),
  productId: integer("product_id").notNull(),
  stock: integer("stock").notNull().default(0),
  discount: integer("discount").notNull().default(0), // Percentage 0-100
  isAvailable: integer("is_available").default(1),
  updatedAt: text("updated_at"),
});

// === SCHEDULES ===
export const schedules = sqliteTable("schedules", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  type: text("type", { enum: scheduleTypes }).notNull(),
  // Time Slot details
  startTime: text("start_time"), // HH:MM:SS format
  endTime: text("end_time"),     // HH:MM:SS format
  daysOfWeek: text("days_of_week"), // Stored as JSON string in SQLite
  // Seasonal details
  startDate: text("start_date"),
  endDate: text("end_date"),
  
  isActive: integer("is_active").default(1),
});

export const scheduleItems = sqliteTable("schedule_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  scheduleId: integer("schedule_id").notNull(),
  productId: integer("product_id").notNull(),
  priority: integer("priority").default(0),
});

// === RELATIONS ===
export const userRelations = relations(users, ({ one }) => ({
  branch: one(branches, {
    fields: [users.branchId],
    references: [branches.id],
  }),
}));

export const inventoryRelations = relations(inventory, ({ one }) => ({
  branch: one(branches, {
    fields: [inventory.branchId],
    references: [branches.id],
  }),
  product: one(products, {
    fields: [inventory.productId],
    references: [products.id],
  }),
}));

export const scheduleItemsRelations = relations(scheduleItems, ({ one }) => ({
  schedule: one(schedules, {
    fields: [scheduleItems.scheduleId],
    references: [schedules.id],
  }),
  product: one(products, {
    fields: [scheduleItems.productId],
    references: [products.id],
  }),
}));

// === ZOD SCHEMAS ===
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertBranchSchema = createInsertSchema(branches).omit({ id: true });
export const insertProductSchema = createInsertSchema(products).omit({ id: true }).extend({
  basePrice: z.coerce.number().min(0), // Coerce string to number for validation
  menu: z.string().optional(), // Menu dropdown value
});
export const insertInventorySchema = createInsertSchema(inventory).omit({ id: true, updatedAt: true });
export const insertScheduleSchema = createInsertSchema(schedules).omit({ id: true });
export const insertScheduleItemSchema = createInsertSchema(scheduleItems).omit({ id: true });

// === TYPES ===
export type User = typeof users.$inferSelect;
export type Branch = typeof branches.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Inventory = typeof inventory.$inferSelect;
export type Schedule = typeof schedules.$inferSelect;
export type ScheduleItem = typeof scheduleItems.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertBranch = z.infer<typeof insertBranchSchema>;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type InsertInventory = z.infer<typeof insertInventorySchema>;
export type InsertSchedule = z.infer<typeof insertScheduleSchema>;
export type InsertScheduleItem = z.infer<typeof insertScheduleItemSchema>;

// Auth type for frontend
export type AuthUser = Omit<User, "password">;
