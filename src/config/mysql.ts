import mysql, { Pool, PoolConnection, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import 'dotenv/config';

// MySQL Configuration
const mysqlHost: string = process.env.MYSQL_HOST || 'localhost';
const mysqlPort: number = parseInt(process.env.MYSQL_PORT || '3306');
const mysqlUser: string = process.env.MYSQL_USER || 'root';
const mysqlPassword: string = process.env.MYSQL_PASSWORD || '';
const mysqlDatabase: string = process.env.MYSQL_DATABASE || 'franchisemultimenu';
const mysqlConnectionLimit: number = parseInt(process.env.MYSQL_CONNECTION_LIMIT || '10');

// Create connection pool
const pool: Pool = mysql.createPool({
  host: mysqlHost,
  port: mysqlPort,
  user: mysqlUser,
  password: mysqlPassword,
  database: mysqlDatabase,
  connectionLimit: mysqlConnectionLimit,
  waitForConnections: true,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

// Test connection on startup
const testConnection = async (): Promise<void> => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL connected successfully');
    connection.release();
  } catch (error) {
    console.error('❌ MySQL connection failed:', error);
    throw error;
  }
};

// Helper function to execute queries
export const query = async <T extends RowDataPacket[]>(
  sql: string,
  params?: any[]
): Promise<T> => {
  const [rows] = await pool.execute<T>(sql, params);
  return rows;
};

// Helper function for single row queries
export const queryOne = async <T extends RowDataPacket>(
  sql: string,
  params?: any[]
): Promise<T | null> => {
  const rows = await query<T>(sql, params);
  return rows[0] || null;
};

// Helper function for INSERT/UPDATE/DELETE
export const execute = async (
  sql: string,
  params?: any[]
): Promise<ResultSetHeader> => {
  const [result] = await pool.execute<ResultSetHeader>(sql, params);
  return result;
};

// Helper function to get a connection for transactions
export const getConnection = async (): Promise<PoolConnection> => {
  return pool.getConnection();
};

// Get pool instance
export const getPool = (): Pool => pool;

// Initialize database tables
export const initializeDatabase = async (): Promise<void> => {
  const connection = await pool.getConnection();
  try {
    // Enable UUID generation
    await connection.execute('SET SESSION sql_mode = CONCAT(@@sql_mode, ",NO_AUTO_VALUE_ON_ZERO")');
    console.log('✅ Database initialized');
  } finally {
    connection.release();
  }
};

export default {
  pool,
  query,
  queryOne,
  execute,
  getConnection,
  getPool,
  testConnection,
  initializeDatabase,
};

