import React, { useState } from 'react';
import { Branch, PaymentMethod, StaffUser, Transaction } from '../types/pos';
import { formatRupiah, formatDateIndo, formatRupiahComma } from '../utils/formatters';
import { playClick, playSuccess, playError } from '../utils/audio';
import {
  FileText,
  Calendar,
  Building2,
  CreditCard,
  Download,
  Printer,
  Eye,
  AlertCircle,
  TrendingUp,
  Receipt,
  X,
  Search,
  Filter,
} from 'lucide-react';

interface ReportsViewProps {
  transactions: Transaction[];
  branches: Branch[];
  activeBranch: Branch;
  currentStaff: StaffUser;
  onReprintReceipt: (transaction: Transaction) => void;
  onVoidTransaction: (transactionId: string, reason: string) => void;
  onBackToPos: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  transactions,
  branches,
  activeBranch,
  currentStaff,
  onReprintReceipt,
  onVoidTransaction,
  onBackToPos,
}) => {
  const [dateFilter, setDateFilter] = useState<'today' | 'yesterday' | 'week' | 'month' | 'all'>('today');
  const [branchFilter, setBranchFilter] = useState<string>(activeBranch.id);
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  // Void modal state
  const [voidTarget, setVoidTarget] = useState<Transaction | null>(null);
  const [voidReason, setVoidReason] = useState<string>('Pelanggan Salah Pesan / Batal');
  const [selectedTxDetail, setSelectedTxDetail] = useState<Transaction | null>(null);

  // Filter transactions
  const filteredTransactions = transactions.filter((tx) => {
    // Search
    const matchesSearch =
      tx.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
      tx.customerName.toLowerCase().includes(search.toLowerCase()) ||
      tx.cashierName.toLowerCase().includes(search.toLowerCase());

    // Branch
    const matchesBranch = branchFilter === 'all' || tx.branchId === branchFilter;

    // Payment Method
    const matchesMethod = methodFilter === 'all' || tx.paymentMethod === methodFilter;

    // Date
    const txDate = new Date(tx.createdAt);
    const now = new Date();
    let matchesDate = true;

    if (dateFilter === 'today') {
      matchesDate = txDate.toDateString() === now.toDateString();
    } else if (dateFilter === 'yesterday') {
      const yesterday = new Date();
      yesterday.setDate(now.getDate() - 1);
      matchesDate = txDate.toDateString() === yesterday.toDateString();
    } else if (dateFilter === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);
      matchesDate = txDate >= weekAgo;
    } else if (dateFilter === 'month') {
      matchesDate =
        txDate.getMonth() === now.getMonth() &&
        txDate.getFullYear() === now.getFullYear();
    }

    return matchesSearch && matchesBranch && matchesMethod && matchesDate;
  });

  // Calculate Metrics
  const activeTxs = filteredTransactions.filter((tx) => tx.status === 'PAID');
  const totalGrossRevenue = activeTxs.reduce((sum, tx) => sum + tx.total, 0);
  const totalOrdersCount = activeTxs.length;
  const aov = totalOrdersCount > 0 ? Math.round(totalGrossRevenue / totalOrdersCount) : 0;

  // Calculate Profit (Revenue minus Total Cost of Goods Sold)
  const totalCostOfGoods = activeTxs.reduce((acc, tx) => {
    const txCost = tx.items.reduce(
      (itemSum, it) => itemSum + (it.costPrice || 0) * it.quantity,
      0
    );
    return acc + txCost;
  }, 0);
  const totalGrossProfit = totalGrossRevenue - totalCostOfGoods;

  // Export to CSV
  const handleExportCSV = () => {
    playClick();
    const headers = [
      'No Invoice',
      'Waktu',
      'Cabang',
      'Kasir',
      'Channel',
      'Meja',
      'Pelanggan',
      'Metode Pembayaran',
      'Status',
      'Subtotal',
      'Diskon',
      'Pajak PB1',
      'Total',
    ];

    const rows = filteredTransactions.map((tx) => [
      `"${tx.invoiceNo}"`,
      `"${formatDateIndo(tx.createdAt)}"`,
      `"${tx.branchName}"`,
      `"${tx.cashierName}"`,
      `"${tx.channel}"`,
      `"${tx.tableNo || '-'}"`,
      `"${tx.customerName}"`,
      `"${tx.paymentMethod}"`,
      `"${tx.status}"`,
      tx.subtotal,
      tx.discount,
      tx.tax,
      tx.total,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `laporan-penjualan-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    playSuccess();
  };

  const handleConfirmVoid = () => {
    if (!voidTarget) return;

    if (currentStaff.role === 'cashier') {
      playError();
      alert('Pembatalan transaksi (VOID) memerlukan otorisasi Supervisor atau Manajer Cabang!');
      return;
    }

    onVoidTransaction(voidTarget.id, voidReason);
    playSuccess();
    setVoidTarget(null);
  };

  return (
    <div className="flex-1 flex flex-col bg-neutral-100 overflow-hidden select-none">
      {/* Header Bar */}
      <div className="bg-white border-b border-neutral-200 px-4 md:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-100 text-blue-700 rounded-xl">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-black text-neutral-900 tracking-tight">
              Laporan Penjualan Real-Time
            </h2>
            <p className="text-xs text-neutral-500">
              Pantau arus transaksi kasir, omzet real-time, metode QRIS/Tunai, dan cetak ulang struk.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor Excel/CSV</span>
          </button>

          <button
            onClick={() => {
              playClick();
              onBackToPos();
            }}
            className="px-3.5 py-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Kembali ke Kasir
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 md:px-6">
        <div className="bg-white p-3.5 rounded-2xl border border-neutral-200 shadow-sm">
          <span className="text-[11px] font-bold text-neutral-400 uppercase">
            Total Omzet Bersih
          </span>
          <div className="text-xl md:text-2xl font-black text-neutral-900 font-mono mt-0.5">
            {formatRupiah(totalGrossRevenue)}
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">
            ● Real-time Live
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-neutral-200 shadow-sm">
          <span className="text-[11px] font-bold text-neutral-400 uppercase">
            Estimasi Laba Kotor
          </span>
          <div className="text-xl md:text-2xl font-black text-emerald-700 font-mono mt-0.5">
            {formatRupiah(totalGrossProfit)}
          </div>
          <span className="text-[10px] text-neutral-400 mt-1 block">
            Omzet dikurangi HPP
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-neutral-200 shadow-sm">
          <span className="text-[11px] font-bold text-neutral-400 uppercase">
            Jumlah Transaksi
          </span>
          <div className="text-xl md:text-2xl font-black text-blue-700 font-mono mt-0.5">
            {totalOrdersCount} Struk
          </div>
          <span className="text-[10px] text-neutral-400 mt-1 block">
            {filteredTransactions.filter((t) => t.status === 'VOID').length} Transaksi Dibatalkan
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-neutral-200 shadow-sm">
          <span className="text-[11px] font-bold text-neutral-400 uppercase">
            Rata-rata Keranjang (AOV)
          </span>
          <div className="text-xl md:text-2xl font-black text-purple-700 font-mono mt-0.5">
            {formatRupiah(aov)}
          </div>
          <span className="text-[10px] text-neutral-400 mt-1 block">
            Per transaksi berhasil
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white mx-4 md:mx-6 p-3 rounded-2xl border border-neutral-200 shadow-sm flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-1 max-w-xs">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Cari no invoice / pelanggan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs focus:border-[#b31412] outline-none"
            />
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Date range chips */}
          <div className="flex bg-neutral-100 p-0.5 rounded-xl text-xs font-semibold">
            {[
              { id: 'today', label: 'Hari Ini' },
              { id: 'yesterday', label: 'Kemarin' },
              { id: 'week', label: '7 Hari' },
              { id: 'month', label: 'Bulan Ini' },
              { id: 'all', label: 'Semua' },
            ].map((d) => (
              <button
                key={d.id}
                onClick={() => setDateFilter(d.id as any)}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  dateFilter === d.id ? 'bg-white shadow text-neutral-900 font-bold' : 'text-neutral-500'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          {/* Branch filter */}
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-semibold text-neutral-700 outline-none cursor-pointer"
          >
            <option value="all">Semua Cabang</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          {/* Payment Method filter */}
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-semibold text-neutral-700 outline-none cursor-pointer"
          >
            <option value="all">Semua Metode</option>
            <option value="QRIS">QRIS Dinamis</option>
            <option value="TUNAI">Tunai (Cash)</option>
            <option value="DEBIT">Debit EDC</option>
            <option value="TRANSFER">Transfer Bank</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="flex-1 mx-4 md:mx-6 mb-4 bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 text-neutral-500 uppercase font-bold border-b border-neutral-200">
              <tr>
                <th className="px-4 py-3">No. Invoice & Waktu</th>
                <th className="px-3 py-3">Cabang</th>
                <th className="px-3 py-3">Kasir</th>
                <th className="px-3 py-3">Channel / Pelanggan</th>
                <th className="px-3 py-3">Metode Bayar</th>
                <th className="px-3 py-3">Total Transaksi</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-neutral-400">
                    Tidak ada transaksi pada filter yang dipilih.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className={`hover:bg-neutral-50/70 transition-colors ${
                      tx.status === 'VOID' ? 'bg-red-50/30 line-through opacity-70' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div>
                        <span className="font-bold text-neutral-800 font-mono block">
                          {tx.invoiceNo}
                        </span>
                        <span className="text-[10px] text-neutral-400">
                          {formatDateIndo(tx.createdAt)}
                        </span>
                      </div>
                    </td>

                    <td className="px-3 py-3 font-medium text-neutral-700">
                      {tx.branchName}
                    </td>

                    <td className="px-3 py-3 text-neutral-600">
                      {tx.cashierName}
                    </td>

                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-neutral-100 text-neutral-700">
                          {tx.channel}
                        </span>
                        <span className="font-semibold text-neutral-800 truncate max-w-[120px]">
                          {tx.customerName}
                        </span>
                        {tx.tableNo && (
                          <span className="text-[10px] text-neutral-400 font-medium">
                            ({tx.tableNo})
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-3 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                          tx.paymentMethod === 'QRIS'
                            ? 'bg-red-100 text-[#b31412]'
                            : tx.paymentMethod === 'TUNAI'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {tx.paymentMethod}
                      </span>
                    </td>

                    <td className="px-3 py-3 font-bold font-mono text-neutral-900 text-sm">
                      {formatRupiah(tx.total)}
                    </td>

                    <td className="px-3 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          tx.status === 'PAID'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-red-100 text-red-700 font-bold'
                        }`}
                      >
                        {tx.status === 'PAID' ? 'LUNAS' : 'DIBATALKAN (VOID)'}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            playClick();
                            setSelectedTxDetail(tx);
                          }}
                          className="p-1.5 text-neutral-500 hover:text-neutral-800 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
                          title="Lihat Detail Pesanan"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            playClick();
                            onReprintReceipt(tx);
                          }}
                          className="px-2 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                          title="Cetak Ulang Struk"
                        >
                          <Printer className="w-3 h-3" />
                          <span>Cetak</span>
                        </button>

                        {tx.status === 'PAID' && (
                          <button
                            onClick={() => {
                              playClick();
                              setVoidTarget(tx);
                            }}
                            className="p-1.5 text-neutral-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                            title="Batalkan (Void)"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Details Modal */}
      {selectedTxDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h3 className="font-bold text-base text-neutral-800">
                  Rincian Transaksi
                </h3>
                <p className="text-xs text-neutral-500 font-mono">
                  {selectedTxDetail.invoiceNo}
                </p>
              </div>
              <button
                onClick={() => setSelectedTxDetail(null)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                ✕
              </button>
            </div>

            <div className="bg-neutral-50 rounded-xl p-3 text-xs space-y-1.5 mb-3 border border-neutral-200">
              <div className="flex justify-between">
                <span className="text-neutral-500">Waktu:</span>
                <span className="font-medium">{formatDateIndo(selectedTxDetail.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Cabang:</span>
                <span className="font-medium">{selectedTxDetail.branchName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Kasir:</span>
                <span className="font-medium">{selectedTxDetail.cashierName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Pelanggan:</span>
                <span className="font-medium">{selectedTxDetail.customerName} ({selectedTxDetail.channel})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Metode Bayar:</span>
                <span className="font-bold text-red-700">{selectedTxDetail.paymentMethod}</span>
              </div>
            </div>

            <div className="divide-y divide-neutral-100 max-h-48 overflow-y-auto mb-3 text-xs">
              {selectedTxDetail.items.map((it, idx) => (
                <div key={idx} className="py-1.5 flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-neutral-800 block">
                      {it.name}
                    </span>
                    <span className="text-[10px] text-neutral-400">
                      {it.quantity} x {formatRupiah(it.price)}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-neutral-800">
                    {formatRupiah(it.subtotal)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-neutral-200 pt-2 space-y-1 text-xs">
              <div className="flex justify-between text-neutral-500">
                <span>Subtotal:</span>
                <span>{formatRupiah(selectedTxDetail.subtotal)}</span>
              </div>
              {selectedTxDetail.discount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Diskon:</span>
                  <span>-{formatRupiah(selectedTxDetail.discount)}</span>
                </div>
              )}
              {selectedTxDetail.tax > 0 && (
                <div className="flex justify-between text-neutral-500">
                  <span>PB1 (10%):</span>
                  <span>{formatRupiah(selectedTxDetail.tax)}</span>
                </div>
              )}
              <div className="flex justify-between font-black text-sm text-neutral-900 pt-1 border-t border-neutral-100">
                <span>Total:</span>
                <span>{formatRupiah(selectedTxDetail.total)}</span>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  onReprintReceipt(selectedTxDetail);
                  setSelectedTxDetail(null);
                }}
                className="flex-1 py-2 bg-[#b31412] text-white rounded-xl text-xs font-bold hover:bg-[#9a100e] cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Ulang Struk</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Void Modal */}
      {voidTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-2 text-red-600 mb-2">
              <AlertCircle className="w-5 h-5" />
              <h3 className="font-bold text-base text-neutral-800">
                Batalkan Transaksi (VOID)?
              </h3>
            </div>

            <p className="text-xs text-neutral-500 mb-3">
              Apakah Anda yakin ingin membatalkan transaksi <span className="font-mono font-bold text-neutral-800">{voidTarget.invoiceNo}</span> senilai <span className="font-bold text-neutral-800">{formatRupiah(voidTarget.total)}</span>? Stok produk akan otomatis dikembalikan ke inventaris.
            </p>

            <div className="space-y-2 mb-4">
              <label className="text-xs font-semibold text-neutral-600 block">
                Alasan Pembatalan:
              </label>
              <select
                value={voidReason}
                onChange={(e) => setVoidReason(e.target.value)}
                className="w-full p-2 border border-neutral-300 rounded-xl text-xs focus:border-red-600 outline-none"
              >
                <option value="Pelanggan Salah Pesan / Batal">Pelanggan Salah Pesan / Batal</option>
                <option value="Salah Input Kasir">Salah Input Kasir</option>
                <option value="Makanan Rusak / Tidak Tersedia">Makanan Rusak / Tidak Tersedia</option>
                <option value="Pembayaran Gagal / Ditolak">Pembayaran Gagal / Ditolak</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setVoidTarget(null)}
                className="flex-1 py-2 text-xs font-bold text-neutral-600 bg-neutral-100 rounded-xl hover:bg-neutral-200 cursor-pointer"
              >
                Tutup
              </button>
              <button
                onClick={handleConfirmVoid}
                className="flex-1 py-2 text-xs font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 cursor-pointer"
              >
                Konfirmasi VOID
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
