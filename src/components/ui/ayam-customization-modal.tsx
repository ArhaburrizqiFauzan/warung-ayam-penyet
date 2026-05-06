import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './dialog';
import { Button } from './button';
import { Label } from './label';
import { RadioGroup, RadioGroupItem } from './radio-group';
import { Textarea } from './textarea';
import { Slider } from './slider';
import { Minus, Plus } from 'lucide-react';
import { MenuItem, AyamOptions, useApp } from '@/contexts/AppContext';
import { EXTRAS_PRICE, EXTRAS_LABEL } from '@/components/Extras';

interface AyamCustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  menuItem: MenuItem;
}

// Type untuk varian sambal Jumbo
type JumboVariant = 'original' | 'sambal-ijo' | 'sambal-matah';

// Type untuk extra items
interface ExtraItem {
  nasi: number;
  telur: number;
  tempe: number;
  tahu: number;
}

export function AyamCustomizationModal({ isOpen, onClose, menuItem }: AyamCustomizationModalProps) {
  const { addToOrder, setTemporaryOrder } = useApp();
  const [selectedPart, setSelectedPart] = useState<'Dada' | 'Paha Atas' | 'Sayap' | 'Paha Bawah'>('Dada');
  const [jumboVariant, setJumboVariant] = useState<JumboVariant>('original');
  const [spicyLevel, setSpicyLevel] = useState(3);
  const [isSeparated, setIsSeparated] = useState(false);
  const [notes, setNotes] = useState('');
  const [extras, setExtras] = useState<ExtraItem>({
    nasi: 0,
    telur: 0,
    tempe: 0,
    tahu: 0
  });
  const isJumbo = menuItem.name.includes('Jumbo');
  const hasSambalOptions = menuItem.name.includes('Sambal') || menuItem.name.includes('Jumbo');
  const selectedHasSambal = isJumbo ? jumboVariant !== 'original' : hasSambalOptions;
  const getLevelExtraPrice = () => {
    if (!selectedHasSambal) return 0;
    return (spicyLevel >= 4 && spicyLevel <= 5) ? 1000 : 0;
  };
  const getExtrasTotal = () => {
    return (Object.keys(extras) as (keyof typeof extras)[]).reduce((sum, key) => {
      return sum + (extras[key] * EXTRAS_PRICE[key]);
    }, 0);
  };
  const updateExtra = (item: keyof ExtraItem, change: number) => {
    setExtras(prev => ({
      ...prev,
      [item]: Math.max(0, prev[item] + change)
    }));
  };

  const getFinalName = () => {
    if (isJumbo) {
      if (jumboVariant === 'sambal-ijo') return 'Ayam Penyet Jumbo Sambal Ijo';
      if (jumboVariant === 'sambal-matah') return 'Ayam Penyet Jumbo Sambal Matah';
      return 'Ayam Penyet Jumbo Original';
    }
    return menuItem.name;
  };

  const handleAddToCart = () => {
    const finalName = getFinalName();
    const levelExtraPrice = getLevelExtraPrice();
    const extrasTotal = getExtrasTotal();
    
    const options: AyamOptions = {
      part: selectedPart,
      spicyLevel: selectedHasSambal ? spicyLevel : 0,
      isSeparated: selectedHasSambal ? isSeparated : false,
      notes: notes || undefined,
      extras: extras, 
    };

    setTemporaryOrder({
      menuItem: { ...menuItem, name: finalName },
      options,
    });

    // Kirim data dengan harga yang sudah ditambah level extra + extras
    addToOrder({ 
      ...menuItem, 
      name: finalName,
      price: menuItem.price + levelExtraPrice + extrasTotal
    }, options);
    
    onClose();
    
    // Reset form
    setSelectedPart('Dada');
    setJumboVariant('original');
    setSpicyLevel(3);
    setIsSeparated(false);
    setNotes('');
    setExtras({ nasi: 0, telur: 0, tempe: 0, tahu: 0 });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{menuItem.name}</DialogTitle>
          <DialogDescription>
            Harga dasar: Rp {menuItem.price.toLocaleString('id-ID')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 1. BAGIAN AYAM */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Pilih Bagian Ayam</Label>
            <RadioGroup 
              value={selectedPart} 
              onValueChange={(value) => setSelectedPart(value as any)}
              className="grid grid-cols-2 gap-2"
            >
              {(['Dada', 'Sayap', 'Paha Atas', 'Paha Bawah'] as const).map((part) => (
                <div key={part} className="flex items-center space-x-2 border rounded-lg p-2 hover:bg-gray-50">
                  <RadioGroupItem value={part} id={`part-${part}`} />
                  <Label htmlFor={`part-${part}`} className="font-normal cursor-pointer w-full">{part}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Khusus Jumbo : Pilihan varian sambal */}
          {isJumbo && (
            <div className="space-y-2 border-t pt-4">
              <Label className="text-base font-semibold">Pilih Varian Sambal</Label>
              <RadioGroup 
                value={jumboVariant} 
                onValueChange={(value) => setJumboVariant(value as JumboVariant)}
                className="grid grid-cols-1 gap-2"
              >
                {/* Original */}
                <div className={`flex items-center space-x-2 border rounded-lg p-3 hover:bg-gray-50 cursor-pointer ${
                  jumboVariant === 'original' ? 'border-orange-500 bg-orange-50' : ''
                }`}>
                  <RadioGroupItem value="original" id="jumbo-original" />
                  <Label htmlFor="jumbo-original" className="font-medium cursor-pointer w-full">
                    Original (Tanpa Sambal)
                  </Label>
                </div>
                
                {/* Sambal Ijo */}
                <div className={`flex items-center space-x-2 border rounded-lg p-3 hover:bg-gray-50 cursor-pointer ${
                  jumboVariant === 'sambal-ijo' ? 'border-orange-500 bg-orange-50' : ''
                }`}>
                  <RadioGroupItem value="sambal-ijo" id="jumbo-sambal-ijo" />
                  <Label htmlFor="jumbo-sambal-ijo" className="font-medium cursor-pointer w-full">
                    Sambal Ijo
                  </Label>
                </div>
                
                {/* Sambal Matah */}
                <div className={`flex items-center space-x-2 border rounded-lg p-3 hover:bg-gray-50 cursor-pointer ${
                  jumboVariant === 'sambal-matah' ? 'border-orange-500 bg-orange-50' : ''
                }`}>
                  <RadioGroupItem value="sambal-matah" id="jumbo-sambal-matah" />
                  <Label htmlFor="jumbo-sambal-matah" className="font-medium cursor-pointer w-full">
                    Sambal Matah
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Pilihan Sambal */}
          {(isJumbo ? selectedHasSambal : hasSambalOptions) && (
            <>
              {/* Level Pedas */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-base font-semibold">Level Pedas</Label>
                  <span className="text-sm font-medium bg-orange-100 text-orange-700 px-3 py-1 rounded-full">
                    Level {spicyLevel}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {/* Kolom Kiri: Level 1,2,3 */}
                  <div className="space-y-2">
                    {[1, 2, 3].map((level) => (
                      <div
                        key={level}
                        onClick={() => setSpicyLevel(level)}
                        className={`border rounded-lg p-3 text-center cursor-pointer transition-all ${
                          spicyLevel === level 
                            ? 'border-orange-500 bg-orange-50' 
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="font-medium">Level {level}</div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Kolom Kanan: Level 4,5 */}
                  <div className="space-y-2">
                    {[4, 5].map((level) => (
                      <div
                        key={level}
                        onClick={() => setSpicyLevel(level)}
                        className={`border rounded-lg p-3 text-center cursor-pointer transition-all ${
                          spicyLevel === level 
                            ? 'border-orange-500 bg-orange-50' 
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="font-medium">Level {level}</div>
                        <div className="text-xs text-orange-500 font-medium mt-1">
                          +Rp1.000
                        </div>
                      </div>
                    ))}
                    <div className="p-3 invisible">spacer</div>
                  </div>
                </div>
                
              </div>

              {/* Penyajian Sambal */}
              <div className="space-y-2">
                <Label className="text-base font-semibold">Penyajian Sambal</Label>
                <RadioGroup 
                  value={isSeparated ? 'dipisah' : 'disatukan'} 
                  onValueChange={(value) => setIsSeparated(value === 'dipisah')}
                  className="grid grid-cols-2 gap-2"
                >
                  <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-gray-50">
                    <RadioGroupItem value="disatukan" id="disatukan" />
                    <Label htmlFor="disatukan" className="font-normal cursor-pointer">Disatukan</Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-gray-50">
                    <RadioGroupItem value="dipisah" id="dipisah" />
                    <Label htmlFor="dipisah" className="font-normal cursor-pointer">Dipisah</Label>
                  </div>
                </RadioGroup>
              </div>
            </>
          )}

          {/* Extra Items - NASI & LAUK */}
          <div className="space-y-3 border-t pt-4">
            <Label className="text-base font-semibold">Tambahan Menu Lainnya</Label>
            
            {/* Nasi */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Nasi Putih</p>
                <p className="text-sm text-gray-500">+Rp{EXTRAS_PRICE.nasi.toLocaleString('id-ID')}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateExtra('nasi', -1)}
                  className="h-8 w-8 p-0"
                  disabled={extras.nasi === 0}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-8 text-center font-medium">{extras.nasi}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateExtra('nasi', 1)}
                  className="h-8 w-8 p-0"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Telur */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Telur Dadar</p>
                <p className="text-sm text-gray-500">+Rp{EXTRAS_PRICE.telur.toLocaleString('id-ID')}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateExtra('telur', -1)}
                  className="h-8 w-8 p-0"
                  disabled={extras.telur === 0}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-8 text-center font-medium">{extras.telur}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateExtra('telur', 1)}
                  className="h-8 w-8 p-0"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Tempe */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Tempe Goreng</p>
                <p className="text-sm text-gray-500">+Rp{EXTRAS_PRICE.tempe.toLocaleString('id-ID')}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateExtra('tempe', -1)}
                  className="h-8 w-8 p-0"
                  disabled={extras.tempe === 0}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-8 text-center font-medium">{extras.tempe}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateExtra('tempe', 1)}
                  className="h-8 w-8 p-0"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Tahu */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Tahu Goreng</p>
                <p className="text-sm text-gray-500">+Rp{EXTRAS_PRICE.tahu.toLocaleString('id-ID')}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateExtra('tahu', -1)}
                  className="h-8 w-8 p-0"
                  disabled={extras.tahu === 0}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-8 text-center font-medium">{extras.tahu}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateExtra('tahu', 1)}
                  className="h-8 w-8 p-0"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* Catatan */}
          <div className="space-y-2 border-t pt-4">
            <Label className="text-base font-semibold">Catatan (opsional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Jangan pakai timun, sambal banyak..."
              rows={2}
              className="resize-none"
            />
          </div>

          {/* Info untuk menu Original */}
          {!hasSambalOptions && !isJumbo && (
            <div className="text-xs text-muted-foreground bg-blue-50 p-2 rounded">
              ℹ️ Menu Original tanpa pilihan level pedas
            </div>
          )}
        </div>

        {/* Total Harga */}
        <div className="flex justify-between items-center border-t pt-4">
          <div>
            <span className="font-semibold text-lg">Total:</span>
            {selectedHasSambal && spicyLevel >= 4 && (
              <p className="text-xs text-orange-500">Level {spicyLevel}: +Rp1.000</p>
            )}
            {getExtrasTotal() > 0 && (
              <p className="text-xs text-green-600">Extra: +Rp{getExtrasTotal().toLocaleString('id-ID')}</p>
            )}
          </div>
          <span className="text-xl font-bold text-orange-500">
            Rp {(menuItem.price + getLevelExtraPrice() + getExtrasTotal()).toLocaleString('id-ID')}
          </span>
        </div>

        {/* Tombol */}
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Batal
          </Button>
          <Button onClick={handleAddToCart} className="flex-1 bg-orange-500 hover:bg-orange-600">
            Tambah ke Keranjang
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
