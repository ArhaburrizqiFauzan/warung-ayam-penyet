import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { EXTRAS_PRICE, EXTRAS_LABEL, ExtrasKey } from '@/components/Extras';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface RingkasanHarian {
  tanggal: string;
  jumlah_transaksi: number;
  pendapatan_tunai: number;
  pendapatan_qris: number;
  total_pendapatan: number;
}

interface DetailTransaksi {
  transaction_code: string;
  transaction_date: string;
  kasir_nama: string;
  nama_menu: string;
  kategori: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  payment_method: string;
  total_amount: number;
  status: string;
  notes?: string;
}

const API_URL = 'http://localhost:5000/api';

export default function Laporan() {
  const { token } = useAuth();
  const [ringkasan, setRingkasan] = useState<RingkasanHarian | null>(null);
  const [transaksi, setTransaksi] = useState<DetailTransaksi[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterTanggal, setFilterTanggal] = useState('');

  const today = new Date().toISOString().slice(0, 10);

  const fetchLaporan = async (tanggal?: string) => {
    if (!token) return;
    setIsLoading(true);
    try {
      const url = tanggal
        ? `${API_URL}/laporan/filter?tanggal=${tanggal}`
        : `${API_URL}/laporan/harian`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.success) {
        setRingkasan(data.data.ringkasan);
        setTransaksi(data.data.transaksi);
      }
    } catch (err) {
      toast.error('Gagal memuat laporan');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLaporan();
  }, [token]);

  const handleFilter = () => {
    if (!filterTanggal) {
      fetchLaporan();
    } else {
      fetchLaporan(filterTanggal);
    }
  };

  const handleExport = () => {
    if (groupedList.length === 0) {
      toast.error('Tidak ada data untuk diekspor');
      return;
    }

    const doc = new jsPDF();
    const tanggalLabel = filterTanggal || today;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Laporan Penjualan', 14, 15);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Warung Ayam Penyet`, 14, 22);
    doc.text(`Tanggal: ${tanggalLabel}`, 14, 28);
    doc.text(`Dicetak: ${new Date().toLocaleString('id-ID')}`, 14, 34);
    
    // Ringkasan
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Ringkasan', 14, 44);
    
    autoTable(doc, {
      startY: 48,
      head: [['Keterangan', 'Nilai']],
      body: [
        ['Total Transaksi', `${ringkasan?.jumlah_transaksi || 0} transaksi`],
        ['Pendapatan Tunai', `Rp ${Number(ringkasan?.pendapatan_tunai || 0).toLocaleString('id-ID')}`],
        ['Pendapatan QRIS', `Rp ${Number(ringkasan?.pendapatan_qris || 0).toLocaleString('id-ID')}`],
        ['Total Pendapatan', `Rp ${Number(ringkasan?.total_pendapatan || 0).toLocaleString('id-ID')}`],
      ],
      theme: 'grid',
      headStyles: { fillColor: [249, 115, 22] }, // orange
      columnStyles: { 1: { halign: 'right' } },
      margin: { left: 14, right: 14 },
    });
  
    // Detail transaksi
    const finalY = (doc as any).lastAutoTable.finalY + 10;
  
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Detail Transaksi', 14, finalY);
  
    const tableRows = groupedList.flatMap(trx =>
      trx.items.map((item: any, idx: number) => [
        idx === 0 ? trx.transaction_code : '',
        idx === 0
          ? new Date(trx.transaction_date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
          : '',
        item.nama_menu,
        item.quantity,
        `Rp ${Number(item.unit_price).toLocaleString('id-ID')}`,
        `Rp ${Number(item.subtotal).toLocaleString('id-ID')}`,
        idx === 0 ? (trx.payment_method === 'tunai' ? 'Tunai' : 'QRIS') : '',
        idx === 0 ? `Rp ${Number(trx.total_amount).toLocaleString('id-ID')}` : '',
      ])
    );
  
    autoTable(doc, {
      startY: finalY + 4,
      head: [['No. Transaksi', 'Waktu', 'Menu', 'Qty', 'Harga Satuan', 'Subtotal', 'Metode', 'Total']],
      body: tableRows,
      theme: 'striped',
      headStyles: { fillColor: [249, 115, 22] },
      columnStyles: {
        0: { cellWidth: 30 },
        3: { halign: 'center' },
        4: { halign: 'right' },
        5: { halign: 'right' },
        7: { halign: 'right' },
      },
      margin: { left: 14, right: 14 },
      styles: { fontSize: 8 },
    });
  
    doc.save(`laporan-${tanggalLabel}.pdf`);
    toast.success('Laporan berhasil diekspor!');
  };
  
  

  // Kelompokkan transaksi berdasarkan transaction_code
  const grouped = transaksi.reduce((acc, t) => {
    if (!acc[t.transaction_code]) {
      acc[t.transaction_code] = {
        transaction_code: t.transaction_code,
        transaction_date: t.transaction_date,
        kasir_nama: t.kasir_nama,
        payment_method: t.payment_method,
        total_amount: t.total_amount,
        notes: (t as any).notes || null,
        items: [],
      };
    }
    acc[t.transaction_code].items.push({
      nama_menu: t.nama_menu,
      quantity: t.quantity,
      unit_price: t.unit_price,
      subtotal: t.subtotal,
    });
    return acc;
  }, {} as Record<string, any>);

  const groupedList = Object.values(grouped);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Laporan Penjualan</h1>
          <p className="text-muted-foreground">
            {filterTanggal ? `Tanggal: ${filterTanggal}` : 'Ringkasan hari ini'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Ekspor
          </Button>
        </div>
      </div>

      {/* Filter Tanggal */}
      <div className="flex gap-2 items-center">
        <Input
          type="date"
          value={filterTanggal}
          onChange={(e) => setFilterTanggal(e.target.value)}
          className="w-48"
          max={today}
        />
        <Button onClick={handleFilter} disabled={isLoading}>
          Tampilkan
        </Button>
        {filterTanggal && (
          <Button
            variant="outline"
            onClick={() => {
              setFilterTanggal('');
              fetchLaporan();
            }}
          >
            Reset
          </Button>
        )}
      </div>

      {/* Ringkasan */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Pendapatan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              Rp {Number(ringkasan?.total_pendapatan || 0).toLocaleString('id-ID')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {ringkasan?.jumlah_transaksi || 0} transaksi
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-accent">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pembayaran Tunai
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              Rp {Number(ringkasan?.pendapatan_tunai || 0).toLocaleString('id-ID')}
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-success">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pembayaran QRIS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              Rp {Number(ringkasan?.pendapatan_qris || 0).toLocaleString('id-ID')}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabel Transaksi */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Transaksi</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No. Transaksi</TableHead>
                <TableHead>Waktu</TableHead>
                <TableHead>Kasir</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Metode</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groupedList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    {isLoading ? 'Memuat data...' : 'Belum ada transaksi'}
                  </TableCell>
                </TableRow>
              ) : (
                groupedList.map(trx => (
                  <TableRow key={trx.transaction_code}>
                    <TableCell className="font-medium">{trx.transaction_code}</TableCell>
                    <TableCell>
                      {new Date(trx.transaction_date).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </TableCell>
                    <TableCell>{trx.kasir_nama}</TableCell>
                      <TableCell>
                        <div className="text-sm space-y-2">
                          {trx.items.map((item: any, idx: number) => (
                            <div key={idx}>
                              <p className="font-medium text-foreground">
                                {item.nama_menu} x{item.quantity}
                                <span className="ml-1 text-xs text-muted-foreground">
                                  (Rp {Number(item.subtotal).toLocaleString('id-ID')})
                                </span>
                              </p>
                            </div>
                          ))}
                          {trx.notes && (() => {
                            try {
                              const parsed = JSON.parse(trx.notes);
                              return parsed.item_details?.map((detail: any, idx: number) => (
                                <div key={idx} className="text-xs text-muted-foreground pl-2 space-y-0.5 border-l-2 border-muted ml-1">
                                  {detail.part && <p>• {detail.part}</p>}
                                  {detail.spicy_level > 0 && (
                                    <p>• Level {detail.spicy_level} · {detail.is_separated ? 'Sambal Pisah' : 'Sambal Disatukan'}</p>
                                  )}
                                  {detail.extras && Object.entries(detail.extras)
                                    .filter(([, qty]) => (qty as number) > 0)
                                    .map(([key, qty]) => (
                                      <p key={key}>• {EXTRAS_LABEL[key as ExtrasKey]} x{qty as number}</p>
                                    ))
                                  }
                                  {detail.notes && <p>• Catatan: <span className="italic">{detail.notes}</span></p>}
                                </div>
                              ));
                            } catch { return null; }
                          })()}
                        </div>
                      </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        trx.payment_method === 'tunai'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-success/10 text-success'
                      }`}>
                        {trx.payment_method === 'tunai' ? 'Tunai' : 'QRIS'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      Rp {Number(trx.total_amount).toLocaleString('id-ID')}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}