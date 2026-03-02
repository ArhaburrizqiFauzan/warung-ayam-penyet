import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Plus } from 'lucide-react';
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
            <div className={`px-2 py-1 rounded text-xs font-medium ${
              menuItem.stock === 0 ? 'bg-destructive text-destructive-foreground' :
              menuItem.stock < 10 ? 'bg-yellow-500 text-white' :
              'bg-green-500 text-white'
            }`}>
              {menuItem.stock > 0 ? `Stok: ${menuItem.stock}` : 'Habis'}
            </div>
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
