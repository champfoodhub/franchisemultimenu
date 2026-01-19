/**
 * API Tests for Product Schedules Endpoints
 * Tests the backend functionality for managing product-menu assignments
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { storage, seed } from '../../server/mock-storage';

// Note: These tests are designed to run with the storage layer directly
// In a full integration test, you would use supertest with the Express app

describe('Product Schedules API', () => {
  beforeAll(async () => {
    await seed(); // Ensure test data exists
  });

  describe('GET /api/products/:id/schedules', () => {
    it('should return schedules for a valid product', async () => {
      // First create a product and schedules, then assign them
      const products = await storage.getProducts();
      const schedules = await storage.getSchedules();
      
      expect(products.length).toBeGreaterThan(0);
      expect(schedules.length).toBeGreaterThan(0);

      const product = products[0];
      
      // Assign the product to a schedule
      await storage.updateProductSchedules(product.id, [schedules[0].id]);

      const result = await storage.getProductSchedules(product.id);
      
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result[0].id).toBe(schedules[0].id);
    });

    it('should return empty array for product with no schedules', async () => {
      const products = await storage.getProducts();
      const product = products[products.length - 1]; // Get last product
      
      // Clear any existing schedules
      await storage.updateProductSchedules(product.id, []);
      
      const result = await storage.getProductSchedules(product.id);
      
      expect(result).toBeDefined();
      expect(result).toHaveLength(0);
    });
  });

  describe('PUT /api/products/:id/schedules', () => {
    it('should update product schedules successfully', async () => {
      const products = await storage.getProducts();
      const schedules = await storage.getSchedules();
      const product = products[0];

      // Assign multiple schedules
      const scheduleIds = schedules.slice(0, 2).map((s) => s.id);
      
      await storage.updateProductSchedules(product.id, scheduleIds);
      
      const result = await storage.getProductSchedules(product.id);
      
      expect(result).toHaveLength(2);
      expect(result.map((s) => s.id).sort()).toEqual(scheduleIds.sort());
    });

    it('should replace existing schedules', async () => {
      const products = await storage.getProducts();
      const schedules = await storage.getSchedules();
      const product = products[0];

      // Initial assignment
      await storage.updateProductSchedules(product.id, [schedules[0].id]);
      
      // Replace with different schedule
      await storage.updateProductSchedules(product.id, [schedules[1].id]);
      
      const result = await storage.getProductSchedules(product.id);
      
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(schedules[1].id);
    });

    it('should handle empty schedule array (clear all)', async () => {
      const products = await storage.getProducts();
      const schedules = await storage.getSchedules();
      const product = products[0];

      // First assign a schedule
      await storage.updateProductSchedules(product.id, [schedules[0].id]);
      expect(await storage.getProductSchedules(product.id)).toHaveLength(1);

      // Then clear it
      await storage.updateProductSchedules(product.id, []);
      
      const result = await storage.getProductSchedules(product.id);
      expect(result).toHaveLength(0);
    });
  });

  describe('Storage Methods', () => {
    it('should correctly get and update product schedules', async () => {
      const products = await storage.getProducts();
      const schedules = await storage.getSchedules();
      
      // Test basic get/set
      await storage.updateProductSchedules(products[0].id, [schedules[0].id]);
      const result = await storage.getProductSchedules(products[0].id);
      
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].name).toBeDefined();
    });

    it('should handle concurrent updates', async () => {
      const products = await storage.getProducts();
      const schedules = await storage.getSchedules();
      const product = products[0];

      // Simulate concurrent updates
      await Promise.all([
        storage.updateProductSchedules(product.id, [schedules[0].id]),
        storage.updateProductSchedules(product.id, [schedules[1].id]),
      ]);

      // Final state should have one of them
      const result = await storage.getProductSchedules(product.id);
      expect(result.length).toBe(1);
    });
  });
});

describe('Product Schedules Integration', () => {
  it('should maintain data integrity across operations', async () => {
    const products = await storage.getProducts();
    const schedules = await storage.getSchedules();
    const product = products[0];

    // 1. Start with no schedules
    await storage.updateProductSchedules(product.id, []);
    let productSchedules = await storage.getProductSchedules(product.id);
    expect(productSchedules).toHaveLength(0);

    // 2. Add first schedule
    await storage.updateProductSchedules(product.id, [schedules[0].id]);
    productSchedules = await storage.getProductSchedules(product.id);
    expect(productSchedules).toHaveLength(1);
    expect(productSchedules[0].id).toBe(schedules[0].id);

    // 3. Add second schedule (should have both)
    await storage.updateProductSchedules(product.id, [
      schedules[0].id,
      schedules[1].id
    ]);
    productSchedules = await storage.getProductSchedules(product.id);
    expect(productSchedules).toHaveLength(2);

    // 4. Remove first schedule
    await storage.updateProductSchedules(product.id, [schedules[1].id]);
    productSchedules = await storage.getProductSchedules(product.id);
    expect(productSchedules).toHaveLength(1);
    expect(productSchedules[0].id).toBe(schedules[1].id);

    // 5. Clear all
    await storage.updateProductSchedules(product.id, []);
    productSchedules = await storage.getProductSchedules(product.id);
    expect(productSchedules).toHaveLength(0);
  });
});

