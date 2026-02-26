import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

export default function Laporan() {
  const { transactions } = useApp();

  // Filter transaksi hari ini
  const today = new Date().toDateString();
  const todayTransactions = transactions.filter(
    t => t.date.toDateString() === today
  );

  const totalRevenue = todayTransactions.reduce((sum, t) => sum + t.total, 0);
  const cashRevenue = todayTransactions
    .filter(t => t.paymentMethod === 'cash')
    .reduce((sum, t) => sum + t.total, 0);
  const qrisRevenue = todayTransactions
    .filter(t => t.paymentMethod === 'qris')
    .reduce((sum, t) => sum + t.total, 0);

  const handleExport = () => {
    toast.success('Fitur ekspor akan segera tersedia');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Laporan Penjualan</h1>
          <p className="text-muted-foreground">Ringkasan transaksi hari ini</p>
        </div>
        <Button onClick={handleExport} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Ekspor
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Pendapatan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              Rp {totalRevenue.toLocaleString('id-ID')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {todayTransactions.length} transaksi
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
              Rp {cashRevenue.toLocaleString('id-ID')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {todayTransactions.filter(t => t.paymentMethod === 'cash').length} transaksi
            </p>
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
              Rp {qrisRevenue.toLocaleString('id-ID')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {todayTransactions.filter(t => t.paymentMethod === 'qris').length} transaksi
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Transaksi Hari Ini</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No. Transaksi</TableHead>
                <TableHead>Waktu</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Metode</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {todayTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Belum ada transaksi hari ini
                  </TableCell>
                </TableRow>
              ) : (
                todayTransactions.map(transaction => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">{transaction.id}</TableCell>
                    <TableCell>
                      {transaction.date.toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {transaction.items.map((item, idx) => (
                          <div key={idx} className="text-muted-foreground">
                            {item.name} x{item.quantity}
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        transaction.paymentMethod === 'cash'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-success/10 text-success'
                      }`}>
                        {transaction.paymentMethod === 'cash' ? 'Tunai' : 'QRIS'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      Rp {transaction.total.toLocaleString('id-ID')}
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
