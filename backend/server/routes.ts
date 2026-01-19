import type { Express } from "express";
import { createServer, type Server } from "http";
import passport from "passport";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { setupAuth } from "./auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Auth
  setupAuth(app);

  // === AUTH ROUTES ===
  app.post(api.auth.login.path, (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: info?.message || "Unauthorized" });
      req.login(user, (err: any) => {
        if (err) return next(err);
        const { password, ...safeUser } = user;
        res.json(safeUser);
      });
    })(req, res, next);
  });

  app.post(api.auth.logout.path, (req, res) => {
    req.logout((err) => {
      if (err) return res.status(500).json({ message: "Logout failed" });
      res.sendStatus(200);
    });
  });

  app.get(api.auth.me.path, (req, res) => {
    if (!req.user) return res.status(200).json(null); // return null if not logged in
    const { password, ...safeUser } = req.user as any;
    res.json(safeUser);
  });

  // === HQ ROUTES ===
  app.get(api.products.list.path, async (req, res) => {
    const products = await storage.getProducts();
    res.json(products);
  });

  app.post(api.products.create.path, async (req, res) => {
    // Basic role check example
    // if (req.user?.role !== 'HQ_ADMIN') return res.status(403).send();
    try {
      const input = api.products.create.input.parse(req.body);
      const product = await storage.createProduct(input);
      res.status(201).json(product);
    } catch (e) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.get("/api/branches/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const branch = await storage.getBranch(id);
    if (!branch) return res.status(404).json({ message: "Branch not found" });
    res.json(branch);
  });

  app.put("/api/branches/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const input = api.branches.create.input.partial().parse(req.body);
      const updated = await (storage as any).updateBranch(id, input);
      res.json(updated);
    } catch (e) {
      res.status(400).json({ message: "Invalid update" });
    }
  });

  app.get(api.branches.list.path, async (req, res) => {
    const branches = await storage.getBranches();
    res.json(branches);
  });

  app.post(api.branches.create.path, async (req, res) => {
    try {
      const input = api.branches.create.input.parse(req.body);
      const branch = await storage.createBranch(input);
      res.status(201).json(branch);
    } catch (e) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  // === BRANCH ROUTES ===
  app.get("/api/branches/:branchId/inventory", async (req, res) => {
    const branchId = parseInt(req.params.branchId);
    if (isNaN(branchId)) {
      return res.status(400).json({ message: "Invalid branch ID" });
    }
    const items = await storage.getInventory(branchId);
    res.json(items);
  });

  app.put(api.inventory.update.path, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const input = api.inventory.update.input.parse(req.body);
      const updated = await storage.updateInventory(id, input);
      res.json(updated);
    } catch (e) {
      res.status(400).json({ message: "Invalid update" });
    }
  });

  // === SCHEDULES ===
  app.get(api.schedules.list.path, async (req, res) => {
    const schedules = await storage.getSchedules();
    res.json(schedules);
  });

  app.post(api.schedules.create.path, async (req, res) => {
    try {
      const input = api.schedules.create.input.parse(req.body);
      const schedule = await storage.createSchedule(input);
      res.status(201).json(schedule);
    } catch (e) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.put(api.schedules.update.path, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const input = api.schedules.update.input.parse(req.body);
      const updated = await storage.updateSchedule(id, input);
      res.json(updated);
    } catch (e) {
      res.status(400).json({ message: "Invalid update" });
    }
  });

  // === PRODUCT SCHEDULES ===
  app.get("/api/products/:id/schedules", async (req, res) => {
    const productId = parseInt(req.params.id);
    const schedules = await storage.getProductSchedules(productId);
    res.json(schedules);
  });

  app.put("/api/products/:id/schedules", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const { scheduleIds } = req.body;
      if (!Array.isArray(scheduleIds)) {
        return res.status(400).json({ message: "scheduleIds must be an array" });
      }
      await storage.updateProductSchedules(productId, scheduleIds);
      res.json({ success: true });
    } catch (e) {
      res.status(400).json({ message: "Invalid update" });
    }
  });

  app.post(api.schedules.addItems.path, async (req, res) => {
    const scheduleId = parseInt(req.params.id);
    const { productIds } = req.body; // simple body parsing
    const items = productIds.map((pid: number) => ({
      scheduleId,
      productId: pid
    }));
    const created = await storage.addScheduleItems(items);
    res.json(created);
  });

  app.get(api.schedules.active.path, async (req, res) => {
    const now = new Date();
    // Format HH:MM
    const time = now.toTimeString().slice(0, 5);
    const branchId = req.query.branchId ? parseInt(req.query.branchId as string) : undefined;
    
    const items = await storage.getActiveMenu(now, time, branchId);
    res.json(items);
  });

  return httpServer;
}
