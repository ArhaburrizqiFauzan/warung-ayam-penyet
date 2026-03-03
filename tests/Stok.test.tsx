import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Stok from '../src/pages/Stok';
import { AppProvider } from '../src/contexts/AppContext';

// Mock matchMedia for window (required by some Shadcn UI components)
beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
        })),
    });
});

const renderStok = () => {
    return render(
        <BrowserRouter>
            <AppProvider>
                <Stok />
            </AppProvider>
        </BrowserRouter>
    );
};

describe('Stok Page Suite', () => {
    it('renders the stok page correctly', () => {
        renderStok();
        expect(screen.getByText('Manajemen Stok')).toBeInTheDocument();
        expect(screen.getByText('Kelola stok bahan dan menu')).toBeInTheDocument();
        // Check if the table headers are present
        expect(screen.getByText('Nama Item')).toBeInTheDocument();
        expect(screen.getByText('Kategori')).toBeInTheDocument();
        expect(screen.getByText('Stok Saat Ini')).toBeInTheDocument();
        expect(screen.getByText('Status')).toBeInTheDocument();
        expect(screen.getByText('Aksi')).toBeInTheDocument();
    });

    it('displays the menu items in the table', () => {
        renderStok();
        // Default items from AppContext
        expect(screen.getByText('Ayam Penyet Original')).toBeInTheDocument();
        expect(screen.getByText('Es Teh Manis')).toBeInTheDocument();
    });
    it('displays action buttons for each item', () => {
        renderStok();
        // It should have 'Tambah' and 'Kurangi' buttons for the items
        const addButtons = screen.getAllByRole('button', { name: /tambah/i });
        const reduceButtons = screen.getAllByRole('button', { name: /kurangi/i });

        expect(addButtons.length).toBeGreaterThan(0);
        expect(reduceButtons.length).toBeGreaterThan(0);
    });

});
