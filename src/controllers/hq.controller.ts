import { Request, Response } from 'express';
import { query, queryOne, execute } from '../config/mysql';
import { success, error } from '../utils/response';
import { ErrorMessage, SuccessMessage } from '../utils/errormessage';
import { CreateProductInput, UpdateProductInput } from '../validators/schemas';

// Define interfaces
interface Product {
  id: number;
  hq_id: number;
  name: string;
  description: string | null;
  base_price: number;
  category: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

interface Branch {
  id: number;
  hq_id: number;
  name: string;
  timezone: string;
  address: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

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

/**
 * Get all products for HQ
 */
export const getProducts = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const hqId = req.user?.hq_id;

  if (!hqId) {
    return error(res, ErrorMessage.HQ_NOT_ASSIGNED, 403);
  }

  try {
    const products = await query<Product>(
      `SELECT * FROM products 
       WHERE hq_id = ? AND is_active = true 
       ORDER BY created_at DESC`,
      [hqId]
    );

    return success(res, products, SuccessMessage.PRODUCT_RETRIEVED);
  } catch (err) {
    console.error('Get products error:', err);
    return error(res, ErrorMessage.SERVER_ERROR, 500);
  }
};

/**
 * Get all branches for HQ
 */
export const getBranches = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const hqId = req.user?.hq_id;

  if (!hqId) {
    return error(res, ErrorMessage.HQ_NOT_ASSIGNED, 403);
  }

  try {
    const branches = await query<Branch>(
      `SELECT * FROM branches 
       WHERE hq_id = ? 
       ORDER BY name ASC`,
      [hqId]
    );

    return success(res, branches, SuccessMessage.BRANCH_RETRIEVED);
  } catch (err) {
    console.error('Get branches error:', err);
    return error(res, ErrorMessage.SERVER_ERROR, 500);
  }
};

/**
 * Get all stock records for HQ
 */
export const getStock = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const hqId = req.user?.hq_id;

  if (!hqId) {
    return error(res, ErrorMessage.HQ_NOT_ASSIGNED, 403);
  }

  try {
    const stockRecords = await query<BranchProduct>(
      `SELECT bp.*, p.name as product_name, b.name as branch_name
       FROM branch_products bp
       JOIN products p ON bp.product_id = p.id
       JOIN branches b ON bp.branch_id = b.id
       WHERE p.hq_id = ?
       ORDER BY bp.created_at DESC`,
      [hqId]
    );

    return success(res, stockRecords, SuccessMessage.STOCK_REPORT_RETRIEVED);
  } catch (err) {
    console.error('Get stock error:', err);
    return error(res, ErrorMessage.SERVER_ERROR, 500);
  }
};

/**
 * Create a new product (HQ only)
 */
export const createProduct = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { name, base_price, category, description } = req.body as CreateProductInput;
  const hqId = req.user?.hq_id;

  if (!hqId) {
    return error(res, ErrorMessage.HQ_NOT_ASSIGNED, 403);
  }

  try {
    const result = await execute(
      `INSERT INTO products (hq_id, name, base_price, category, description) 
       VALUES (?, ?, ?, ?, ?)`,
      [hqId, name, base_price, category || null, description || null]
    );

    const product = await queryOne<Product>(
      `SELECT * FROM products WHERE id = ?`,
      [result.insertId]
    );

    return success(res, product, SuccessMessage.PRODUCT_CREATED);
  } catch (err) {
    console.error('Create product error:', err);
    return error(res, ErrorMessage.SERVER_ERROR, 500);
  }
};

/**
 * Update a product owned by HQ
 */
export const updateProduct = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  const hqId = req.user?.hq_id;
  const updateData = req.body as UpdateProductInput;

  if (!hqId) {
    return error(res, ErrorMessage.HQ_NOT_ASSIGNED, 403);
  }

  try {
    // Build dynamic update query
    const updates: string[] = [];
    const values: any[] = [];

    if (updateData.name !== undefined) {
      updates.push('name = ?');
      values.push(updateData.name);
    }
    if (updateData.base_price !== undefined) {
      updates.push('base_price = ?');
      values.push(updateData.base_price);
    }
    if (updateData.category !== undefined) {
      updates.push('category = ?');
      values.push(updateData.category);
    }

    if (updates.length === 0) {
      return error(res, ErrorMessage.BAD_REQUEST, 400);
    }

    values.push(id, hqId);

    await execute(
      `UPDATE products SET ${updates.join(', ')} WHERE id = ? AND hq_id = ?`,
      values
    );

    const product = await queryOne<Product>(
      `SELECT * FROM products WHERE id = ?`,
      [id]
    );

    if (!product) {
      return error(res, ErrorMessage.NOT_FOUND, 404);
    }

    return success(res, product, SuccessMessage.PRODUCT_UPDATED);
  } catch (err) {
    console.error('Update product error:', err);
    return error(res, ErrorMessage.SERVER_ERROR, 500);
  }
};

/**
 * Soft delete (disable) a product
 */
export const deleteProduct = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  const hqId = req.user?.hq_id;

  if (!hqId) {
    return error(res, ErrorMessage.HQ_NOT_ASSIGNED, 403);
  }

  try {
    const result = await execute(
      `UPDATE products SET is_active = false WHERE id = ? AND hq_id = ?`,
      [id, hqId]
    );

    if (result.affectedRows === 0) {
      return error(res, ErrorMessage.NOT_FOUND, 404);
    }

    return success(res, null, SuccessMessage.PRODUCT_DISABLED);
  } catch (err) {
    console.error('Delete product error:', err);
    return error(res, ErrorMessage.SERVER_ERROR, 500);
  }
};

/**
 * Get HQ-wide stock report (using stored procedure or direct query)
 */
export const stockReport = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const hqId = req.user?.hq_id;

  if (!hqId) {
    return error(res, ErrorMessage.HQ_NOT_ASSIGNED, 403);
  }

  try {
    const report = await query(
      `SELECT 
        bp.product_id,
        p.name as product_name,
        bp.branch_id,
        b.name as branch_name,
        bp.stock,
        bp.discount
      FROM branch_products bp
      JOIN products p ON bp.product_id = p.id
      JOIN branches b ON bp.branch_id = b.id
      WHERE p.hq_id = ?
      ORDER BY b.name, p.name`,
      [hqId]
    );

    return success(res, report, SuccessMessage.STOCK_REPORT_RETRIEVED);
  } catch (err) {
    console.error('Stock report error:', err);
    return error(res, ErrorMessage.SERVER_ERROR, 500);
  }
};

