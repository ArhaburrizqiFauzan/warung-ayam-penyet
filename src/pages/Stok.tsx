import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Minus } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function Stok() {
  const { menuItems, updateStock } = useApp();
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [stockChange, setStockChange] = useState('');
  const [changeType, setChangeType] = useState<'add' | 'reduce'>('add');
  const [showDialog, setShowDialog] = useState(false);

  const handleOpenDialog = (itemId: string, type: 'add' | 'reduce') => {
    setSelectedItem(itemId);
    setChangeType(type);
    setStockChange('');
    setShowDialog(true);
  };

  const handleUpdateStock = () => {
    if (!selectedItem || !stockChange) return;

    const item = menuItems.find(i => i.id === selectedItem);
    if (!item) return;

    const change = parseInt(stockChange);
    const newStock = changeType === 'add' 
      ? item.stock + change
      : Math.max(0, item.stock - change);

    updateStock(selectedItem, newStock);
    toast.success(`Stok ${item.name} berhasil diperbarui`);
    setShowDialog(false);
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: 'Habis', color: 'bg-destructive text-destructive-foreground' };
    if (stock < 10) return { label: 'Hampir Habis', color: 'bg-warning text-warning-foreground' };
    return { label: 'Normal', color: 'bg-success text-success-foreground' };
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Manajemen Stok</h1>
        <p className="text-muted-foreground">Kelola stok bahan dan menu</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Stok</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Item</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead className="text-center">Stok Saat Ini</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {menuItems.map(item => {
                const status = getStockStatus(item.stock);
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell className="text-center">
                      <span className="text-xl font-bold">{item.stock}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${status.color}`}>
                        {status.label}
                      </span>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenDialog(item.id, 'add')}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Tambah
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenDialog(item.id, 'reduce')}
                        disabled={item.stock === 0}
                      >
                        <Minus className="h-4 w-4 mr-1" />
                        Kurangi
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {changeType === 'add' ? 'Tambah Stok' : 'Kurangi Stok'}
            </DialogTitle>
            <DialogDescription>
              {selectedItem && menuItems.find(i => i.id === selectedItem)?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="stock-change">Jumlah</Label>
              <Input
                id="stock-change"
                type="number"
                min="1"
                placeholder="0"
                value={stockChange}
                onChange={(e) => setStockChange(e.target.value)}
                className="h-12 text-lg"
              />
            </div>
            {selectedItem && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex justify-between">
                  <span className="text-sm">Stok Saat Ini:</span>
                  <span className="font-bold">
                    {menuItems.find(i => i.id === selectedItem)?.stock}
                  </span>
                </div>
                {stockChange && (
                  <div className="flex justify-between mt-2">
                    <span className="text-sm">Stok Setelah {changeType === 'add' ? 'Penambahan' : 'Pengurangan'}:</span>
                    <span className="font-bold text-primary">
                      {changeType === 'add'
                        ? (menuItems.find(i => i.id === selectedItem)?.stock || 0) + parseInt(stockChange)
                        : Math.max(0, (menuItems.find(i => i.id === selectedItem)?.stock || 0) - parseInt(stockChange))
                      }
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Batal
            </Button>
            <Button onClick={handleUpdateStock} disabled={!stockChange}>
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
