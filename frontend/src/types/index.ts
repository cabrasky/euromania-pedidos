// ── Menu Types ──
export interface MenuItem {
  code?: string | null;
  name: string;
  ingredients?: string;
  price?: string;
}

export interface MenuCategory {
  price?: string;
  items: MenuItem[];
}

export interface MenuData {
  [key: string]: MenuCategory;
}

// ── Session Types ──
export interface OrderItem {
  item: { name: string; code?: string | null };
  category: string;
  qty: number;
}

export interface Person {
  name: string;
  items: { [key: string]: OrderItem };
}

export interface SessionData {
  code: string;
  people: Person[];
}

// ── WebSocket Types ──
export interface WsAction {
  type: string;
  person?: string;
  item_key?: string;
  item_name?: string;
  item_code?: string;
  category?: string;
  qty?: number;
  name?: string;
}

export interface WsMessage {
  type: string;
  action?: WsAction;
  code?: string;
  people?: Person[];
}

// ── Toast Types ──
export interface Toast {
  id: number;
  message: string;
  type: 'add' | 'remove' | 'update' | 'info';
}

// ── API Menu Types ──
export interface ApiMenuItemData {
  id: number; code: string; name: string; ingredients: string; price: string;
}

export interface ApiMenuCategoryData {
  id: number; key: string; label: string; icon: string;
  items: ApiMenuItemData[];
}

export interface ApiMenuData {
  id: number; name: string; slug: string; description: string;
  categories: ApiMenuCategoryData[];
}

// ── Admin Types ──
export interface MenuConfig {
  id: number; name: string; slug: string; description: string;
  is_active: boolean; created_at: string | null;
}
