import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Pembayaran from '../src/pages/Pembayaran';
import { AppProvider } from '../src/contexts/AppContext';

// Mock matchMedia for window
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

const renderPembayaran = () => {
    return render(
        <BrowserRouter>
            <AppProvider>
                <Pembayaran />
            </AppProvider>
        </BrowserRouter>
    );
};

describe('Pembayaran Page Suite', () => {
    it('renders the pembayaran page empty state by default', () => {
        renderPembayaran();
        expect(screen.getByText('Tidak ada pesanan untuk dibayar')).toBeInTheDocument();
        // Back button should be present
        expect(screen.getByRole('button', { name: /kembali ke pemesanan/i })).toBeInTheDocument();
    });
});
