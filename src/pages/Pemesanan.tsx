import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MenuCard from '@/components/ui/menu-card';
import { Input } from '@/components/ui/input';
import { Plus, Minus, Trash2, ShoppingCart, Search } from 'lucide-react';
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
  const { menuItems, currentOrder, removeFromOrder, updateOrderQuantity } = useApp(); 
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const navigate = useNavigate();

  const categories = ['Semua', ...Array.from(new Set(menuItems.map(item => item.category)))];
  
  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'Semua' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  //Hitung total dengan memperhitungkan extrasTotal dan spicy level
  const calculateItemTotal = (item: any) => {
    const spicyExtra = (item.options?.spicyLevel ?? 0) >= 4 ? 1000 : 0;
    const extrasTotal = item.options?.extras
      ? (item.options.extras.nasi * 4000) +
        (item.options.extras.telur * 3000) +
        (item.options.extras.tempe * 1000) +
        (item.options.extras.tahu * 1000)
      : 0;
    return (item.price + extrasTotal + spicyExtra) * item.quantity;
  };

  const totalAmount = currentOrder.reduce((sum, item) => sum + calculateItemTotal(item), 0);

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
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Cari makanan atau minuman..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Filter */}
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

          {/* Menu Grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            {filteredItems.length === 0 ? (
              <div className="col-span-2 text-center py-12 text-muted-foreground">
                Tidak ada menu yang ditemukan
              </div>
            ) : (
              filteredItems.map(item => (
                <MenuCard key={item.id} menuItem={item} />
              ))
            )}
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
                    {currentOrder.map((item, index) => ( 
                      <div key={item.uniqueId || index} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.name}</p>
                          {item.options && (
                            <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                              <p>{item.options.part}</p>
                              {/*Tambah optional chaining pada spicyLevel */}
                              {(item.options?.spicyLevel ?? 0) > 0 && (
                                <p>
                                  Level {item.options.spicyLevel} • 
                                  {item.options.isSeparated ? ' Sambal Pisah' : ' Sambal Disatukan'}
                                  {item.options.spicyLevel >= 4 && (
                                    <span className="text-orange-500 ml-1">(+Rp1.000)</span>
                                  )}
                                </p>
                              )}

                              {item.options?.extras && (
                                <div className="mt-1 space-y-0.5">
                                  {item.options.extras.nasi > 0 && <p>Nasi x{item.options.extras.nasi}</p>}
                                  {item.options.extras.telur > 0 && <p>Telur x{item.options.extras.telur}</p>}
                                  {item.options.extras.tempe > 0 && <p>Tempe x{item.options.extras.tempe}</p>}
                                  {item.options.extras.tahu > 0 && <p>Tahu x{item.options.extras.tahu}</p>}
                                </div>
                              )}

                              {item.options?.notes && (
                                <p className="text-muted-foreground">
                                  <span className="font-medium">Catatan:</span>{' '}
                                  <span className="italic">{item.options.notes}</span>
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateOrderQuantity(item.uniqueId || item.id, item.quantity - 1)}
                            className="h-7 w-7 p-0"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateOrderQuantity(item.uniqueId || item.id, item.quantity + 1)}
                            className="h-7 w-7 p-0"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeFromOrder(item.uniqueId || item.id)}
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
        <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Konfirmasi Pesanan</DialogTitle>
            <DialogDescription>
              Pastikan pesanan sudah benar. Setelah dikonfirmasi, pesanan tidak dapat diubah.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 my-4">
            {currentOrder.map(item => {
              const itemTotal = calculateItemTotal(item);
              
              return (
                <div key={item.uniqueId || item.id} className="border-b pb-3">
                  <div className="flex justify-between items-start">
                    <p className="font-semibold text-base">{item.name}</p>
                    <span className="text-sm bg-gray-100 px-2 py-0.5 rounded">
                      x{item.quantity}
                    </span>
                  </div>
                  
                  <div className="text-sm text-muted-foreground mt-1 space-y-1">
                    {item.options?.part && (
                      <p>• {item.options.part}</p>
                    )}
                    
                    {(item.options?.spicyLevel ?? 0) > 0 && (
                      <p>
                        • Level {item.options?.spicyLevel} • 
                        {item.options?.isSeparated ? ' Sambal Pisah' : ' Sambal Disatukan'}
                        {(item.options?.spicyLevel ?? 0) >= 4 && (
                          <span className="text-orange-500 ml-1">(+Rp1.000)</span>
                        )}
                      </p>
                    )}
                    
                    {item.options?.extras && (
                      <div className="mt-1">
                        {item.options.extras.nasi > 0 && (
                          <p>• Nasi Putih x{item.options.extras.nasi} (+Rp{(4000 * item.options.extras.nasi).toLocaleString('id-ID')})</p>
                        )}
                        {item.options.extras.telur > 0 && (
                          <p>• Telur Dadar x{item.options.extras.telur} (+Rp{(3000 * item.options.extras.telur).toLocaleString('id-ID')})</p>
                        )}
                        {item.options.extras.tempe > 0 && (
                          <p>• Tempe Goreng x{item.options.extras.tempe} (+Rp{(1000 * item.options.extras.tempe).toLocaleString('id-ID')})</p>
                        )}
                        {item.options.extras.tahu > 0 && (
                          <p>• Tahu Goreng x{item.options.extras.tahu} (+Rp{(1000 * item.options.extras.tahu).toLocaleString('id-ID')})</p>
                        )}
                      </div>
                    )}
                    
                    {item.options?.notes && (
                      <p className="text-muted-foreground">
                        <span className="font-medium">• Catatan:</span>{' '}
                        <span className="italic">{item.options.notes}</span>
                      </p>
                    )}
                  </div>

                  {/*Tampilkan subtotal per item */}
                  <div className="flex justify-between mt-2 text-sm font-medium">
                    <span>Subtotal</span>
                    <span>Rp {itemTotal.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              );
            })}
            
            <div className="flex justify-between items-center">
              <span className="font-bold text-lg">Total</span>
              <span className="font-bold text-lg text-orange-500">
                Rp {totalAmount.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
          
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)} className="flex-1">
              Kembali
            </Button>
            <Button onClick={handleProceedToPayment} className="flex-1 bg-orange-500 hover:bg-orange-600">
              Lanjut ke Pembayaran
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}