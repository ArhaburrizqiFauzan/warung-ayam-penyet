import { createContext, useContext, useState, ReactNode } from 'react';

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  isCustomizable?: boolean; // true untuk menu ayam, false untuk minuman
}

// Interface untuk Opsi Kustomisasi Ayam
export interface AyamOptions {
  part: 'Dada' | 'Paha Atas' | 'Sayap' | 'Paha Bawah'; // pilihan bagian ayam
  spicyLevel: number; // 1-10
  isSeparated: boolean; // true = dipisah, false = dicampur
  notes?: string; // catatan tambahan
  variant?: 'original' | 'sambal-ijo' | 'sambal-matah';
  extras?: {  
    nasi: number;
    telur: number;
    tempe: number;
    tahu: number;
  };
}

// Interface untuk OrderItem
export interface OrderItem extends MenuItem {
  quantity: number;
  options?: AyamOptions; // opsional, hanya untuk menu ayam
  uniqueId?: string; 
}

export interface Transaction {
  id: string;
  date: Date;
  items: OrderItem[];
  total: number;
  paymentMethod: 'cash' | 'qris';
  cashReceived?: number;
  change?: number;
}

// Interface untuk Temporary Order 
export interface TemporaryOrder {
  menuItem: MenuItem;
  options?: AyamOptions;
}

interface AppContextType {
  // State
  menuItems: MenuItem[];
  currentOrder: OrderItem[];
  transactions: Transaction[];
  temporaryOrder: TemporaryOrder | null;
  
  // Fungsi-fungsi
  setTemporaryOrder: (order: TemporaryOrder | null) => void;
  addToOrder: (item: MenuItem, options?: AyamOptions) => void;
  removeFromOrder: (uniqueId: string) => void; 
  updateOrderQuantity: (uniqueId: string, quantity: number) => void;
  clearOrder: () => void;
  completeTransaction: (paymentMethod: 'cash' | 'qris', cashReceived?: number) => void;
  
