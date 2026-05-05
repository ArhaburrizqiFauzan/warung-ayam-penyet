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
  const { addToOrder, currentOrder } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Hitung sudah berapa yang dipesan di keranjang
  const orderedQty = currentOrder
    .filter(i => i.id === menuItem.id)
    .reduce((sum, i) => sum + i.quantity, 0);

  const isOutOfStock = menuItem.stock === 0;
  const isMaxOrdered = orderedQty >= menuItem.stock;

  const handleClick = () => {
    if (menuItem.isCustomizable) {
      setIsModalOpen(true);
    } else {
      addToOrder(menuItem);
    }
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow w-full h-[160px] flex flex-col">
        <CardHeader className="pb-2 flex-shrink-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base leading-snug break-words whitespace-normal">
                {menuItem.name}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-0.5">{menuItem.category}</p>
            </div>
            <div className="flex-shrink-0">
              <Badge
                variant={
                  isOutOfStock ? 'destructive'
                  : menuItem.stock <= 5 ? 'warning'
                  : 'success'
                }
              >
                {isOutOfStock ? 'Habis'
                  : menuItem.stock <= 5 ? `Sisa ${menuItem.stock - orderedQty}`
                  : `Stok: ${menuItem.stock - orderedQty}`}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex items-end">
          <div className="flex items-center justify-between w-full">
            <span className="text-lg font-bold text-orange-500">
              Rp {menuItem.price.toLocaleString('id-ID')}
            </span>
            <Button
              onClick={handleClick}
              disabled={isOutOfStock || isMaxOrdered}
              size="sm"
              className="font-medium bg-orange-500 hover:bg-orange-600 flex-shrink-0"
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