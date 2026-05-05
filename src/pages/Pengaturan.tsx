import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '@/components/ui/table';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import type { MenuItem } from '@/contexts/AppContext';

export default function Pengaturan() {
  const { menuItems, updateMenuItem, addMenuItem, deleteMenuItem } = useApp();
  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingItem, setDeletingItem] = useState<MenuItem | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    stock: '',
  });

  const handleOpenDialog = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        price: String(item.price),
        category: item.category,
        stock: String(item.stock),
      });
    } else {
      setEditingItem(null);
      setFormData({ name: '', price: '', category: 'Paket Ayam', stock: '' });
    }
    setShowDialog(true);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.price || !formData.stock) {
      toast.error('Semua field harus diisi');
      return;
    }

    const itemData = {
      name: formData.name,
      price: parseInt(formData.price),
      category: formData.category,
      stock: parseInt(formData.stock),
    };

    if (editingItem) {
      updateMenuItem({ ...itemData, id: editingItem.id });
      toast.success('Menu berhasil diperbarui');
    } else {
      addMenuItem(itemData);
      toast.success('Menu baru berhasil ditambahkan');
    }
    setShowDialog(false);
  };

  const handleDeleteClick = (item: MenuItem) => {
    setDeletingItem(item);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;
    await deleteMenuItem(deletingItem.id);
    toast.success(`${deletingItem.name} berhasil dihapus`);
    setShowDeleteDialog(false);
    setDeletingItem(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manajemen Menu</h1>
          <p className="text-muted-foreground">Kelola menu dan harga</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Menu
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Daftar Menu</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold text-black">Nama Menu</TableHead>
                <TableHead className="font-bold text-black">Kategori</TableHead>
                <TableHead className="font-bold text-black">Harga</TableHead>
                <TableHead className="font-bold text-black">Stok</TableHead>
                <TableHead className="font-bold text-black text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {menuItems.map(item => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell className="text-left">
                    Rp {item.price.toLocaleString('id-ID')}
                  </TableCell>
                  <TableCell className="text-left">{item.stock}</TableCell>
                  <TableCell className="text-center space-x-2">
                    <Button size="sm" variant="outline" onClick={() => handleOpenDialog(item)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDeleteClick(item)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog Tambah/Edit */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Menu' : 'Tambah Menu Baru'}</DialogTitle>
            <DialogDescription>Isi informasi menu dengan lengkap</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nama Menu</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: Ayam Penyet Original"
              />
            </div>
            <div className="space-y-2">
              <Label>Kategori</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Paket Ayam">Paket Ayam</SelectItem>
                  <SelectItem value="Minuman">Minuman</SelectItem>
                  <SelectItem value="Lainnya">Lainnya</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Harga (Rp)</Label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label>Stok Awal</Label>
              <Input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                placeholder="0"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Batal</Button>
            <Button onClick={handleSubmit}>{editingItem ? 'Simpan' : 'Tambah'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Konfirmasi Hapus */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Menu</DialogTitle>
            <DialogDescription>
              Yakin ingin menghapus <strong>{deletingItem?.name}</strong>?
              Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} className="flex-1">
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} className="flex-1">
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}