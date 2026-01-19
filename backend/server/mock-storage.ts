// Mock in-memory storage for local development without PostgreSQL
import type {
  User, InsertUser, Product, InsertProduct,
  Branch, InsertBranch, Inventory, InsertInventory,
  Schedule, InsertSchedule, ScheduleItem, InsertScheduleItem
} from "@shared/schema";
import { hashPassword } from "./utils";

// In-memory data stores
const usersStore: Map<number, User> = new Map();
const productsStore: Map<number, Product> = new Map();
const branchesStore: Map<number, Branch> = new Map();
const inventoryStore: Map<number, Inventory> = new Map();
const schedulesStore: Map<number, Schedule> = new Map();
const scheduleItemsStore: Map<number, ScheduleItem> = new Map();

// Auto-increment counters
let userId = 1;
let productId = 1;
let branchId = 1;
let inventoryId = 1;
let scheduleId = 1;
let scheduleItemId = 1;

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product>;
  
  getBranches(): Promise<Branch[]>;
  getBranch(id: number): Promise<Branch | undefined>;
  createBranch(branch: InsertBranch): Promise<Branch>;
  updateBranch(id: number, branch: Partial<InsertBranch>): Promise<Branch>;
  
  getInventory(branchId: number): Promise<(Inventory & { product: Product })[]>;
  updateInventory(id: number, update: Partial<InsertInventory>): Promise<Inventory>;
  createInventory(item: InsertInventory): Promise<Inventory>;
  
  getSchedules(): Promise<Schedule[]>;
  createSchedule(schedule: InsertSchedule): Promise<Schedule>;
  updateSchedule(id: number, schedule: Partial<InsertSchedule>): Promise<Schedule>;
  addScheduleItems(items: InsertScheduleItem[]): Promise<ScheduleItem[]>;
  getScheduleItems(scheduleId: number): Promise<(ScheduleItem & { product: Product })[]>;
  
  getActiveMenu(date: Date, time: string, branchId?: number): Promise<Product[]>;
  getProductSchedules(productId: number): Promise<Schedule[]>;
  updateProductSchedules(productId: number, scheduleIds: number[]): Promise<void>;
}

