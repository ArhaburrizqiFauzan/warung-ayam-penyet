import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Minus, Trash2, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function Pemesanan() {
  const { menuItems, currentOrder, addToOrder, removeFromOrder, updateOrderQuantity } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const navigate = useNavigate();

  const categories = ['Semua', ...Array.from(new Set(menuItems.map(item => item.category)))];
  const filteredItems = selectedCategory === 'Semua'
    ? menuItems
    : menuItems.filter(item => item.category === selectedCategory);

  const totalAmount = currentOrder.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleConfirmOrder = () => {
    if (currentOrder.length === 0) {
      toast.error('Keranjang kosong, tambahkan item terlebih dahulu');
      return;
    }
    setShowConfirmDialog(true);
  };

  const handleProceedToPayment = () => {
    setShowConfirmDialog(false);
    navigate('/pembayaran');
    toast.success('Pesanan dikonfirmasi, lanjut ke pembayaran');
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Pemesanan</h1>
        <p className="text-muted-foreground">Pilih menu dan tambahkan ke keranjang</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Menu List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex gap-2 flex-wrap">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category)}
                className="font-medium"
              >
                {category}
              </Button>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {filteredItems.map(item => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{item.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{item.category}</p>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      item.stock === 0 ? 'bg-destructive text-destructive-foreground' :
                      item.stock < 10 ? 'bg-warning text-warning-foreground' :
                      'bg-success text-success-foreground'
                    }`}>
                      {item.stock > 0 ? `Stok: ${item.stock}` : 'Habis'}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-primary">
                      Rp {item.price.toLocaleString('id-ID')}
                    </span>
                    <Button
                      onClick={() => addToOrder(item)}
                      disabled={item.stock === 0}
                      size="sm"
                      className="font-medium"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Tambah
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Keranjang Pesanan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentOrder.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Keranjang masih kosong
                </p>
              ) : (
                <>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {currentOrder.map(item => (
                      <div key={item.id} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Rp {item.price.toLocaleString('id-ID')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateOrderQuantity(item.id, item.quantity - 1)}
                            className="h-7 w-7 p-0"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateOrderQuantity(item.id, item.quantity + 1)}
                            className="h-7 w-7 p-0"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeFromOrder(item.id)}
                            className="h-7 w-7 p-0 ml-1"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-border">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-lg font-medium">Total</span>
                      <span className="text-2xl font-bold text-primary">
                        Rp {totalAmount.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <Button
                      onClick={handleConfirmOrder}
                      className="w-full h-12 text-lg font-medium"
                    >
                      Konfirmasi Pesanan
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Pesanan</DialogTitle>
            <DialogDescription>
              Pastikan pesanan sudah benar. Setelah dikonfirmasi, pesanan tidak dapat diubah.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 my-4">
            {currentOrder.map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>{item.name} x{item.quantity}</span>
                <span className="font-medium">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</span>
              </div>
            ))}
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span>Total</span>
              <span className="text-primary">Rp {totalAmount.toLocaleString('id-ID')}</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Kembali
            </Button>
            <Button onClick={handleProceedToPayment}>
              Lanjut ke Pembayaran
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
