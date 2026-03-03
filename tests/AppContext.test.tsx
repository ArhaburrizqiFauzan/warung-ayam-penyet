import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AppProvider, useApp, MenuItem } from '../src/contexts/AppContext';

// Wrapper for the hook
const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AppProvider>{children}</AppProvider>
);

describe('AppContext Business Logic', () => {
    it('should initialize with default menu items', () => {
        const { result } = renderHook(() => useApp(), { wrapper });

        expect(result.current.menuItems.length).toBeGreaterThan(0);
        expect(result.current.currentOrder).toEqual([]);
        expect(result.current.transactions.length).toBe(0);
    });

    it('should add an item to the order', () => {
        const { result } = renderHook(() => useApp(), { wrapper });

        const itemToAdd = result.current.menuItems.find(item => !item.isCustomizable) || result.current.menuItems[0];

        act(() => {
            result.current.addToOrder(itemToAdd);
        });

        expect(result.current.currentOrder.length).toBe(1);
        expect(result.current.currentOrder[0].id).toBe(itemToAdd.id);
        expect(result.current.currentOrder[0].quantity).toBe(1);
    });

    it('should increment quantity when adding the same item to the order', async () => {
        const { result } = renderHook(() => useApp(), { wrapper });

        const itemToAdd = result.current.menuItems.find(item => !item.isCustomizable) || result.current.menuItems[0];

        act(() => {
            result.current.addToOrder(itemToAdd);
        });

        act(() => {
            result.current.addToOrder(itemToAdd);
        });

        expect(result.current.currentOrder.length).toBe(1);
        expect(result.current.currentOrder[0].quantity).toBe(2);
    });

    it('should remove an item from the order', () => {
        const { result } = renderHook(() => useApp(), { wrapper });

        const itemToAdd = result.current.menuItems.find(item => !item.isCustomizable) || result.current.menuItems[0];

        act(() => {
            result.current.addToOrder(itemToAdd);
        });

        expect(result.current.currentOrder.length).toBe(1);

        act(() => {
            result.current.removeFromOrder(result.current.currentOrder[0].uniqueId!);
        });

        expect(result.current.currentOrder.length).toBe(0);
    });

    it('should update item quantity in the order', () => {
        const { result } = renderHook(() => useApp(), { wrapper });

        const itemToAdd = result.current.menuItems.find(item => !item.isCustomizable) || result.current.menuItems[0];

        act(() => {
            result.current.addToOrder(itemToAdd);
        });

        act(() => {
            result.current.updateOrderQuantity(result.current.currentOrder[0].uniqueId!, 5);
        });

        expect(result.current.currentOrder[0].quantity).toBe(5);
    });

    it('should remove item when quantity is updated to 0', () => {
        const { result } = renderHook(() => useApp(), { wrapper });

        const itemToAdd = result.current.menuItems.find(item => !item.isCustomizable) || result.current.menuItems[0];

        act(() => {
            result.current.addToOrder(itemToAdd);
        });

        act(() => {
            result.current.updateOrderQuantity(result.current.currentOrder[0].uniqueId!, 0);
        });

        expect(result.current.currentOrder.length).toBe(0);
    });

    it('should complete transaction and reduce stock', async () => {
        const { result } = renderHook(() => useApp(), { wrapper });

        // Use a non-customizable item for easier testing
        const itemToAdd = result.current.menuItems.find(item => !item.isCustomizable) || result.current.menuItems[0];
        const initialStock = itemToAdd.stock;
        const initialTransactionsCount = result.current.transactions.length;

        act(() => {
            result.current.addToOrder(itemToAdd);
        });

        act(() => {
            result.current.completeTransaction('cash', 50000);
        });

        // Order should be cleared
        expect(result.current.currentOrder.length).toBe(0);

        // Transaction should be added
        expect(result.current.transactions.length).toBe(initialTransactionsCount + 1);

        // Stock should be reduced by 1
        const updatedItem = result.current.menuItems.find(i => i.id === itemToAdd.id);
        expect(updatedItem?.stock).toBe(initialStock - 1);
    });
});
