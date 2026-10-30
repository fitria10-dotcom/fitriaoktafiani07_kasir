import React, { useEffect, useRef } from 'react';
import { Transaction } from '../types/pos';
import { formatRupiah, formatDateIndo, formatRupiahComma } from '../utils/formatters';
import { playClick } from '../utils/audio';
import { Printer, Check, Share2, Download, X } from 'lucide-react';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  autoPrint?: boolean;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  transaction,
  autoPrint = false,
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && autoPrint && transaction) {
      // Auto trigger print after short render delay
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoPrint, transaction]);

  if (!isOpen || !transaction) return null;

  const handlePrint = () => {
    playClick();
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `*STRUK PEMBELIAN KASIRPRO*\nNo: ${transaction.invoiceNo}\nCabang: ${transaction.branchName}\nTanggal: ${formatDateIndo(transaction.createdAt)}\nTotal: ${formatRupiah(transaction.total)}\nStatus: LUNAS (${transaction.paymentMethod})\n\nTerima kasih atas kunjungan Anda!`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-neutral-100 flex flex-col max-h-[95vh] animate-in zoom-in-95">
        {/* Modal Top Actions */}
        <div className="bg-neutral-900 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-sm">Struk Pembayaran</span>
          </div>
          <button
            onClick={() => {
              playClick();
              onClose();
            }}
            className="p-1 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Thermal Receipt Box */}
        <div className="p-4 overflow-y-auto flex-1 bg-neutral-100 flex justify-center">
          <div
            id="thermal-receipt-printable"
            ref={receiptRef}
            className="w-full max-w-[340px] bg-white p-5 shadow-sm border border-neutral-200 text-neutral-900 font-mono text-xs leading-relaxed"
          >
            {/* Header */}
            <div className="text-center pb-3 border-b-2 border-dashed border-neutral-400">
              <h2 className="text-base font-black tracking-tight">KASIRPRO RESTO</h2>
              <p className="text-[11px] font-bold mt-0.5">{transaction.branchName}</p>
              <p className="text-[10px] text-neutral-600 mt-0.5 leading-tight">
                Jl. M.H. Thamrin No. 28, Menteng
              </p>
              <p className="text-[10px] text-neutral-600">Telp: 021-3908821</p>
            </div>

            {/* Meta Info */}
            <div className="py-2.5 border-b border-dashed border-neutral-300 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span>No. Struk</span>
                <span className="font-bold">{transaction.invoiceNo}</span>
              </div>
              <div className="flex justify-between">
                <span>Waktu</span>
                <span>{formatDateIndo(transaction.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span>Kasir</span>
                <span>{transaction.cashierName}</span>
              </div>
              <div className="flex justify-between">
                <span>Channel</span>
                <span className="font-bold">{transaction.channel}</span>
              </div>
              {transaction.tableNo && (
                <div className="flex justify-between">
                  <span>Meja</span>
                  <span className="font-bold">{transaction.tableNo}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Pelanggan</span>
                <span>{transaction.customerName}</span>
              </div>
            </div>

            {/* Items */}
            <div className="py-2.5 border-b-2 border-dashed border-neutral-400 space-y-2">
              {transaction.items.map((it, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="font-bold flex justify-between">
                    <span className="truncate pr-1">{it.name}</span>
                    <span>{formatRupiahComma(it.subtotal)}</span>
                  </div>
                  <div className="text-[10px] text-neutral-600 flex justify-between">
                    <span>
                      {it.quantity} x {formatRupiahComma(it.price)}
                    </span>
                    {it.notes && (
                      <span className="italic text-neutral-500 truncate max-w-[150px]">
                        *{it.notes}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="py-2.5 border-b-2 border-dashed border-neutral-400 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatRupiahComma(transaction.subtotal)}</span>
              </div>
              {transaction.discount > 0 && (
                <div className="flex justify-between">
                  <span>Diskon</span>
                  <span>-{formatRupiahComma(transaction.discount)}</span>
                </div>
              )}
              {transaction.tax > 0 && (
                <div className="flex justify-between">
                  <span>PB1 Resto (10%)</span>
                  <span>{formatRupiahComma(transaction.tax)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-black pt-1 border-t border-neutral-200">
                <span>TOTAL</span>
                <span>{formatRupiahComma(transaction.total)}</span>
              </div>
            </div>

            {/* Payment Details */}
            <div className="py-2.5 border-b border-dashed border-neutral-300 space-y-1 text-[11px]">
              <div className="flex justify-between font-bold">
                <span>METODE PEMBAYARAN</span>
                <span>{transaction.paymentMethod}</span>
              </div>
              {transaction.paymentMethod === 'TUNAI' && (
                <>
                  <div className="flex justify-between">
                    <span>Uang Diterima</span>
                    <span>{formatRupiahComma(transaction.cashPaid || transaction.total)}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Kembalian</span>
                    <span>{formatRupiahComma(transaction.change || 0)}</span>
                  </div>
                </>
              )}
              {transaction.paymentMethod === 'QRIS' && (
                <>
                  <div className="flex justify-between text-[10px] text-neutral-600">
                    <span>Ref Transaksi</span>
                    <span>{transaction.qrisReference || 'QRIS-OK'}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-neutral-600">
                    <span>RRN</span>
                    <span>{transaction.qrisRrn || '881029482910'}</span>
                  </div>
                </>
              )}
            </div>

            {/* Footer Greeting */}
            <div className="pt-3 text-center text-[10px] space-y-1 text-neutral-600">
              <p className="font-bold uppercase tracking-wider">
                TERIMA KASIH ATAS KUNJUNGAN ANDA
              </p>
              <p>Barang yang sudah dibeli tidak dapat ditukar</p>
              <p className="text-[9px] text-neutral-400">Powered by KasirPro Cloud POS</p>

              {/* Barcode representation */}
              <div className="pt-2 flex flex-col items-center">
                <div className="font-mono text-[9px] tracking-[0.25em] text-neutral-700">
                  |||||| ||||| ||||||| |||| ||||||
                </div>
                <span className="text-[9px] font-mono mt-0.5">
                  {transaction.invoiceNo}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Buttons */}
        <div className="p-4 bg-white border-t border-neutral-200 flex flex-col sm:flex-row gap-2">
          <button
            onClick={handlePrint}
            className="flex-1 py-3 bg-[#b31412] hover:bg-[#9a100e] text-white rounded-xl font-bold text-xs md:text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Struk Thermal</span>
          </button>

          <button
            onClick={handleShareWhatsApp}
            className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs md:text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span>WhatsApp</span>
          </button>

          <button
            onClick={() => {
              playClick();
              onClose();
            }}
            className="py-3 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl font-bold text-xs md:text-sm cursor-pointer transition-colors"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
