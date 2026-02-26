import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, ShoppingBag, Package, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const { transactions, menuItems } = useApp();

  // Filter transaksi hari ini
  const today = new Date().toDateString();
  const todayTransactions = transactions.filter(
    t => t.date.toDateString() === today
  );

  const totalRevenue = todayTransactions.reduce((sum, t) => sum + t.total, 0);
  const totalOrders = todayTransactions.length;
  const lowStockItems = menuItems.filter(item => item.stock < 10);

  const cashTransactions = todayTransactions.filter(t => t.paymentMethod === 'cash').length;
  const qrisTransactions = todayTransactions.filter(t => t.paymentMethod === 'qris').length;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Ringkasan hari ini</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Pendapatan
            </CardTitle>
            <DollarSign className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              Rp {totalRevenue.toLocaleString('id-ID')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Hari ini
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-accent">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Pesanan
            </CardTitle>
            <ShoppingBag className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Transaksi hari ini
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-warning">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Stok Hampir Habis
            </CardTitle>
            <Package className="h-5 w-5 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{lowStockItems.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Item perlu restok
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-success">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Rata-rata Transaksi
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              Rp {totalOrders > 0 ? Math.round(totalRevenue / totalOrders).toLocaleString('id-ID') : 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Per pesanan
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Metode Pembayaran</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Tunai</span>
              <span className="text-2xl font-bold text-primary">{cashTransactions}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">QRIS</span>
              <span className="text-2xl font-bold text-accent">{qrisTransactions}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stok Perlu Perhatian</CardTitle>
          </CardHeader>
          <CardContent>
            {lowStockItems.length === 0 ? (
              <p className="text-sm text-muted-foreground">Semua stok dalam kondisi baik</p>
            ) : (
              <div className="space-y-2">
                {lowStockItems.slice(0, 5).map(item => (
                  <div key={item.id} className="flex items-center justify-between">
                    <span className="text-sm">{item.name}</span>
                    <span className={`text-sm font-medium ${
                      item.stock === 0 ? 'text-destructive' : 'text-warning'
                    }`}>
                      {item.stock} tersisa
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaksi Terakhir</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {todayTransactions.slice(-5).reverse().map(transaction => (
              <div key={transaction.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                <div>
                  <p className="font-medium">{transaction.id}</p>
                  <p className="text-sm text-muted-foreground">
                    {transaction.date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">Rp {transaction.total.toLocaleString('id-ID')}</p>
                  <p className="text-sm text-muted-foreground capitalize">{transaction.paymentMethod}</p>
                </div>
              </div>
            ))}
            {todayTransactions.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">Belum ada transaksi hari ini</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
