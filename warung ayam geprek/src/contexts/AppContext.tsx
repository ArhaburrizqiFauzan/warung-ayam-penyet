import { createContext, useContext, useState, ReactNode } from 'react';

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
}

export interface OrderItem extends MenuItem {
  quantity: number;
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

interface AppContextType {
  menuItems: MenuItem[];
  currentOrder: OrderItem[];
  transactions: Transaction[];
  addToOrder: (item: MenuItem) => void;
  removeFromOrder: (itemId: string) => void;
  updateOrderQuantity: (itemId: string, quantity: number) => void;
  clearOrder: () => void;
  completeTransaction: (paymentMethod: 'cash' | 'qris', cashReceived?: number) => void;
  updateStock: (itemId: string, newStock: number) => void;
  updateMenuItem: (item: MenuItem) => void;
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  deleteMenuItem: (itemId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Dummy data menu
const INITIAL_MENU: MenuItem[] = [
  { id: '1', name: 'Ayam Penyet Original', price: 18000, category: 'Paket Ayam', stock: 50 },
  { id: '2', name: 'Ayam Penyet Jumbo', price: 25000, category: 'Paket Ayam', stock: 30 },
  { id: '3', name: 'Ayam Penyet Sambal Ijo', price: 20000, category: 'Paket Ayam', stock: 25 },
  { id: '4', name: 'Ayam Penyet Sambal Matah', price: 22000, category: 'Paket Ayam', stock: 20 },
  { id: '5', name: 'Es Teh Manis', price: 5000, category: 'Minuman', stock: 100 },
  { id: '6', name: 'Es Jeruk', price: 7000, category: 'Minuman', stock: 80 },
  { id: '7', name: 'Es Teh Tawar', price: 3000, category: 'Minuman', stock: 100 },
  { id: '8', name: 'Air Mineral', price: 3000, category: 'Minuman', stock: 150 },
];

// Dummy transactions hari ini
const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'TRX001',
    date: new Date(),
    items: [
      { ...INITIAL_MENU[0], quantity: 2 },
      { ...INITIAL_MENU[4], quantity: 2 },
    ],
    total: 46000,
    paymentMethod: 'cash',
    cashReceived: 50000,
    change: 4000,
  },
  {
    id: 'TRX002',
    date: new Date(),
    items: [
      { ...INITIAL_MENU[1], quantity: 1 },
      { ...INITIAL_MENU[5], quantity: 1 },
    ],
    total: 32000,
    paymentMethod: 'qris',
  },
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(INITIAL_MENU);
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);

  const addToOrder = (item: MenuItem) => {
    setCurrentOrder(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => 
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromOrder = (itemId: string) => {
    setCurrentOrder(prev => prev.filter(i => i.id !== itemId));
  };

  const updateOrderQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromOrder(itemId);
      return;
    }
    setCurrentOrder(prev => 
      prev.map(i => i.id === itemId ? { ...i, quantity } : i)
    );
  };

  const clearOrder = () => {
    setCurrentOrder([]);
  };

  const completeTransaction = (paymentMethod: 'cash' | 'qris', cashReceived?: number) => {
    const total = currentOrder.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const change = paymentMethod === 'cash' && cashReceived ? cashReceived - total : undefined;

    const transaction: Transaction = {
      id: `TRX${String(transactions.length + 3).padStart(3, '0')}`,
      date: new Date(),
      items: currentOrder,
      total,
      paymentMethod,
      cashReceived,
      change,
    };

    setTransactions(prev => [...prev, transaction]);

    // Update stock
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
      menuItems,
      currentOrder,
      transactions,
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
