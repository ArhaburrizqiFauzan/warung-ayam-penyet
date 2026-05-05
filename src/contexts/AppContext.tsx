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

export interface OrderSession {
  sessionId: string;
  label: string;
  items: OrderItem[];
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

export const calculateItemTotal = (item: OrderItem): number => {
  const spicyExtra = (item.options?.spicyLevel ?? 0) >= 4 ? 1000 : 0;
  const extrasTotal = item.options?.extras
    ? (item.options.extras.nasi * 4000) +
      (item.options.extras.telur * 3000) +
      (item.options.extras.tempe * 1000) +
      (item.options.extras.tahu * 1000)
    : 0;
  return (item.price + extrasTotal + spicyExtra) * item.quantity;
};


interface AppContextType {
  menuItems: MenuItem[];
  currentOrder: OrderItem[];
  transactions: Transaction[];
  temporaryOrder: TemporaryOrder | null;
  isLoadingMenu: boolean;
  orderSessions: OrderSession[];
  activeSessionId: string | null;
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
  addSession: (label: string) => void;
  removeSession: (sessionId: string) => void;
  setActiveSession: (sessionId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);
const API_URL = 'http://localhost:5000/api';

const mapKategori = (cat: string) => {
  const map: Record<string, string> = {
    'paket_ayam': 'Paket Ayam',
    'minuman': 'Minuman',
    'lainnya': 'Lainnya',
  };
  return map[cat] || cat;
};

const mapKategoriToDB = (cat: string) => {
  const map: Record<string, string> = {
    'Paket Ayam': 'paket_ayam',
    'Minuman': 'minuman',
    'Lainnya': 'lainnya',
  };
  return map[cat] || cat.toLowerCase().replace(' ', '_');
};

export function AppProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [temporaryOrder, setTemporaryOrder] = useState<TemporaryOrder | null>(null);
  const [isLoadingMenu, setIsLoadingMenu] = useState(false);
  const [orderSessions, setOrderSessions] = useState<OrderSession[]>(() => {
    try {
      const saved = localStorage.getItem('geprek_sessions');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [activeSessionId, setActiveSessionId] = useState<string | null>(() => {
    return localStorage.getItem('geprek_active_session');
  });
  const currentOrder = orderSessions.find(s => s.sessionId === activeSessionId)?.items || [];
  const authHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  });
  const isAyamMenu = (category: string) =>
    category.toLowerCase().includes('ayam') || category === 'paket_ayam';

  // === MENU ===
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
          category: mapKategori(item.category),
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

  useEffect(() => {
    localStorage.setItem('geprek_sessions', JSON.stringify(orderSessions));
  }, [orderSessions]);

  useEffect(() => {
    if (activeSessionId) {
      localStorage.setItem('geprek_active_session', activeSessionId);
    } else {
      localStorage.removeItem('geprek_active_session');
    }
  }, [activeSessionId]);

  useEffect(() => {
    if (token) refreshMenu();
    else setMenuItems([]);
  }, [token]);

  // === SESSION ===
  const addSession = (label: string) => {
    const sessionId = `session-${Date.now()}`;
    setOrderSessions(prev => [...prev, { sessionId, label, items: [] }]);
    setActiveSessionId(sessionId);
  };

  const removeSession = (sessionId: string) => {
    setOrderSessions(prev => {
      const remaining = prev.filter(s => s.sessionId !== sessionId);
      if (activeSessionId === sessionId) {
        setActiveSessionId(remaining.length > 0 ? remaining[0].sessionId : null);
      }
      return remaining;
    });
  };

  // === ORDER ===
  const generateUniqueId = (itemId: string, options?: AyamOptions): string => {
    if (!options) return itemId;
    return `${itemId}-${options.part}-${options.spicyLevel}-${options.isSeparated}`;
  };

  // Helper update items di session aktif
  const updateActiveSessionItems = (updater: (items: OrderItem[]) => OrderItem[]) => {
    setOrderSessions(prev =>
      prev.map(s =>
        s.sessionId === activeSessionId
          ? { ...s, items: updater(s.items) }
          : s
      )
    );
  };

  const addToOrder = (item: MenuItem, options?: AyamOptions) => {
    if (!activeSessionId) {
      // Auto-buat session pertama jika belum ada
      const sessionId = `session-${Date.now()}`;
      setOrderSessions([{ sessionId, label: 'Pembeli 1', items: [] }]);
      setActiveSessionId(sessionId);
    }

    if (item.isCustomizable && !options) return;
    if (!item.isCustomizable) options = undefined;

    const uniqueId = generateUniqueId(item.id, options);

    setOrderSessions(prev =>
      prev.map(s => {
        if (s.sessionId !== (activeSessionId || prev[0]?.sessionId)) return s;
        const existingIndex = s.items.findIndex(i => i.uniqueId === uniqueId);
        if (existingIndex !== -1) {
          const newItems = [...s.items];
          newItems[existingIndex] = {
            ...newItems[existingIndex],
            quantity: newItems[existingIndex].quantity + 1,
          };
          return { ...s, items: newItems };
        }
        return { ...s, items: [...s.items, { ...item, quantity: 1, options, uniqueId }] };
      })
    );
  };

  const removeFromOrder = (uniqueId: string) => {
    updateActiveSessionItems(items => items.filter(i => i.uniqueId !== uniqueId));
  };

  const updateOrderQuantity = (uniqueId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromOrder(uniqueId);
      return;
    }
    updateActiveSessionItems(items =>
      items.map(i => i.uniqueId === uniqueId ? { ...i, quantity } : i)
    );
  };

  const clearOrder = () => {
    if (!activeSessionId) return;
    removeSession(activeSessionId);
  };

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
      // Kirim detail lengkap per item ke BE
      const items = currentOrder.map(item => ({
        menu_item_id: item.id,
        quantity: item.quantity,
        // Kustomisasi ayam
        part: item.options?.part || null,
        spicy_level: item.options?.spicyLevel ?? null,
        is_separated: item.options?.isSeparated ?? null,
        extras: item.options?.extras || null,
        item_notes: item.options?.notes || null,
      }));
    
      const total = currentOrder.reduce((sum, item) => sum + calculateItemTotal(item), 0);
    
      const body: any = {
        payment_method: paymentMethod,
        items,
        notes: null,
      };
    
      if (paymentMethod === 'tunai') body.cash_received = cashReceived;
    
      const res = await fetch(`${API_URL}/transaksi`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(body),
      });
    
      const data = await res.json();
    
      if (data.success) {
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
          category: mapKategoriToDB(newItem.category),
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
          category: mapKategoriToDB(updatedItem.category),
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
      orderSessions,
      activeSessionId,
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
      addSession,
      removeSession,
      setActiveSession: setActiveSessionId,
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