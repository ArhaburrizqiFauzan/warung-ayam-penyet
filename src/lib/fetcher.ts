export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export const apiFetch = async (url: string, options?: RequestInit) => {
  try {
    const res = await fetch(url, options);
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new ApiError(res.status, data.message || 'Terjadi kesalahan pada server');
    }
    return data;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    // Network error / BE down
    throw new ApiError(0, 'Tidak dapat terhubung ke server. Pastikan backend berjalan.');
  }
};