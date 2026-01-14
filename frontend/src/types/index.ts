export interface User {
  id: number;
  email: string;
  role: 'HQ' | 'BRANCH' | 'ADMIN';
  hq_id?: number;
  branch_id?: number;
  full_name?: string;
}

export interface Product {
  id: number;
  hq_id: number;
  name: string;
  base_price: number;
  category?: string;
  description?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Schedule {
  id: number;
  hq_id: number;
  name: string;
  type: 'TIME_SLOT' | 'SEASONAL';
  start_time?: string;
  end_time?: string;
  start_date?: string;
  end_date?: string;
  day_of_week?: number[];
  timezone?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ScheduleItem {
  id: number;
  schedule_id: number;
  menu_item_id: number;
  priority?: number;
  is_featured?: boolean;
  menu_item_name?: string;
  price?: number;
  category?: string;
}

export interface Branch {
  id: number;
  hq_id: number;
  name: string;
  timezone?: string;
  address?: string;
  is_active?: boolean;
}

export interface Stock {
  id: number;
  product_id: number;
  branch_id: number;
  stock: number;
  discount?: number;
  is_available?: boolean;
  product_name?: string;
  branch_name?: string;
}

export interface MenuItem {
  id: number;
  product_id: number;
  branch_id: number | null;
  name: string;
  price: number;
  description?: string;
  category?: string;
  image_url?: string;
  is_active: boolean;
  active?: boolean; // Alias for is_active used in some components
  stock?: number;
  discount_percent?: number;
  discount?: number;
  menu_item_name?: string;
  menu_item_price?: number;
  menu_item_category?: string;
  menu_item_description?: string;
}

// Auth response types
export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: User;
}

// Time-based menu response
export interface TimeBasedMenuResponse {
  current_time: string;
  current_date: string;
  active_schedules: number;
  schedules: Array<{
    schedule: {
      id: number;
      name: string;
      type: string;
      timezone: string;
    };
    items: ScheduleItem[];
    itemCount: number;
  }>;
}

// Available time slots response
export interface TimeSlot {
  schedule_id: number;
  schedule_name: string;
  start_time: string;
  end_time: string;
  timezone: string;
}

export interface AvailableTimeSlotsResponse {
  date: string;
  day_name: string;
  available_slots: TimeSlot[];
}

