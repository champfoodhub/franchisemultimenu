export interface User {
  id: string;
  email: string;
  role: 'HQ' | 'BRANCH';
  hq_id?: string;
  branch_id?: string;
}

export interface Product {
  id: string;
  name: string;
  base_price: number;
  category?: string;
  is_active: boolean;
}

export interface Schedule {
  id: string;
  name: string;
  type: 'TIME_SLOT' | 'SEASONAL';
  start_time?: string;
  end_time?: string;
  start_date?: string;
  end_date?: string;
  day_of_week?: number[];
  timezone?: string;
  is_active?: boolean;
}

export interface ScheduleItem {
  id: string;
  product_id: string;
  schedule_id: string;
}

export interface Branch {
  id: string;
  name: string;
}

export interface Stock {
  id: string;
  product_id: string;
  branch_id: string;
  stock: number;
  discount?: number;
}

export interface MenuItem {
  id: string;
  product_id: string;
  branch_id: string;
  price: number;
  is_active: boolean;
  active?: boolean; // Alias for is_active used in some components
  stock?: number;
  discount?: number;
  category?: string;
  product_name?: string;
}

