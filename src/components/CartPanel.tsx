import React, { useState } from 'react';
import { CartItem } from '../types/pos';
import { formatRupiah, formatRupiahComma } from '../utils/formatters';
import { playClick } from '../utils/audio';
import { Save, Trash2, Plus, Minus, MessageSquare, Tag, Percent, X } from 'lucide-react';

interface CartPanelProps {
  items: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onSetQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onSaveOrder: () => void;
  onCheckout: () => void;
  onSetNotes: (productId: string, notes: string) => void;
  taxEnabled: boolean;
  onToggleTax: () => void;
  discountAmount: number;
  onSetDiscount: (amount: number) => void;
}

export const CartPanel: React.FC<CartPanelProps> = ({
  items,
  onUpdateQuantity,
  onSetQuantity,
  onRemoveItem,
  onClearCart,
  onSaveOrder,
  onCheckout,
  onSetNotes,
  taxEnabled,
  onToggleTax,
  discountAmount,
  onSetDiscount,
}) => {
  const [activeEditingItem, setActiveEditingItem] = useState<CartItem | null>(null);
  const [editingNote, setEditingNote] = useState('');
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [tempDiscountPercent, setTempDiscountPercent] = useState<number | null>(null);

  // Calculations
  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const effectiveDiscount = Math.min(discountAmount, subtotal);
  const taxableAmount = Math.max(0, subtotal - effectiveDiscount);
  const tax = taxEnabled ? Math.round(taxableAmount * 0.1) : 0;
  const grandTotal = Math.max(0, taxableAmount + tax);

  const handleOpenNotes = (item: CartItem) => {
    setActiveEditingItem(item);
    setEditingNote(item.notes || '');
  };

  const handleSaveNotes = () => {
    if (activeEditingItem) {
      onSetNotes(activeEditingItem.product.id, editingNote);
      setActiveEditingItem(null);
    }
  };

  return (
    <div className="w-80 md:w-96 lg:w-[410px] bg-white border-l border-neutral-200 flex flex-col h-full flex-shrink-0 select-none shadow-sm">
      {/* Cart Header */}
      <div className="px-4 py-2.5 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
            Daftar Pesanan
          </span>
          <span className="bg-red-100 text-[#b31412] text-xs font-bold px-2 py-0.5 rounded-full">
            {items.reduce((acc, it) => acc + it.quantity, 0)} item
          </span>
        </div>

        {items.length > 0 && (
          <button
            onClick={() => setShowDiscountModal(true)}
            className="flex items-center gap-1 text-xs text-neutral-600 hover:text-red-700 font-semibold px-2 py-1 rounded bg-white border border-neutral-200 cursor-pointer"
          >
            <Percent className="w-3.5 h-3.5 text-red-600" />
            <span>{discountAmount > 0 ? `Diskon: ${formatRupiah(discountAmount)}` : 'Diskon'}</span>
          </button>
        )}
      </div>

      {/* Cart Items List - Exact layout like the photo */}
      <div className="flex-1 overflow-y-auto divide-y divide-neutral-100 px-3">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 text-neutral-400">
            <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-3">
              <span className="text-2xl">🛒</span>
            </div>
            <p className="font-semibold text-neutral-600 text-sm">Pesanan Kosong</p>
            <p className="text-xs text-neutral-400 mt-1">
              Ketuk menu di sebelah kiri untuk menambahkan item ke pesanan.
            </p>
          </div>
        ) : (
          items.map((item) => {
            const itemTotal = item.product.price * item.quantity;
            return (
              <div
                key={item.product.id}
                className="py-2.5 flex items-center justify-between text-xs md:text-sm hover:bg-neutral-50/70 rounded-lg px-1 transition-colors group"
              >
                {/* Left: Quantity + Name */}
                <div className="flex items-center gap-3 flex-1 min-w-0 pr-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        playClick();
                        onUpdateQuantity(item.product.id, -1);
                      }}
                      className="w-5 h-5 rounded bg-neutral-100 hover:bg-red-100 hover:text-red-700 text-neutral-600 flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
                      title="Kurangi"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-5 text-center font-bold text-neutral-800">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => {
                        playClick();
                        onUpdateQuantity(item.product.id, 1);
                      }}
                      className="w-5 h-5 rounded bg-neutral-100 hover:bg-red-100 hover:text-red-700 text-neutral-600 flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
                      title="Tambah"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="font-semibold text-neutral-800 truncate">
                      {item.product.name}
                    </span>
                    {item.notes && (
                      <span className="text-[11px] text-amber-700 bg-amber-50 rounded px-1.5 py-0.5 mt-0.5 inline-block w-fit truncate">
                        Catatan: {item.notes}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right: Price + Note Button + Remove (x) */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleOpenNotes(item)}
                    className="p-1 text-neutral-300 hover:text-neutral-600 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                    title="Tambah Catatan"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </button>

                  <span className="font-bold text-neutral-800 font-mono min-w-[70px] text-right">
                    {formatRupiahComma(itemTotal)}
                  </span>

                  <button
                    onClick={() => {
                      playClick();
                      onRemoveItem(item.product.id);
                    }}
                    className="text-neutral-400 hover:text-red-600 p-1 transition-colors cursor-pointer"
                    title="Hapus"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Summary & Actions (Exact replica of tablet UI) */}
      <div className="border-t border-neutral-200 bg-white p-3 shadow-lg">
        {/* Top small handle */}
        <div className="w-10 h-1 bg-neutral-300 rounded-full mx-auto mb-2" />

        {/* Detailed breakdown (subtotal, tax, discount) */}
        {items.length > 0 && (
          <div className="space-y-1 mb-2 text-xs text-neutral-500 px-1">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-mono">{formatRupiahComma(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-red-600 font-medium">
                <span>Diskon</span>
                <span className="font-mono">-{formatRupiahComma(effectiveDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <label className="flex items-center gap-1.5 cursor-pointer text-[11px]">
                <input
                  type="checkbox"
                  checked={taxEnabled}
                  onChange={onToggleTax}
                  className="rounded text-red-600 focus:ring-red-500 cursor-pointer"
                />
                <span>Pajak Resto (PB1 10%)</span>
              </label>
              <span className="font-mono">{taxEnabled ? formatRupiahComma(tax) : 'Rp 0'}</span>
            </div>
          </div>
        )}

        {/* Big Total Row */}
        <div className="flex items-center justify-between py-2 border-t border-neutral-100 px-1">
          <span className="text-base md:text-lg font-bold text-neutral-800">Total</span>
          <span className="text-lg md:text-xl font-extrabold text-neutral-900 font-mono tracking-tight">
            {formatRupiahComma(grandTotal)}
          </span>
        </div>

        {/* Bottom 3 Action Buttons (Exact style: Floppy disk icon, BATAL, BAYAR) */}
        <div className="grid grid-cols-[48px_1fr_1.4fr] gap-2 mt-2">
          {/* Save / Hold Order button */}
          <button
            onClick={() => {
              playClick();
              onSaveOrder();
            }}
            disabled={items.length === 0}
            className="h-11 rounded-xl border-2 border-neutral-300 hover:border-red-600 hover:text-red-700 text-neutral-600 flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-95 bg-neutral-50 hover:bg-red-50"
            title="Simpan Pesanan / Hold"
          >
            <Save className="w-5 h-5" />
          </button>

          {/* BATAL button */}
          <button
            onClick={() => {
              playClick();
              onClearCart();
            }}
            disabled={items.length === 0}
            className="h-11 rounded-xl border border-neutral-300 hover:border-neutral-400 bg-white text-neutral-700 hover:bg-neutral-100 font-bold text-xs md:text-sm tracking-wider uppercase transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-95"
          >
            BATAL
          </button>

          {/* BAYAR button */}
          <button
            onClick={() => {
              playClick();
              onCheckout();
            }}
            disabled={items.length === 0}
            className="h-11 rounded-xl bg-[#b31412] hover:bg-[#9a100e] text-white font-extrabold text-sm md:text-base tracking-wider uppercase shadow-md hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-95 flex items-center justify-center"
          >
            BAYAR
          </button>
        </div>
      </div>

      {/* Item Notes Modal */}
      {activeEditingItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-4 shadow-2xl animate-in zoom-in-95">
            <h3 className="font-bold text-base text-neutral-800 mb-1">
              Catatan: {activeEditingItem.product.name}
            </h3>
            <p className="text-xs text-neutral-500 mb-3">
              Tambahkan preferensi pelanggan (misal: Sedikit Es, Pedas, Tanpa Gula).
            </p>
            <textarea
              value={editingNote}
              onChange={(e) => setEditingNote(e.target.value)}
              placeholder="Contoh: Es sedikit, manis sedang..."
              rows={3}
              className="w-full p-2.5 border border-neutral-300 rounded-xl text-sm focus:border-red-600 focus:outline-none mb-3"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={() => setActiveEditingItem(null)}
                className="flex-1 py-2 text-xs font-semibold text-neutral-600 bg-neutral-100 rounded-xl hover:bg-neutral-200 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleSaveNotes}
                className="flex-1 py-2 text-xs font-bold text-white bg-[#b31412] rounded-xl hover:bg-[#9a100e] cursor-pointer"
              >
                Simpan Catatan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Discount Modal */}
      {showDiscountModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-base text-neutral-800">
                Diskon Transaksi
              </h3>
              <button
                onClick={() => setShowDiscountModal(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2 mb-3">
              {[5, 10, 15, 20].map((pct) => (
                <button
                  key={pct}
                  onClick={() => {
                    const amt = Math.round((subtotal * pct) / 100);
                    onSetDiscount(amt);
                    setShowDiscountModal(false);
                  }}
                  className="py-2 bg-neutral-100 hover:bg-red-50 hover:text-red-700 font-bold text-xs rounded-xl border border-neutral-200 transition-colors cursor-pointer"
                >
                  {pct}%
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-600">
                Atau Nominal Diskon (Rp):
              </label>
              <input
                type="number"
                placeholder="0"
                defaultValue={discountAmount || ''}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const val = Number((e.target as HTMLInputElement).value) || 0;
                    onSetDiscount(val);
                    setShowDiscountModal(false);
                  }
                }}
                id="discount-input"
                className="w-full p-2.5 border border-neutral-300 rounded-xl text-sm font-mono focus:border-red-600 focus:outline-none"
              />
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  onSetDiscount(0);
                  setShowDiscountModal(false);
                }}
                className="flex-1 py-2 text-xs font-semibold text-neutral-600 bg-neutral-100 rounded-xl hover:bg-neutral-200 cursor-pointer"
              >
                Hapus Diskon
              </button>
              <button
                onClick={() => {
                  const input = document.getElementById('discount-input') as HTMLInputElement;
                  const val = Number(input?.value) || 0;
                  onSetDiscount(val);
                  setShowDiscountModal(false);
                }}
                className="flex-1 py-2 text-xs font-bold text-white bg-[#b31412] rounded-xl hover:bg-[#9a100e] cursor-pointer"
              >
                Terapkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
