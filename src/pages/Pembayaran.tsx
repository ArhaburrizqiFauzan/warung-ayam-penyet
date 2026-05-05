import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp, calculateItemTotal } from '@/contexts/AppContext';
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
  const {
    currentOrder,
    completeTransaction,
    orderSessions,
    activeSessionId,
    setActiveSession,
  } = useApp();

  const [paymentMethod, setPaymentMethod] = useState<'tunai' | 'qris' | null>(null);
  const [cashAmount, setCashAmount] = useState('');
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const navigate = useNavigate();

  const totalAmount = currentOrder.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  const cashReceived = parseFloat(cashAmount) || 0;
  const change = cashReceived - totalAmount;

  const handleCompleteTransaction = async () => {
    if (!paymentMethod) {
      toast.error('Pilih metode pembayaran terlebih dahulu');
      return;
    }

    if (paymentMethod === 'tunai' && cashReceived < totalAmount) {
      toast.error('Jumlah uang tidak cukup');
      return;
    }

    const success = await completeTransaction(
      paymentMethod,
      paymentMethod === 'tunai' ? cashReceived : undefined
    );

    if (success) {
      setPaymentMethod(null);
      setCashAmount('');
      setShowSuccessDialog(true);
    } else {
      toast.error('Gagal memproses transaksi, coba lagi');
    }
  };

  const handleNewOrder = () => {
    setShowSuccessDialog(false);
    navigate('/pemesanan');
  };

  // Empty state
  if (currentOrder.length === 0) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-12 text-center space-y-4">
            <p className="text-muted-foreground">
              {orderSessions.length === 0
                ? 'Tidak ada pesanan untuk dibayar'
                : 'Pilih pembeli di bawah untuk memproses pembayaran'}
            </p>
            {orderSessions.length > 0 && (
              <div className="flex gap-2 justify-center flex-wrap">
                {orderSessions.map(session => (
                  <Button
                    key={session.sessionId}
                    variant="outline"
                    onClick={() => setActiveSession(session.sessionId)}
                  >
                    {session.label} ({session.items.length} item)
                  </Button>
                ))}
              </div>
            )}
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

      {/* Tab Session — tampil kalau ada lebih dari 1 pembeli */}
      {orderSessions.length > 1 && (
        <div className="flex gap-2 mb-6 flex-wrap">
          {orderSessions.map(session => (
            <Button
              key={session.sessionId}
              size="sm"
              variant={session.sessionId === activeSessionId ? 'default' : 'outline'}
              onClick={() => {
                setActiveSession(session.sessionId);
                setPaymentMethod(null);
                setCashAmount('');
              }}
            >
              {session.label}
              <span className="ml-2 text-xs opacity-70">
                ({session.items.length} item)
              </span>
            </Button>
          ))}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6 max-w-5xl">
        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle>
              Ringkasan Pesanan
              {orderSessions.length > 1 && activeSessionId && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  — {orderSessions.find(s => s.sessionId === activeSessionId)?.label}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {currentOrder.map(item => {
                const itemTotal = calculateItemTotal(item);
                return (
                  <div key={item.uniqueId || item.id} className="text-sm border-b pb-2 last:border-0">
                    <div className="flex justify-between font-medium">
                      <span>{item.name} x{item.quantity}</span>
                      <span>Rp {itemTotal.toLocaleString('id-ID')}</span>
                    </div>
                    {item.options && (
                      <div className="text-xs text-muted-foreground mt-1 space-y-0.5 pl-2">
                        {item.options.part && <p>• {item.options.part}</p>}
                        {(item.options.spicyLevel ?? 0) > 0 && (
                          <p>
                            • Level {item.options.spicyLevel}
                            {item.options.isSeparated ? ' · Sambal Pisah' : ' · Sambal Disatukan'}
                            {(item.options.spicyLevel ?? 0) >= 4 && (
                              <span className="text-orange-500"> (+Rp1.000)</span>
                            )}
                          </p>
                        )}
                        {item.options.extras && (
                          <>
                            {item.options.extras.nasi > 0 && (
                              <p>• Nasi x{item.options.extras.nasi} (+Rp{(4000 * item.options.extras.nasi).toLocaleString('id-ID')})</p>
                            )}
                            {item.options.extras.telur > 0 && (
                              <p>• Telur x{item.options.extras.telur} (+Rp{(3000 * item.options.extras.telur).toLocaleString('id-ID')})</p>
                            )}
                            {item.options.extras.tempe > 0 && (
                              <p>• Tempe x{item.options.extras.tempe} (+Rp{(1000 * item.options.extras.tempe).toLocaleString('id-ID')})</p>
                            )}
                            {item.options.extras.tahu > 0 && (
                              <p>• Tahu x{item.options.extras.tahu} (+Rp{(1000 * item.options.extras.tahu).toLocaleString('id-ID')})</p>
                            )}
                          </>
                        )}
                        {item.options.notes && (
                          <p>• Catatan: <span className="italic">{item.options.notes}</span></p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="pt-2 border-t border-border">
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
                variant={paymentMethod === 'tunai' ? 'default' : 'outline'}
                className="h-16 text-lg justify-start"
                onClick={() => setPaymentMethod('tunai')}
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

            {paymentMethod === 'tunai' && (
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
                <div className="w-48 h-48 mx-auto bg-muted rounded-lg flex items-center justify-center relative">
                  <QrCode className="h-32 w-32 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Scan QR Code untuk membayar</p>
                  <p className="text-xs text-muted-foreground">
                    Rp {totalAmount.toLocaleString('id-ID')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Setelah scan, klik tombol di bawah untuk konfirmasi
                  </p>
                </div>
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
            {paymentMethod === 'tunai' && change > 0 && (
              <div>
                <p className="text-sm text-muted-foreground">Kembalian</p>
                <p className="text-2xl font-bold text-success">
                  Rp {change.toLocaleString('id-ID')}
                </p>
              </div>
            )}
          </div>
          {/* Kalau masih ada session lain, tawarkan lanjut bayar */}
          {orderSessions.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm text-center text-muted-foreground">
                Masih ada {orderSessions.length} pembeli lain
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleNewOrder} className="flex-1">
                  Pesanan Baru
                </Button>
                <Button
                  onClick={() => setShowSuccessDialog(false)}
                  className="flex-1"
                >
                  Bayar Pembeli Lain
                </Button>
              </div>
            </div>
          ) : (
            <Button onClick={handleNewOrder} className="w-full h-12">
              Pesanan Baru
            </Button>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}