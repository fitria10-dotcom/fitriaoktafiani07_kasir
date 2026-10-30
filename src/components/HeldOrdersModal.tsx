import React from 'react';
import { HeldOrder } from '../types/pos';
import { formatRupiah, formatDateIndo } from '../utils/formatters';
import { playClick } from '../utils/audio';
import { Clock, ArrowRight, Trash2, X } from 'lucide-react';

interface HeldOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  heldOrders: HeldOrder[];
  onResumeOrder: (order: HeldOrder) => void;
  onDeleteHeldOrder: (orderId: string) => void;
}

export const HeldOrdersModal: React.FC<HeldOrdersModalProps> = ({
  isOpen,
  onClose,
  heldOrders,
  onResumeOrder,
  onDeleteHeldOrder,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-neutral-100 flex flex-col max-h-[85vh] animate-in zoom-in-95">
        <div className="bg-[#b31412] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-300" />
            <h3 className="font-bold text-base">Antrean Pesanan Tersimpan (Hold)</h3>
          </div>
          <button
            onClick={() => {
              playClick();
              onClose();
            }}
            className="text-white/80 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1 divide-y divide-neutral-100">
          {heldOrders.length === 0 ? (
            <div className="text-center py-12 text-neutral-400">
              <Clock className="w-12 h-12 mx-auto text-neutral-300 mb-2" />
              <p className="font-semibold text-neutral-600">Tidak ada antrean pesanan tersimpan</p>
              <p className="text-xs text-neutral-400 mt-1">
                Gunakan tombol simpan (ikon disket) di keranjang kasir untuk menahan pesanan sementara.
              </p>
            </div>
          ) : (
            heldOrders.map((order) => {
              const totalItems = order.items.reduce((s, it) => s + it.quantity, 0);
              const orderTotal = order.items.reduce(
                (s, it) => s + it.product.price * it.quantity,
                0
              );

              return (
                <div
                  key={order.id}
                  className="py-3 flex items-center justify-between gap-3 hover:bg-neutral-50 px-2 rounded-xl transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-neutral-800 text-sm">
                        {order.customerName || 'Pelanggan Tunai'}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-neutral-100 text-neutral-700">
                        {order.channel}
                      </span>
                      {order.tableNo && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-[#b31412]">
                          {order.tableNo}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-neutral-500 mt-1 flex items-center gap-3">
                      <span>{totalItems} item</span>
                      <span className="font-mono font-bold text-neutral-700">
                        {formatRupiah(orderTotal)}
                      </span>
                      <span className="text-[11px] text-neutral-400">
                        {formatDateIndo(order.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        playClick();
                        onDeleteHeldOrder(order.id);
                      }}
                      className="p-2 text-neutral-400 hover:text-red-600 transition-colors cursor-pointer"
                      title="Hapus Antrean"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        playClick();
                        onResumeOrder(order);
                        onClose();
                      }}
                      className="px-3 py-1.5 bg-[#b31412] hover:bg-[#9a100e] text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                    >
                      <span>Buka</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
