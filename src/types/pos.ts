export type UserRole = 'admin' | 'branch_manager' | 'supervisor' | 'cashier';

export interface StaffUser {
  id: string;
  name: string;
  role: UserRole;
  roleLabel: string;
  pin: string;
  branchId: string;
  avatar: string;
}

export interface Branch {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  phone: string;
  isMain?: boolean;
}

export type CategoryId = 
  | 'ALL'
  | 'DESSERT'
  | 'MAKANAN'
  | 'MINUMAN'
  | 'SNACK'
  | 'MENU AYAM'
  | 'KUAH'
  | 'KERING'
  | 'JUS'
  | 'SOYA'
  | 'VARIASI ES';

export interface Product {
  id: string;
  name: string;
  category: CategoryId;
  price: number;
  costPrice: number; // HPP
  code: string;
  stockByBranch: Record<string, number>;
  minStock: number;
  imageUrl: string;
  unit: string;
  isAvailable: boolean;
  description?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  notes?: string;
  discount?: number; // discount amount in Rupiah
}

export type ChannelType = 
  | 'DINE IN'
  | 'TAKE AWAY'
  | 'DELIVERY'
  | 'GOFOOD'
  | 'GRABFOOD'
  | 'SHOPEEFOOD';

export type PaymentMethod = 
  | 'QRIS'
  | 'TUNAI'
  | 'DEBIT'
  | 'KREDIT'
  | 'TRANSFER';

export interface Transaction {
  id: string;
  invoiceNo: string;
  branchId: string;
  branchName: string;
  cashierId: string;
  cashierName: string;
  customerName: string;
  channel: ChannelType;
  tableNo?: string;
  items: Array<{
    productId: string;
    name: string;
    category: string;
    price: number;
    costPrice: number;
    quantity: number;
    notes?: string;
    subtotal: number;
  }>;
  subtotal: number;
  tax: number; // PB1
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  cashPaid?: number;
  change?: number;
  qrisReference?: string;
  qrisRrn?: string;
  status: 'PAID' | 'VOID';
  voidReason?: string;
  createdAt: string;
  syncedToCloud: boolean;
}

export interface HeldOrder {
  id: string;
  branchId: string;
  channel: ChannelType;
  customerName: string;
  tableNo?: string;
  items: CartItem[];
  createdAt: string;
  notes?: string;
}

export interface SyncLog {
  id: string;
  time: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

export interface CloudSyncState {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncedAt: string | null;
  pendingSyncCount: number;
  autoSync: boolean;
  logs: SyncLog[];
}