  // Manajemen menu 
  updateStock: (itemId: string, newStock: number) => void;
  updateMenuItem: (item: MenuItem) => void;
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  deleteMenuItem: (itemId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

//  DUMMY DATA 
const INITIAL_MENU: MenuItem[] = [
  // Menu Ayam (isCustomizable: true)
  { id: '1', name: 'Ayam Penyet Original', price: 18000, category: 'Paket Ayam', stock: 50, isCustomizable: true },
  { id: '2', name: 'Ayam Penyet Jumbo', price: 25000, category: 'Paket Ayam', stock: 30, isCustomizable: true },
  { id: '3', name: 'Ayam Penyet Sambal Ijo', price: 20000, category: 'Paket Ayam', stock: 25, isCustomizable: true },
  { id: '4', name: 'Ayam Penyet Sambal Matah', price: 22000, category: 'Paket Ayam', stock: 20, isCustomizable: true },
  
  // Menu Minuman (isCustomizable: false)
  { id: '5', name: 'Es Teh Manis', price: 5000, category: 'Minuman', stock: 100, isCustomizable: false },
  { id: '6', name: 'Es Jeruk', price: 7000, category: 'Minuman', stock: 80, isCustomizable: false },
  { id: '7', name: 'Es Teh Tawar', price: 3000, category: 'Minuman', stock: 100, isCustomizable: false },
  { id: '8', name: 'Air Mineral', price: 3000, category: 'Minuman', stock: 150, isCustomizable: false },
];

const INITIAL_TRANSACTIONS: Transaction[] = [];

export function AppProvider({ children }: { children: ReactNode }) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(INITIAL_MENU);
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  
  // State untuk menyimpan pesanan sementara 
  const [temporaryOrder, setTemporaryOrder] = useState<TemporaryOrder | null>(null);

  const generateUniqueId = (itemId: string, options?: AyamOptions): string => {
    if (!options) return itemId;
    
    return `${itemId}-${options.part}-${options.spicyLevel}-${options.isSeparated}`;
  };

  // Fungsi untuk mengecek apakah dua opsi sama
  const isSameOptions = (opts1?: AyamOptions, opts2?: AyamOptions): boolean => {
    if (!opts1 && !opts2) return true;
    if (!opts1 || !opts2) return false;
    
    return (
      opts1.part === opts2.part &&
      opts1.spicyLevel === opts2.spicyLevel &&
      opts1.isSeparated === opts2.isSeparated &&
      opts1.notes === opts2.notes
    );
  };

  const addToOrder = (item: MenuItem, options?: AyamOptions) => {
    // Validasi: menu ayam harus punya options
    if (item.isCustomizable && !options) {
      console.error('Menu ayam harus memiliki opsi kustomisasi!');
      return;
    }

    // Validasi: menu minuman tidak boleh punya options
    if (!item.isCustomizable && options) {
      console.warn('Menu minuman tidak perlu opsi kustomisasi, mengabaikan options...');
      options = undefined;
    }

    // Generate uniqueId untuk item ini
    const uniqueId = generateUniqueId(item.id, options);

    setCurrentOrder(prev => {
      // Cari apakah item dengan uniqueId yang sama sudah ada
      const existingIndex = prev.findIndex(i => i.uniqueId === uniqueId);

      if (existingIndex !== -1) {
        // Jika sudah ada, tambah quantity
        const newOrder = [...prev];
        newOrder[existingIndex] = { 
          ...newOrder[existingIndex], 
          quantity: newOrder[existingIndex].quantity + 1 
        };
        return newOrder;
      }

      // Jika belum ada, tambah item baru dengan uniqueId
      return [...prev, { 
        ...item, 
        quantity: 1, 
        options,
        uniqueId // Simpan uniqueId 
      }];
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
      prev.map(item => 
        item.uniqueId === uniqueId 
          ? { ...item, quantity } 
          : item
      )
    );
  };

  const clearOrder = () => {
    setCurrentOrder([]);
  };

  const completeTransaction = (paymentMethod: 'cash' | 'qris', cashReceived?: number) => {
    const total = currentOrder.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const change = paymentMethod === 'cash' && cashReceived ? cashReceived - total : undefined;

    const transaction: Transaction = {
      id: `TRX${String(transactions.length + 1).padStart(3, '0')}`,
      date: new Date(),
      items: currentOrder.map(item => ({ ...item })), // Copy items
      total,
      paymentMethod,
      cashReceived,
      change,
    };

    setTransactions(prev => [...prev, transaction]);

    // Update stok
    currentOrder.forEach(orderItem => {
      setMenuItems(prev => 
        prev.map(menuItem => 
          menuItem.id === orderItem.id 
            ? { ...menuItem, stock: menuItem.stock - orderItem.quantity }
            : menuItem
        )
      );
    });

    clearOrder();
  };

  const updateStock = (itemId: string, newStock: number) => {
    setMenuItems(prev => 
      prev.map(item => item.id === itemId ? { ...item, stock: newStock } : item)
    );
  };

  const updateMenuItem = (updatedItem: MenuItem) => {
    setMenuItems(prev => 
      prev.map(item => item.id === updatedItem.id ? updatedItem : item)
    );
  };

  const addMenuItem = (newItem: Omit<MenuItem, 'id'>) => {
    const id = String(menuItems.length + 1);
    setMenuItems(prev => [...prev, { ...newItem, id }]);
  };

  const deleteMenuItem = (itemId: string) => {
    setMenuItems(prev => prev.filter(item => item.id !== itemId));
  };

  return (
    <AppContext.Provider value={{
      // State
      menuItems,
      currentOrder,
      transactions,
      temporaryOrder,
      setTemporaryOrder,
      
      // Fungsi
      addToOrder,
      removeFromOrder,
      updateOrderQuantity,
      clearOrder,
      completeTransaction,
      updateStock,
      updateMenuItem,
      addMenuItem,
      deleteMenuItem,
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


