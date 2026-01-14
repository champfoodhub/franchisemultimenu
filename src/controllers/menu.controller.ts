import { Request, Response } from 'express';
import { query, queryOne, execute } from '../config/mysql';
import { success, error } from '../utils/response';
import { ErrorMessage, SuccessMessage } from '../utils/errormessage';
import { MenuItemUpdateInput, BranchMenuUpdateInput } from '../validators/schemas';

// Define interfaces
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
 * Update a menu item (HQ only)
 */
export const updateMenuItem = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id: menuId } = req.params;
  const { name, price, category, is_active } = req.body as MenuItemUpdateInput;

  try {
    const updates: string[] = [];
    const values: any[] = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (price !== undefined) {
      updates.push('price = ?');
      values.push(price);
    }
    if (category !== undefined) {
      updates.push('category = ?');
      values.push(category);
    }
    if (is_active !== undefined) {
      updates.push('is_active = ?');
      values.push(is_active);
    }

    if (updates.length === 0) {
      return error(res, ErrorMessage.BAD_REQUEST, 400);
    }

    values.push(menuId);

    await execute(
      `UPDATE menu SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    const menuItem = await queryOne<MenuItem>(
      `SELECT * FROM menu WHERE id = ?`,
      [menuId]
    );

    if (!menuItem) {
      return error(res, ErrorMessage.NOT_FOUND, 404);
    }

    return success(res, menuItem, SuccessMessage.MENU_ITEM_UPDATED_SUCCESSFULLY);
  } catch (err) {
    console.error('Update menu item error:', err);
    return error(res, ErrorMessage.SERVER_ERROR, 500);
  }
};

/**
 * Delete a menu item (HQ only)
 */
export const deleteMenuItem = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id: menuId } = req.params;

  try {
    const result = await execute(
      `UPDATE menu SET is_active = false WHERE id = ?`,
      [menuId]
    );

    if (result.affectedRows === 0) {
      return error(res, ErrorMessage.NOT_FOUND, 404);
    }

    return success(res, null, SuccessMessage.MENU_ITEM_DELETED_SUCCESSFULLY);
  } catch (err) {
    console.error('Delete menu item error:', err);
    return error(res, ErrorMessage.SERVER_ERROR, 500);
  }
};

/**
 * Update branch-specific menu (stock/discount)
 */
export const updateBranchMenu = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id: menuId } = req.params;
  const { stock, discount_percent } = req.body as BranchMenuUpdateInput;
  const branchId = req.user?.branch_id;

  if (!branchId) {
    return error(res, ErrorMessage.BRANCH_NOT_ASSIGNED, 403);
  }

  try {
    // Check if record exists
    const existing = await queryOne<BranchMenu>(
      `SELECT * FROM branch_menu WHERE menu_id = ? AND branch_id = ?`,
      [menuId, branchId]
    );

    if (existing) {
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
      await execute(
        `INSERT INTO branch_menu (menu_id, branch_id, stock, discount_percent) 
         VALUES (?, ?, ?, ?)`,
        [menuId, branchId, stock ?? 0, discount_percent ?? 0]
      );
    }

    const updatedItem = await queryOne<BranchMenu>(
      `SELECT * FROM branch_menu WHERE menu_id = ? AND branch_id = ?`,
      [menuId, branchId]
    );

    return success(res, updatedItem, SuccessMessage.BRANCH_MENU_UPDATED);
  } catch (err) {
    console.error('Update branch menu error:', err);
    return error(res, ErrorMessage.SERVER_ERROR, 500);
  }
};

/**
 * Create a menu item (HQ only)
 */
export const createMenuItem = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { product_id, branch_id, name, price, description, category, image_url } = req.body;

  try {
    const result = await execute(
      `INSERT INTO menu (product_id, branch_id, name, price, description, category, image_url) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        product_id,
        branch_id || null,
        name,
        price,
        description || null,
        category || null,
        image_url || null,
      ]
    );

    const menuItem = await queryOne<MenuItem>(
      `SELECT * FROM menu WHERE id = ?`,
      [result.insertId]
    );

    return success(res, menuItem, SuccessMessage.CREATED);
  } catch (err) {
    console.error('Create menu item error:', err);
    return error(res, ErrorMessage.SERVER_ERROR, 500);
  }
};

/**
 * Get all menu items
 */
export const getAllMenuItems = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const menuItems = await query<MenuItem>(
      `SELECT * FROM menu WHERE is_active = true ORDER BY category, name`
    );

    return success(res, menuItems, SuccessMessage.RETRIEVED);
  } catch (err) {
    console.error('Get all menu items error:', err);
    return error(res, ErrorMessage.SERVER_ERROR, 500);
  }
};

