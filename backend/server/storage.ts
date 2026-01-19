import { db } from "./db";
import { 
  users, products, branches, inventory, schedules, scheduleItems,
  type User, type InsertUser, type Product, type InsertProduct,
  type Branch, type InsertBranch, type Inventory, type InsertInventory,
  type Schedule, type InsertSchedule, type ScheduleItem, type InsertScheduleItem
} from "@shared/schema";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // User
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // HQ: Products
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product>;
  
  // HQ: Branches
  getBranches(): Promise<Branch[]>;
  getBranch(id: number): Promise<Branch | undefined>;
  createBranch(branch: InsertBranch): Promise<Branch>;
  updateBranch(id: number, branch: Partial<InsertBranch>): Promise<Branch>;
  
  // Inventory
  getInventory(branchId: number): Promise<(Inventory & { product: Product })[]>;
  updateInventory(id: number, update: Partial<InsertInventory>): Promise<Inventory>;
  createInventory(item: InsertInventory): Promise<Inventory>;
  
  // Schedules
  getSchedules(): Promise<Schedule[]>;
  createSchedule(schedule: InsertSchedule): Promise<Schedule>;
  updateSchedule(id: number, schedule: Partial<InsertSchedule>): Promise<Schedule>;
  addScheduleItems(items: InsertScheduleItem[]): Promise<ScheduleItem[]>;
  getScheduleItems(scheduleId: number): Promise<(ScheduleItem & { product: Product })[]>;
  
  // Logic
  getActiveMenu(date: Date, time: string, branchId?: number): Promise<Product[]>;
  getProductSchedules(productId: number): Promise<Schedule[]>;
  updateProductSchedules(productId: number, scheduleIds: number[]): Promise<void>;
}

