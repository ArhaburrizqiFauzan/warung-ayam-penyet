import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wallet, QrCode, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function Pembayaran() {
  const { currentOrder, completeTransaction } = useApp();
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'qris' | null>(null);
  const [cashAmount, setCashAmount] = useState('');
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const navigate = useNavigate();

  const totalAmount = currentOrder.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cashReceived = parseFloat(cashAmount) || 0;
  const change = cashReceived - totalAmount;

  const handleCompleteTransaction = () => {
    if (!paymentMethod) {
      toast.error('Pilih metode pembayaran terlebih dahulu');
      return;
    }

    if (paymentMethod === 'cash') {
      if (cashReceived < totalAmount) {
        toast.error('Jumlah uang tidak cukup');
        return;
      }
      completeTransaction('cash', cashReceived);
    } else {
      completeTransaction('qris');
    }

    setShowSuccessDialog(true);
  };

  const handleNewOrder = () => {
    setShowSuccessDialog(false);
    setPaymentMethod(null);
    setCashAmount('');
    navigate('/pemesanan');
  };

  if (currentOrder.length === 0) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">Tidak ada pesanan untuk dibayar</p>
            <Button onClick={() => navigate('/pemesanan')}>
              Kembali ke Pemesanan
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Pembayaran</h1>
        <p className="text-muted-foreground">Pilih metode pembayaran dan selesaikan transaksi</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 max-w-5xl">
        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Ringkasan Pesanan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {currentOrder.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.name} x{item.quantity}</span>
                  <span className="font-medium">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</span>
                </div>
              ))}
            </div>
            <div className="pt-4 border-t border-border">
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold">Total Bayar</span>
                <span className="text-3xl font-bold text-primary">
                  Rp {totalAmount.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card>
          <CardHeader>
            <CardTitle>Metode Pembayaran</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <Button
                variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                className="h-16 text-lg justify-start"
                onClick={() => setPaymentMethod('cash')}
              >
                <Wallet className="h-6 w-6 mr-3" />
                Tunai
              </Button>
              <Button
                variant={paymentMethod === 'qris' ? 'default' : 'outline'}
                className="h-16 text-lg justify-start"
                onClick={() => setPaymentMethod('qris')}
              >
                <QrCode className="h-6 w-6 mr-3" />
                QRIS
              </Button>
            </div>

            {paymentMethod === 'cash' && (
              <div className="space-y-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label htmlFor="cash-amount">Jumlah Uang Diterima</Label>
                  <Input
                    id="cash-amount"
                    type="number"
                    placeholder="0"
                    value={cashAmount}
                    onChange={(e) => setCashAmount(e.target.value)}
                    className="h-12 text-lg"
                  />
                </div>
                {cashReceived > 0 && (
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Kembalian</span>
                      <span className={`text-xl font-bold ${
                        change >= 0 ? 'text-success' : 'text-destructive'
                      }`}>
                        Rp {change >= 0 ? change.toLocaleString('id-ID') : '0'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {paymentMethod === 'qris' && (
              <div className="pt-4 border-t text-center space-y-4">
                <div className="w-48 h-48 mx-auto bg-muted rounded-lg flex items-center justify-center">
                  <QrCode className="h-32 w-32 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Simulasi QRIS - Klik tombol selesaikan untuk melanjutkan
                </p>
              </div>
            )}

            <Button
              onClick={handleCompleteTransaction}
              disabled={!paymentMethod}
              className="w-full h-12 text-lg font-medium"
            >
              Selesaikan Transaksi
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <div className="mx-auto w-16 h-16 rounded-full bg-success flex items-center justify-center mb-4">
              <CheckCircle className="h-10 w-10 text-success-foreground" />
            </div>
            <DialogTitle className="text-center text-2xl">Transaksi Berhasil!</DialogTitle>
            <DialogDescription className="text-center">
              Pembayaran telah diterima dan stok telah diperbarui
            </DialogDescription>
          </DialogHeader>
          <div className="text-center space-y-4 py-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Pembayaran</p>
              <p className="text-3xl font-bold text-primary">
                Rp {totalAmount.toLocaleString('id-ID')}
              </p>
            </div>
            {paymentMethod === 'cash' && change > 0 && (
              <div>
                <p className="text-sm text-muted-foreground">Kembalian</p>
                <p className="text-2xl font-bold text-success">
                  Rp {change.toLocaleString('id-ID')}
                </p>
              </div>
            )}
          </div>
          <Button onClick={handleNewOrder} className="w-full h-12">
            Pesanan Baru
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
