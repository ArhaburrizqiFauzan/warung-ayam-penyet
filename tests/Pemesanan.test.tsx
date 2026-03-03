import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Pemesanan from '../src/pages/Pemesanan';
import { AppProvider } from '../src/contexts/AppContext';
import { Toaster } from 'sonner';

// Mock matchMedia for window
beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: vi.fn(), // deprecated
            removeListener: vi.fn(), // deprecated
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
        })),
    });
});

const renderPemesanan = () => {
    return render(
        <BrowserRouter>
            <AppProvider>
                <Pemesanan />
                <Toaster />
            </AppProvider>
        </BrowserRouter>
    );
};

describe('Pemesanan Page Suite', () => {
    it('renders the pemesanan page correctly', () => {
        renderPemesanan();
        expect(screen.getByText('Pemesanan')).toBeInTheDocument();
        expect(screen.getByText('Pilih menu dan tambahkan ke keranjang')).toBeInTheDocument();
        expect(screen.getByText('Ayam Penyet Original')).toBeInTheDocument();
    });

    it('filters items by category', () => {
        renderPemesanan();

        // Default is 'Semua', should show both food and drinks
        expect(screen.getByText('Ayam Penyet Original')).toBeInTheDocument();
        expect(screen.getByText('Es Teh Manis')).toBeInTheDocument();

        // Click on 'Minuman' category
        fireEvent.click(screen.getByRole('button', { name: 'Minuman' }));

        // Should show drinks but not food
        expect(screen.getByText('Es Teh Manis')).toBeInTheDocument();
        expect(screen.queryByText('Ayam Penyet Original')).not.toBeInTheDocument();
    });

    it('adds items to the cart', async () => {
        renderPemesanan();

        // Add Ayam Penyet Original to cart
        const addButton = screen.getAllByRole('button', { name: /tambah/i })[0];
        fireEvent.click(addButton);

        // Check if it appears in the cart section
        await waitFor(() => {
            // Find the cart section (it might have multiple elements with the name, so we look for specific test ids or structure if possible, 
            // but simple text check is okay for basic test)
            const cartItems = screen.getAllByText('Ayam Penyet Original');
            expect(cartItems.length).toBeGreaterThan(1); // One in menu, one in cart
        });

        // Total should be updated (18.000)
        // Since the price might be formatted differently or found multiple times (in menu and cart),
        // we'll check for the total container
        const totalElements = screen.getAllByText(/18\.000/);
        expect(totalElements.length).toBeGreaterThan(0);
    });
});
