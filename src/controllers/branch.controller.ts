import { Request, Response } from 'express';
import { query, queryOne, execute } from '../config/mysql';
import { success, error } from '../utils/response';
import { ErrorMessage, SuccessMessage } from '../utils/errormessage';
import { StockUpdateInput, DiscountUpdateInput } from '../validators/schemas';

// Define interfaces
interface BranchProduct {
  id: number;
  branch_id: number;
  product_id: number;
  stock: number;
  discount: number;
  is_available: boolean;
  created_at: Date;
  updated_at: Date;
}

interface MenuItem {
  id: number;
  product_id: number;
  branch_id: number | null;
  name: string;
  price: number;
  description: string | null;
  category: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

interface BranchMenu {
  id: number;
  menu_id: number;
  branch_id: number;
  stock: number;
  discount_percent: number;
  is_available: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * Update product stock for a branch
 */
export const updateStock = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  const { stock } = req.body as StockUpdateInput;
  const branchId = req.user?.branch_id;

  if (!branchId) {
    return error(res, ErrorMessage.BRANCH_NOT_ASSIGNED, 403);
  }

  try {
    const result = await execute(
      `UPDATE branch_products SET stock = ? 
       WHERE product_id = ? AND branch_id = ?`,
      [stock, id, branchId]
    );

    if (result.affectedRows === 0) {
      return error(res, ErrorMessage.RECORD_NOT_FOUND, 404);
    }

    return success(res, null, SuccessMessage.STOCK_UPDATED);
  } catch (err) {
    console.error('Update stock error:', err);
    return error(res, ErrorMessage.SERVER_ERROR, 500);
  }
};

/**
 * Update product discount for a branch
 */
export const updateDiscount = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  const { discount } = req.body as DiscountUpdateInput;
  const branchId = req.user?.branch_id;

  if (!branchId) {
    return error(res, ErrorMessage.BRANCH_NOT_ASSIGNED, 403);
  }

  try {
    const result = await execute(
      `UPDATE branch_products SET discount = ? 
       WHERE product_id = ? AND branch_id = ?`,
      [discount, id, branchId]
    );

    if (result.affectedRows === 0) {
      return error(res, ErrorMessage.RECORD_NOT_FOUND, 404);
    }

    return success(res, null, SuccessMessage.DISCOUNT_UPDATED);
  } catch (err) {
    console.error('Update discount error:', err);
    return error(res, ErrorMessage.SERVER_ERROR, 500);
  }
};

/**
 * Get branch-specific menu
 */
export const getMenu = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const branchId = req.user?.branch_id;

  if (!branchId) {
    return error(res, ErrorMessage.BRANCH_NOT_ASSIGNED, 403);
  }

  try {
    // Get menu items with branch-specific configuration
    const menuItems = await query<any>(
      `SELECT 
        m.id,
        m.name,
        m.price,
        m.category,
        m.description,
        m.image_url,
        m.is_active,
        COALESCE(bm.stock, 0) as stock,
        COALESCE(bm.discount_percent, 0) as discount_percent,
        bm.is_available as is_available
      FROM menu m
      LEFT JOIN branch_menu bm ON m.id = bm.menu_id AND bm.branch_id = ?
      WHERE m.is_active = true
        AND (m.branch_id IS NULL OR m.branch_id = ?)
      ORDER BY m.category, m.name`,
      [branchId, branchId]
    );

    return success(res, menuItems, SuccessMessage.MENU_RETRIEVED);
  } catch (err) {
    console.error('Get menu error:', err);
    return error(res, ErrorMessage.SERVER_ERROR, 500);
  }
};

/**
 * Get branch information
 */
export const getBranch = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const branchId = req.user?.branch_id;

  if (!branchId) {
    return error(res, ErrorMessage.BRANCH_NOT_ASSIGNED, 403);
  }

  try {
    const branch = await queryOne(
      `SELECT * FROM branches WHERE id = ?`,
      [branchId]
    );

    if (!branch) {
      return error(res, ErrorMessage.NOT_FOUND, 404);
    }

    return success(res, branch, SuccessMessage.BRANCH_RETRIEVED);
  } catch (err) {
    console.error('Get branch error:', err);
    return error(res, ErrorMessage.SERVER_ERROR, 500);
  }
};

/**
 * Get branch products with stock
 */
export const getBranchProducts = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const branchId = req.user?.branch_id;

  if (!branchId) {
    return error(res, ErrorMessage.BRANCH_NOT_ASSIGNED, 403);
  }

  try {
    const products = await query<any>(
      `SELECT 
        bp.*,
        p.name as product_name,
        p.base_price,
        p.category
      FROM branch_products bp
      JOIN products p ON bp.product_id = p.id
      WHERE bp.branch_id = ?
      ORDER BY p.name`,
      [branchId]
    );

    return success(res, products, SuccessMessage.PRODUCT_RETRIEVED);
  } catch (err) {
    console.error('Get branch products error:', err);
    return error(res, ErrorMessage.SERVER_ERROR, 500);
  }
};

/**
 * Update branch-specific menu item (stock/discount)
 */
export const updateBranchMenuItem = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  const { stock, discount_percent } = req.body;
  const branchId = req.user?.branch_id;

  if (!branchId) {
    return error(res, ErrorMessage.BRANCH_NOT_ASSIGNED, 403);
  }

  try {
    // Check if branch_menu record exists, if not create it
    const existing = await queryOne<BranchMenu>(
      `SELECT * FROM branch_menu WHERE menu_id = ? AND branch_id = ?`,
      [id, branchId]
    );

    if (existing) {
      // Update existing record
      const updates: string[] = [];
      const values: any[] = [];

      if (stock !== undefined) {
        updates.push('stock = ?');
        values.push(stock);
      }
      if (discount_percent !== undefined) {
        updates.push('discount_percent = ?');
        values.push(discount_percent);
      }

      if (updates.length > 0) {
        values.push(existing.id);
        await execute(
          `UPDATE branch_menu SET ${updates.join(', ')} WHERE id = ?`,
          values
        );
      }
    } else {
      // Create new branch_menu record
      await execute(
        `INSERT INTO branch_menu (menu_id, branch_id, stock, discount_percent) 
         VALUES (?, ?, ?, ?)`,
        [id, branchId, stock ?? 0, discount_percent ?? 0]
      );
    }

    const updatedItem = await queryOne<BranchMenu>(
      `SELECT * FROM branch_menu WHERE menu_id = ? AND branch_id = ?`,
      [id, branchId]
    );

    return success(res, updatedItem, SuccessMessage.BRANCH_MENU_UPDATED);
  } catch (err) {
    console.error('Update branch menu error:', err);
    return error(res, ErrorMessage.SERVER_ERROR, 500);
  }
};

