import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  description?: string;
  is_available?: number;
  isCustomizable?: boolean;
}

export interface AyamOptions {
  part: 'Dada' | 'Paha Atas' | 'Sayap' | 'Paha Bawah';
  spicyLevel: number;
  isSeparated: boolean;
  notes?: string;
  variant?: 'original' | 'sambal-ijo' | 'sambal-matah';
  extras?: {
    nasi: number;
    telur: number;
    tempe: number;
    tahu: number;
  };
}

export interface OrderItem extends MenuItem {
  quantity: number;
  options?: AyamOptions;
  uniqueId?: string;
}

export interface Transaction {
  id: string;
  transaction_code: string;
  date: Date;
  items: OrderItem[];
  total: number;
  paymentMethod: 'tunai' | 'qris';
  cashReceived?: number;
  change?: number;
}

export interface TemporaryOrder {
  menuItem: MenuItem;
  options?: AyamOptions;
}

interface AppContextType {
  menuItems: MenuItem[];
  currentOrder: OrderItem[];
  transactions: Transaction[];
  temporaryOrder: TemporaryOrder | null;
  isLoadingMenu: boolean;
  setTemporaryOrder: (order: TemporaryOrder | null) => void;
  addToOrder: (item: MenuItem, options?: AyamOptions) => void;
  removeFromOrder: (uniqueId: string) => void;
  updateOrderQuantity: (uniqueId: string, quantity: number) => void;
  clearOrder: () => void;
  completeTransaction: (paymentMethod: 'tunai' | 'qris', cashReceived?: number) => Promise<boolean>;
  updateStock: (itemId: string, jumlah: number, tipe: 'tambah' | 'kurangi') => Promise<void>;
  updateMenuItem: (item: MenuItem) => Promise<void>;
  addMenuItem: (item: Omit<MenuItem, 'id'>) => Promise<void>;
  deleteMenuItem: (itemId: string) => Promise<void>;
  refreshMenu: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const API_URL = 'http://localhost:5000/api';

export function AppProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [temporaryOrder, setTemporaryOrder] = useState<TemporaryOrder | null>(null);
  const [isLoadingMenu, setIsLoadingMenu] = useState(false);

