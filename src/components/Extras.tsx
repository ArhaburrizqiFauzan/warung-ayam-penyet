export const EXTRAS_PRICE = {
  nasi: 4000,
  telur: 3000,
  tempe: 1000,
  tahu: 1000,
} as const;

export type ExtrasKey = keyof typeof EXTRAS_PRICE;

// Helper format label extras untuk ditampilkan di UI
export const EXTRAS_LABEL: Record<ExtrasKey, string> = {
  nasi: 'Nasi Putih',
  telur: 'Telur Dadar',
  tempe: 'Tempe Goreng',
  tahu: 'Tahu Goreng',
};