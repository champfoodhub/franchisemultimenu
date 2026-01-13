/**
 * Unit tests for Zod validation schemas
 */
import {
  loginSchema,
  createProductSchema,
  updateProductSchema,
  stockUpdateSchema,
  discountUpdateSchema,
  menuItemUpdateSchema,
  branchMenuUpdateSchema,
  createMenuItemSchema,
} from '../../src/validators/schemas';

describe('Auth Schemas', () => {
  describe('loginSchema', () => {
    it('should validate valid email and password', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid email format', () => {
      const result = loginSchema.safeParse({
        email: 'invalid-email',
        password: 'password123',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('email');
      }
    });

    it('should reject empty email', () => {
      const result = loginSchema.safeParse({
        email: '',
        password: 'password123',
      });
      expect(result.success).toBe(false);
    });

    it('should reject short password', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: '12345',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('password');
      }
    });
  });
});

describe('Product Schemas', () => {
  describe('createProductSchema', () => {
    it('should validate valid product data', () => {
      const result = createProductSchema.safeParse({
        name: 'Classic Burger',
        base_price: 9.99,
        category: 'Burgers',
      });
      expect(result.success).toBe(true);
    });

    it('should reject missing required fields', () => {
      const result = createProductSchema.safeParse({
        name: 'Classic Burger',
      });
      expect(result.success).toBe(false);
    });

    it('should reject negative price', () => {
      const result = createProductSchema.safeParse({
        name: 'Classic Burger',
        base_price: -9.99,
        category: 'Burgers',
      });
      expect(result.success).toBe(false);
    });

    it('should reject too long name', () => {
      const result = createProductSchema.safeParse({
        name: 'a'.repeat(101),
        base_price: 9.99,
        category: 'Burgers',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('updateProductSchema', () => {
    it('should allow partial updates', () => {
      const result = updateProductSchema.safeParse({
        name: 'Updated Burger',
      });
      expect(result.success).toBe(true);
    });

    it('should allow empty object', () => {
      const result = updateProductSchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });
});

describe('Stock & Discount Schemas', () => {
  describe('stockUpdateSchema', () => {
    it('should validate valid stock value', () => {
      const result = stockUpdateSchema.safeParse({ stock: 100 });
      expect(result.success).toBe(true);
    });

    it('should reject negative stock', () => {
      const result = stockUpdateSchema.safeParse({ stock: -1 });
      expect(result.success).toBe(false);
    });

    it('should reject non-integer stock', () => {
      const result = stockUpdateSchema.safeParse({ stock: 10.5 });
      expect(result.success).toBe(false);
    });
  });

  describe('discountUpdateSchema', () => {
    it('should validate valid discount', () => {
      const result = discountUpdateSchema.safeParse({ discount: 15 });
      expect(result.success).toBe(true);
    });

    it('should reject negative discount', () => {
      const result = discountUpdateSchema.safeParse({ discount: -5 });
      expect(result.success).toBe(false);
    });

    it('should reject discount over 30', () => {
      const result = discountUpdateSchema.safeParse({ discount: 35 });
      expect(result.success).toBe(false);
    });
  });
});

describe('Menu Item Schemas', () => {
  describe('menuItemUpdateSchema', () => {
    it('should validate valid menu item update', () => {
      const result = menuItemUpdateSchema.safeParse({
        name: 'Deluxe Burger',
        price: 12.99,
      });
      expect(result.success).toBe(true);
    });

    it('should reject negative price', () => {
      const result = menuItemUpdateSchema.safeParse({
        price: -1,
      });
      expect(result.success).toBe(false);
    });

    it('should allow partial updates', () => {
      const result = menuItemUpdateSchema.safeParse({
        is_active: false,
      });
      expect(result.success).toBe(true);
    });
  });

  describe('branchMenuUpdateSchema', () => {
    it('should validate valid branch menu update', () => {
      const result = branchMenuUpdateSchema.safeParse({
        stock: 50,
        discount_percent: 10,
      });
      expect(result.success).toBe(true);
    });

    it('should allow partial updates', () => {
      const result = branchMenuUpdateSchema.safeParse({
        stock: 50,
      });
      expect(result.success).toBe(true);
    });

    it('should reject discount over 30', () => {
      const result = branchMenuUpdateSchema.safeParse({
        discount_percent: 35,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('createMenuItemSchema', () => {
    it('should validate valid menu item creation', () => {
      const result = createMenuItemSchema.safeParse({
        product_id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Deluxe Burger',
        price: 12.99,
        category: 'Burgers',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid UUID for product_id', () => {
      const result = createMenuItemSchema.safeParse({
        product_id: 'invalid-uuid',
        name: 'Deluxe Burger',
        price: 12.99,
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid image URL', () => {
      const result = createMenuItemSchema.safeParse({
        product_id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Deluxe Burger',
        price: 12.99,
        image_url: 'not-a-url',
      });
      expect(result.success).toBe(false);
    });
  });
});