  // Helper: header dengan token
  const authHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  });

  // Helper: cek apakah menu ayam berdasarkan kategori
  const isAyamMenu = (category: string) =>
    category.toLowerCase().includes('ayam') || category === 'paket_ayam';

  // Fetch menu dari BE
  const refreshMenu = async () => {
    if (!token) return;
    setIsLoadingMenu(true);
    try {
      const res = await fetch(`${API_URL}/menu`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) {
        const mapped = data.data.map((item: any) => ({
          ...item,
          price: parseInt(item.price),
          isCustomizable: isAyamMenu(item.category),
        }));
        setMenuItems(mapped);
      }
    } catch (err) {
      console.error('refreshMenu error:', err);
    } finally {
      setIsLoadingMenu(false);
    }
  };

  // Auto-fetch menu saat token tersedia
  useEffect(() => {
    if (token) refreshMenu();
    else setMenuItems([]);
  }, [token]);

  // === ORDER ===
  const generateUniqueId = (itemId: string, options?: AyamOptions): string => {
    if (!options) return itemId;
    return `${itemId}-${options.part}-${options.spicyLevel}-${options.isSeparated}`;
  };

  const addToOrder = (item: MenuItem, options?: AyamOptions) => {
    if (item.isCustomizable && !options) {
      console.error('Menu ayam harus memiliki opsi kustomisasi!');
      return;
    }
    if (!item.isCustomizable && options) {
      options = undefined;
    }

    const uniqueId = generateUniqueId(item.id, options);

    setCurrentOrder(prev => {
      const existingIndex = prev.findIndex(i => i.uniqueId === uniqueId);
      if (existingIndex !== -1) {
        const newOrder = [...prev];
        newOrder[existingIndex] = {
          ...newOrder[existingIndex],
          quantity: newOrder[existingIndex].quantity + 1,
        };
        return newOrder;
      }
      return [...prev, { ...item, quantity: 1, options, uniqueId }];
    });
  };

  const removeFromOrder = (uniqueId: string) => {
    setCurrentOrder(prev => prev.filter(item => item.uniqueId !== uniqueId));
  };

  const updateOrderQuantity = (uniqueId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromOrder(uniqueId);
      return;
    }
    setCurrentOrder(prev =>
      prev.map(item => item.uniqueId === uniqueId ? { ...item, quantity } : item)
    );
  };

  const clearOrder = () => setCurrentOrder([]);

  // === TRANSAKSI ===
  const calculateItemTotal = (item: OrderItem) => {
    const spicyExtra = (item.options?.spicyLevel ?? 0) >= 4 ? 1000 : 0;
    const extrasTotal = item.options?.extras
      ? (item.options.extras.nasi * 4000) +
        (item.options.extras.telur * 3000) +
        (item.options.extras.tempe * 1000) +
        (item.options.extras.tahu * 1000)
      : 0;
    return (item.price + extrasTotal + spicyExtra) * item.quantity;
  };

  const completeTransaction = async (
    paymentMethod: 'tunai' | 'qris',
    cashReceived?: number
  ): Promise<boolean> => {
    try {
      const items = currentOrder.map(item => ({
        menu_item_id: item.id,
        quantity: item.quantity,
      }));

      const total = currentOrder.reduce((sum, item) => sum + calculateItemTotal(item), 0);

      const body: any = {
        payment_method: paymentMethod,
        items,
        notes: currentOrder
          .filter(i => i.options?.notes)
          .map(i => `${i.name}: ${i.options?.notes}`)
          .join(', ') || null,
      };

      if (paymentMethod === 'tunai') {
        body.cash_received = cashReceived;
      }

      const res = await fetch(`${API_URL}/transaksi`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.success) {
        // Simpan ke state lokal untuk ditampilkan di laporan sementara
        const transaction: Transaction = {
          id: data.data.transaction_code,
          transaction_code: data.data.transaction_code,
          date: new Date(),
          items: currentOrder.map(item => ({ ...item })),
          total,
          paymentMethod,
          cashReceived,
          change: data.data.change_amount,
        };
        setTransactions(prev => [...prev, transaction]);

        // Refresh menu supaya stok terupdate
        await refreshMenu();
        clearOrder();
        return true;
      }

      return false;
    } catch (err) {
      console.error('completeTransaction error:', err);
      return false;
    }
  };

  // === STOK ===
  const updateStock = async (itemId: string, jumlah: number, tipe: 'tambah' | 'kurangi') => {
    try {
      const res = await fetch(`${API_URL}/stok/${itemId}`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ jumlah, tipe }),
      });
      const data = await res.json();
      if (data.success) await refreshMenu();
    } catch (err) {
      console.error('updateStock error:', err);
    }
  };

  // === MENU CRUD ===
  const addMenuItem = async (newItem: Omit<MenuItem, 'id'>) => {
    try {
      const res = await fetch(`${API_URL}/menu`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          name: newItem.name,
          category: newItem.category,
          price: newItem.price,
          stock: newItem.stock,
          description: newItem.description || null,
        }),
      });
      const data = await res.json();
      if (data.success) await refreshMenu();
    } catch (err) {
      console.error('addMenuItem error:', err);
    }
  };

  const updateMenuItem = async (updatedItem: MenuItem) => {
    try {
      const res = await fetch(`${API_URL}/menu/${updatedItem.id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({
          name: updatedItem.name,
          category: updatedItem.category,
          price: updatedItem.price,
          stock: updatedItem.stock,
          description: updatedItem.description || null,
        }),
      });
      const data = await res.json();
      if (data.success) await refreshMenu();
    } catch (err) {
      console.error('updateMenuItem error:', err);
    }
  };

  const deleteMenuItem = async (itemId: string) => {
    try {
      const res = await fetch(`${API_URL}/menu/${itemId}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      const data = await res.json();
      if (data.success) await refreshMenu();
    } catch (err) {
      console.error('deleteMenuItem error:', err);
    }
  };

  return (
    <AppContext.Provider value={{
      menuItems,
      currentOrder,
      transactions,
      temporaryOrder,
      isLoadingMenu,
      setTemporaryOrder,
      addToOrder,
      removeFromOrder,
      updateOrderQuantity,
      clearOrder,
      completeTransaction,
      updateStock,
      updateMenuItem,
      addMenuItem,
      deleteMenuItem,
      refreshMenu,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}