export class MockStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    return usersStore.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    for (const user of Array.from(usersStore.values())) {
      if (user.username === username) return user;
    }
    return undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      id: userId++,
      username: insertUser.username,
      password: insertUser.password,
      role: insertUser.role,
      name: insertUser.name,
      branchId: insertUser.branchId ?? null,
      createdAt: new Date(),
    };
    usersStore.set(user.id, user);
    return user;
  }

  async getProducts(): Promise<Product[]> {
    return Array.from(productsStore.values()).filter(p => p.isActive) as Product[];
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return productsStore.get(id) as Product | undefined;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const newProduct: Product = {
      id: productId++,
      name: product.name,
      description: product.description,
      basePrice: product.basePrice,
      category: product.category,
      imageUrl: product.imageUrl,
      isActive: true,
    };
    productsStore.set(newProduct.id, newProduct);
    return newProduct;
  }

  async updateProduct(id: number, update: Partial<InsertProduct>): Promise<Product> {
    const product = productsStore.get(id);
    if (!product) throw new Error("Product not found");
    const updated = { ...product, ...update };
    productsStore.set(id, updated);
    return updated;
  }

  async getBranches(): Promise<Branch[]> {
    return Array.from(branchesStore.values()).filter(b => b.isActive) as Branch[];
  }

  async getBranch(id: number): Promise<Branch | undefined> {
    return branchesStore.get(id) as Branch | undefined;
  }

  async createBranch(branch: InsertBranch): Promise<Branch> {
    const newBranch: Branch = {
      id: branchId++,
      name: branch.name,
      address: branch.address,
      timezone: branch.timezone ?? "UTC",
      isActive: true,
    };
    branchesStore.set(newBranch.id, newBranch);
    return newBranch;
  }

  async updateBranch(id: number, update: Partial<InsertBranch>): Promise<Branch> {
    const branch = branchesStore.get(id);
    if (!branch) throw new Error("Branch not found");
    const updated = { ...branch, ...update };
    branchesStore.set(id, updated);
    return updated;
  }

  async getInventory(branchId: number): Promise<(Inventory & { product: Product })[]> {
    const result: (Inventory & { product: Product })[] = [];
    for (const inv of Array.from(inventoryStore.values())) {
      if (inv.branchId === branchId) {
        const product = productsStore.get(inv.productId);
        if (product) {
          result.push({ ...inv, product });
        }
      }
    }
    return result;
  }

  async updateInventory(id: number, update: Partial<InsertInventory>): Promise<Inventory> {
    const inv = inventoryStore.get(id);
    if (!inv) throw new Error("Inventory item not found");
    const updated = { ...inv, ...update, updatedAt: new Date() };
    inventoryStore.set(id, updated);
    return updated;
  }

  async createInventory(item: InsertInventory): Promise<Inventory> {
    const newItem: Inventory = {
      id: inventoryId++,
      branchId: item.branchId,
      productId: item.productId,
      stock: item.stock ?? 0,
      discount: item.discount ?? 0,
      isAvailable: item.isAvailable ?? true,
      updatedAt: new Date(),
    };
    inventoryStore.set(newItem.id, newItem);
    return newItem;
  }

  async getSchedules(): Promise<Schedule[]> {
    return Array.from(schedulesStore.values()).filter(s => s.isActive) as Schedule[];
  }

  async createSchedule(schedule: InsertSchedule): Promise<Schedule> {
    const newSchedule: Schedule = {
      id: scheduleId++,
      name: schedule.name,
      type: schedule.type,
      startTime: schedule.startTime ?? null,
      endTime: schedule.endTime ?? null,
      daysOfWeek: schedule.daysOfWeek ?? null,
      startDate: schedule.startDate ?? null,
      endDate: schedule.endDate ?? null,
      isActive: true,
    };
    schedulesStore.set(newSchedule.id, newSchedule);
    return newSchedule;
  }

  async addScheduleItems(items: InsertScheduleItem[]): Promise<ScheduleItem[]> {
    const created: ScheduleItem[] = [];
    for (const item of items) {
      const newItem: ScheduleItem = {
        id: scheduleItemId++,
        scheduleId: item.scheduleId,
        productId: item.productId,
        priority: item.priority ?? null,
      };
      scheduleItemsStore.set(newItem.id, newItem);
      created.push(newItem);
    }
    return created;
  }

  async getScheduleItems(scheduleId: number): Promise<(ScheduleItem & { product: Product })[]> {
    const result: (ScheduleItem & { product: Product })[] = [];
    for (const item of Array.from(scheduleItemsStore.values())) {
      if (item.scheduleId === scheduleId) {
        const product = productsStore.get(item.productId);
        if (product) {
          result.push({ ...item, product });
        }
      }
    }
    return result;
  }

  async getActiveMenu(date: Date, time: string, branchId?: number): Promise<Product[]> {
    const allSchedules = await this.getSchedules();
    const dayOfWeek = date.getDay();
    
    const activeScheduleIds = allSchedules.filter(s => {
      if (s.type === 'SEASONAL') {
        return s.startDate && s.endDate && date >= s.startDate && date <= s.endDate;
      } else if (s.type === 'TIME_SLOT') {
        const days = s.daysOfWeek as number[] | null;
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
      const scheduleItems = await this.getScheduleItems(sid);
      scheduleItems.forEach(item => items.push(item.product));
    }
    
    return Array.from(new Map(items.map(p => [p.id, p])).values());
  }

  async updateSchedule(id: number, update: Partial<InsertSchedule>): Promise<Schedule> {
    const schedule = schedulesStore.get(id);
    if (!schedule) throw new Error("Schedule not found");
    const updated = { ...schedule, ...update };
    schedulesStore.set(id, updated);
    return updated;
  }

  async getProductSchedules(productId: number): Promise<Schedule[]> {
    const result: Schedule[] = [];
    for (const item of Array.from(scheduleItemsStore.values())) {
      if (item.productId === productId) {
        const schedule = schedulesStore.get(item.scheduleId);
        if (schedule && schedule.isActive) {
          result.push(schedule);
        }
      }
    }
    return result;
  }

  async updateProductSchedules(productId: number, scheduleIds: number[]): Promise<void> {
    // Delete existing schedule items for this product
    for (const [id, item] of Array.from(scheduleItemsStore.entries())) {
      if (item.productId === productId) {
        scheduleItemsStore.delete(id);
      }
    }
    
    // Insert new schedule items
    for (const scheduleId of scheduleIds) {
      const newItem: ScheduleItem = {
        id: scheduleItemId++,
        scheduleId,
        productId,
        priority: 0,
      };
      scheduleItemsStore.set(newItem.id, newItem);
    }
  }
}

export const storage = new MockStorage();

// Seed data initialization
export async function seed() {
  const existingUsers = await storage.getUserByUsername("hq");
  if (!existingUsers) {
    const hashedPassword = await hashPassword("password123");
    
    await storage.createUser({
      username: "hq",
      password: hashedPassword,
      role: "HQ_ADMIN",
      name: "HQ Administrator",
      branchId: null
    });

    await storage.createUser({
      username: "manager",
      password: hashedPassword,
      role: "BRANCH_MANAGER",
      name: "Branch Manager",
      branchId: 1
    });

    const branch1 = await storage.createBranch({
      name: "Downtown Hub",
      address: "123 Main St",
      timezone: "EST"
    });

    const p1 = await storage.createProduct({
      name: "Signature Burger",
      description: "Double patty with cheese",
      basePrice: 12.99,
      category: "Burgers",
      imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80"
    });

    const p2 = await storage.createProduct({
      name: "Morning Pancakes",
      description: "Fluffy stack with syrup",
      basePrice: 9.99,
      category: "Breakfast",
      imageUrl: "https://images.unsplash.com/photo-1554520735-0a6b8b6ce8b7?w=800&q=80"
    });

    await storage.createInventory({
      branchId: branch1.id,
      productId: p1.id,
      stock: 50,
      discount: 0,
      isAvailable: true
    });

    await storage.createInventory({
      branchId: branch1.id,
      productId: p2.id,
      stock: 30,
      discount: 10,
      isAvailable: true
    });

    const breakfast = await storage.createSchedule({
      name: "Breakfast Menu",
      type: "TIME_SLOT",
      startTime: "06:00",
      endTime: "11:00",
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      startDate: null,
      endDate: null
    });
    
    const main = await storage.createSchedule({
      name: "Main Menu",
      type: "TIME_SLOT",
      startTime: "11:00",
      endTime: "22:00",
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      startDate: null,
      endDate: null
    });

    await storage.addScheduleItems([
      { scheduleId: breakfast.id, productId: p2.id, priority: 1 },
      { scheduleId: main.id, productId: p1.id, priority: 1 }
    ]);

    console.log("✅ Mock database seeded successfully!");
    console.log("   - Users: hq (password123), manager (password123)");
  }
}

