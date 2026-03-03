import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { MenuItem, useApp } from '@/contexts/AppContext';
import { AyamCustomizationModal } from './ayam-customization-modal';

interface MenuCardProps {
  menuItem: MenuItem;
}

export default function MenuCard({ menuItem }: MenuCardProps) {
  const { addToOrder } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClick = () => {
    if (menuItem.isCustomizable) {
      setIsModalOpen(true);
    } else {
      addToOrder(menuItem);
    }
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg">{menuItem.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{menuItem.category}</p>
            </div>
            <Badge variant={menuItem.stock === 0 ? 'destructive' : menuItem.stock <= 5 ? 'warning' : 'success'}>
              {menuItem.stock === 0 ? 'Habis' : menuItem.stock <= 5 ? `Sisa ${menuItem.stock}!` : `Stok: ${menuItem.stock}`}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-orange-500">
              Rp {menuItem.price.toLocaleString('id-ID')}
            </span>
            <Button
              onClick={handleClick}
              disabled={menuItem.stock === 0}
              size="sm"
              className="font-medium bg-orange-500 hover:bg-orange-600"
            >
              <Plus className="h-4 w-4 mr-1" />
              Tambah
            </Button>
          </div>
        </CardContent>
      </Card>

      <AyamCustomizationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        menuItem={menuItem}
      />
    </>
  );
}