// Helper to safely parse JSON stored as string in SQLite
function parseJsonField<T>(value: unknown, defaultValue: T): T {
  if (value === null || value === undefined) return defaultValue;
  if (typeof value === "object") return value as T;
  try {
    return JSON.parse(value as string);
  } catch {
    return defaultValue;
  }
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values({
      username: user.username,
      password: user.password,
      role: user.role ?? "BRANCH_MANAGER",
      name: user.name,
      branchId: user.branchId ?? undefined,
      createdAt: user.createdAt ?? undefined,
    }).returning();
    return result[0];
  }

  async getProducts(): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.isActive, true));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const result = await db.select().from(products).where(eq(products.id, id));
    return result[0];
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const result = await db.insert(products).values({
      name: product.name,
      description: product.description,
      basePrice: String(product.basePrice),
      category: product.category,
      menu: product.menu ?? null,
      imageUrl: product.imageUrl,
      isActive: true,
    }).returning();
    return result[0];
  }

  async updateProduct(id: number, update: Partial<InsertProduct>): Promise<Product> {
    const updateValues: Partial<Product> = {};
    if (update.name !== undefined) updateValues.name = update.name;
    if (update.description !== undefined) updateValues.description = update.description;
    if (update.basePrice !== undefined) updateValues.basePrice = String(update.basePrice);
    if (update.category !== undefined) updateValues.category = update.category;
    if (update.menu !== undefined) updateValues.menu = update.menu;
    if (update.imageUrl !== undefined) updateValues.imageUrl = update.imageUrl;
    if (update.isActive !== undefined) updateValues.isActive = update.isActive;
    
    const result = await db.update(products).set(updateValues).where(eq(products.id, id)).returning();
    return result[0];
  }

  async getBranches(): Promise<Branch[]> {
    return await db.select().from(branches).where(eq(branches.isActive, true));
  }

  async getBranch(id: number): Promise<Branch | undefined> {
    const result = await db.select().from(branches).where(eq(branches.id, id));
    return result[0];
  }

  async createBranch(branch: InsertBranch): Promise<Branch> {
    const result = await db.insert(branches).values({
      name: branch.name,
      address: branch.address,
      timezone: branch.timezone ?? "UTC",
      isActive: true,
    }).returning();
    return result[0];
  }

  async updateBranch(id: number, update: Partial<InsertBranch>): Promise<Branch> {
    const updateValues: Partial<Branch> = {};
    if (update.name !== undefined) updateValues.name = update.name;
    if (update.address !== undefined) updateValues.address = update.address;
    if (update.timezone !== undefined) updateValues.timezone = update.timezone;
    if (update.isActive !== undefined) updateValues.isActive = update.isActive;
    
    const result = await db.update(branches).set(updateValues).where(eq(branches.id, id)).returning();
    return result[0];
  }

  async getInventory(branchId: number): Promise<(Inventory & { product: Product })[]> {
    const result = await db.select()
      .from(inventory)
      .innerJoin(products, eq(inventory.productId, products.id))
      .where(eq(inventory.branchId, branchId));
    
    return result.map(({ inventory, products }) => ({ ...inventory, product: products }));
  }

  async updateInventory(id: number, update: Partial<InsertInventory>): Promise<Inventory> {
    const updateValues: Partial<Inventory> = {};
    if (update.stock !== undefined) updateValues.stock = update.stock;
    if (update.discount !== undefined) updateValues.discount = update.discount;
    if (update.isAvailable !== undefined) updateValues.isAvailable = update.isAvailable;
    
    const result = await db.update(inventory).set(updateValues).where(eq(inventory.id, id)).returning();
    return result[0];
  }

  async createInventory(item: InsertInventory): Promise<Inventory> {
    const result = await db.insert(inventory).values({
      branchId: item.branchId,
      productId: item.productId,
      stock: item.stock ?? 0,
      discount: item.discount ?? 0,
      isAvailable: item.isAvailable ?? true,
    }).returning();
    return result[0];
  }

  async getSchedules(): Promise<Schedule[]> {
    return await db.select().from(schedules).where(eq(schedules.isActive, true));
  }

  async createSchedule(schedule: InsertSchedule): Promise<Schedule> {
    const daysOfWeekValue = schedule.daysOfWeek
      ? (typeof schedule.daysOfWeek === 'string' ? schedule.daysOfWeek : JSON.stringify(schedule.daysOfWeek))
      : null;
    
    const result = await db.insert(schedules).values({
      name: schedule.name,
      type: schedule.type,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      daysOfWeek: daysOfWeekValue,
      startDate: schedule.startDate,
      endDate: schedule.endDate,
      isActive: true,
    }).returning();
    return result[0];
  }

  async updateSchedule(id: number, update: Partial<InsertSchedule>): Promise<Schedule> {
    const updateValues: Partial<Schedule> = {};
    
    if (update.name !== undefined) updateValues.name = update.name;
    if (update.type !== undefined) updateValues.type = update.type;
    if (update.startTime !== undefined) updateValues.startTime = update.startTime;
    if (update.endTime !== undefined) updateValues.endTime = update.endTime;
    if (update.startDate !== undefined) updateValues.startDate = update.startDate;
    if (update.endDate !== undefined) updateValues.endDate = update.endDate;
    if (update.isActive !== undefined) updateValues.isActive = update.isActive;
    
    if (update.daysOfWeek !== undefined) {
      updateValues.daysOfWeek = typeof update.daysOfWeek === 'string'
        ? update.daysOfWeek
        : JSON.stringify(update.daysOfWeek);
    }
    
    const result = await db.update(schedules).set(updateValues).where(eq(schedules.id, id)).returning();
    return result[0];
  }

  async addScheduleItems(items: InsertScheduleItem[]): Promise<ScheduleItem[]> {
    const itemsValues = items.map(item => ({
      scheduleId: item.scheduleId,
      productId: item.productId,
      priority: item.priority ?? 0,
    }));
    return await db.insert(scheduleItems).values(itemsValues).returning();
  }

  async getScheduleItems(scheduleId: number): Promise<(ScheduleItem & { product: Product })[]> {
    const result = await db.select()
      .from(scheduleItems)
      .innerJoin(products, eq(scheduleItems.productId, products.id))
      .where(eq(scheduleItems.scheduleId, scheduleId));
      
    return result.map(({ schedule_items, products }) => ({ ...schedule_items, product: products }));
  }

  async getActiveMenu(date: Date, time: string, branchId?: number): Promise<Product[]> {
    const allSchedules = await this.getSchedules();
    const dayOfWeek = date.getDay();
    
    const activeScheduleIds = allSchedules.filter(s => {
      if (s.type === 'SEASONAL') {
        // Compare as ISO date strings
        const todayStr = date.toISOString().split('T')[0];
        return s.startDate && s.endDate && todayStr >= s.startDate && todayStr <= s.endDate;
      } else if (s.type === 'TIME_SLOT') {
        const days = parseJsonField<number[] | null>(s.daysOfWeek, null);
        if (!days || !days.includes(dayOfWeek)) return false;
        if (s.startTime && s.endTime) {
          return time >= s.startTime && time <= s.endTime;
        }
        return false;
      }
      return false;
    }).map(s => s.id);

    if (activeScheduleIds.length === 0) return [];

    const items: Product[] = [];
    for (const sid of activeScheduleIds) {
      const scheduleItemsResult = await this.getScheduleItems(sid);
      scheduleItemsResult.forEach(item => items.push(item.product));
    }
    
    return Array.from(new Map(items.map(p => [p.id, p])).values());
  }

  async getProductSchedules(productId: number): Promise<Schedule[]> {
    const items = await db.select()
      .from(scheduleItems)
      .innerJoin(schedules, eq(scheduleItems.scheduleId, schedules.id))
      .where(eq(scheduleItems.productId, productId));
    
    return items.map(({ schedules }) => schedules);
  }

  async updateProductSchedules(productId: number, scheduleIds: number[]): Promise<void> {
    await db.delete(scheduleItems).where(eq(scheduleItems.productId, productId));
    
    if (scheduleIds.length > 0) {
      const newItems = scheduleIds.map(scheduleId => ({
        scheduleId,
        productId,
        priority: 0,
      }));
      await db.insert(scheduleItems).values(newItems);
    }
  }
}

export const storage = new DatabaseStorage();

