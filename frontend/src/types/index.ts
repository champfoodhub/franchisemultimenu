export interface User {
  id: number;
  email: string;
  role: 'HQ' | 'BRANCH';
}

export interface Product {
  id: number;
  name: string;
  price: number;
  category?: string;
}

export interface Schedule {
  id: number;
  name: string;
  type: 'TIME_SLOT' | 'SEASONAL';
  start_time?: string;
  end_time?: string;
  start_date?: string;
  end_date?: string;
}

export interface ScheduleItem {
  id: number;
  product_id: number;
  schedule_id: number;
}

export interface Branch {
  id: number;
  name: string;
}

export interface Stock {
  id: number;
  product_id: number;
  branch_id: number;
  quantity: number;
  discount?: number;
}

export interface MenuItem {
  id: number;
  product_id: number;
  branch_id: number;
  price: number;
  active: boolean;
  stock?: number;
  discount?: number;
  category?: string;
  product_name?: string;
}
