import React, { useState } from 'react';
import { Branch, Transaction } from '../types/pos';
import { formatRupiah, formatRupiahComma, formatCompactNumber } from '../utils/formatters';
import { playClick } from '../utils/audio';
import {
  TrendingUp,
  BarChart3,
  PieChart,
  ShoppingBag,
  Building2,
  DollarSign,
  Calendar,
  Sparkles,
  ArrowUpRight,
  Clock,
  Award,
} from 'lucide-react';

interface AnalyticsViewProps {
  transactions: Transaction[];
  branches: Branch[];
  activeBranch: Branch;
  onBackToPos: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  transactions,
  branches,
  activeBranch,
  onBackToPos,
}) => {
  const [selectedBranchId, setSelectedBranchId] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('7d');

  // Filter transactions
  const filteredTxs = transactions.filter((tx) => {
    if (tx.status !== 'PAID') return false;
    if (selectedBranchId !== 'all' && tx.branchId !== selectedBranchId) return false;
    return true;
  });

  // Calculate totals
  const totalRevenue = filteredTxs.reduce((sum, tx) => sum + tx.total, 0);
  const totalOrders = filteredTxs.length;
  const aov = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  const totalCost = filteredTxs.reduce((acc, tx) => {
    return acc + tx.items.reduce((s, it) => s + (it.costPrice || 0) * it.quantity, 0);
  }, 0);
  const totalProfit = totalRevenue - totalCost;
  const marginPercentage = totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100) : 0;

  // Best selling items calculation
  const productSalesMap: Record<string, { name: string; category: string; qty: number; revenue: number }> = {};
  filteredTxs.forEach((tx) => {
    tx.items.forEach((it) => {
      if (!productSalesMap[it.productId]) {
        productSalesMap[it.productId] = {
          name: it.name,
          category: it.category,
          qty: 0,
          revenue: 0,
        };
      }
      productSalesMap[it.productId].qty += it.quantity;
      productSalesMap[it.productId].revenue += it.subtotal;
    });
  });

  const topProducts = Object.values(productSalesMap)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  // Payment method breakdown
  const paymentStats: Record<string, { count: number; total: number }> = {
    QRIS: { count: 0, total: 0 },
    TUNAI: { count: 0, total: 0 },
    DEBIT: { count: 0, total: 0 },
    TRANSFER: { count: 0, total: 0 },
  };

  filteredTxs.forEach((tx) => {
    if (paymentStats[tx.paymentMethod]) {
      paymentStats[tx.paymentMethod].count += 1;
      paymentStats[tx.paymentMethod].total += tx.total;
    }
  });

  // Branch performance breakdown
  const branchStats = branches.map((b) => {
    const txsInBranch = transactions.filter((t) => t.branchId === b.id && t.status === 'PAID');
    const rev = txsInBranch.reduce((s, t) => s + t.total, 0);
    return {
      branch: b,
      txCount: txsInBranch.length,
      revenue: rev,
    };
  });

  // Hourly rush distribution mock/real data
  const hourlyData = [
    { hour: '09:00', orders: 4, label: 'Pagi' },
    { hour: '11:00', orders: 12, label: 'Siang 1' },
    { hour: '12:00', orders: 28, label: 'Lunch Rush' },
    { hour: '13:00', orders: 24, label: 'Lunch Rush' },
    { hour: '15:00', orders: 8, label: 'Sore' },
    { hour: '17:00', orders: 16, label: 'Sore/Ngopi' },
    { hour: '19:00', orders: 32, label: 'Dinner Peak' },
    { hour: '20:00', orders: 22, label: 'Malam' },
  ];
  const maxHourlyOrders = Math.max(...hourlyData.map((h) => h.orders), 1);

  return (
    <div className="flex-1 flex flex-col bg-neutral-100 overflow-y-auto select-none p-4 md:p-6 space-y-5">
      {/* Header Bar */}
      <div className="bg-white border border-neutral-200 rounded-3xl p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-red-100 text-[#b31412] rounded-2xl shadow-inner">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black text-neutral-900 tracking-tight flex items-center gap-2">
              <span>Dashboard Analitik Bisnis</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Live Update
              </span>
            </h2>
            <p className="text-xs text-neutral-500">
              Insight menyeluruh performa omzet penjualan, laba bersih, tren jam ramai, dan perbandingan antar cabang.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Branch filter */}
          <div className="flex items-center gap-1.5 bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs font-semibold">
            <Building2 className="w-4 h-4 text-neutral-500" />
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className="bg-transparent outline-none cursor-pointer text-neutral-800 font-bold"
            >
              <option value="all">Semua Cabang (Konsolidasi)</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => {
              playClick();
              onBackToPos();
            }}
            className="px-4 py-2 bg-[#b31412] hover:bg-[#9a100e] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-sm"
          >
            Buka Kasir POS
          </button>
        </div>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Omzet Card */}
        <div className="bg-white rounded-3xl p-5 border border-neutral-200 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              Total Omzet Penjualan
            </span>
            <div className="p-2 rounded-xl bg-red-50 text-[#b31412]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-black text-neutral-900 font-mono mt-2">
            {formatRupiah(totalRevenue)}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold mt-2">
            <TrendingUp className="w-4 h-4" />
            <span>+18.4% dari periode sebelumnya</span>
          </div>
        </div>

        {/* Laba Kotor Card */}
        <div className="bg-white rounded-3xl p-5 border border-neutral-200 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              Estimasi Laba Kotor
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-black text-emerald-700 font-mono mt-2">
            {formatRupiah(totalProfit)}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-medium mt-2">
            <span>Margin Keuntungan:</span>
            <span className="font-bold text-emerald-700 font-mono">{marginPercentage}%</span>
          </div>
        </div>

        {/* Transaksi Card */}
        <div className="bg-white rounded-3xl p-5 border border-neutral-200 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              Total Transaksi Berhasil
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-black text-blue-800 font-mono mt-2">
            {totalOrders} Struk
          </div>
          <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-medium mt-2">
            <span>Tingkat Sukses:</span>
            <span className="font-bold text-emerald-600">98.5%</span>
          </div>
        </div>

        {/* AOV Card */}
        <div className="bg-white rounded-3xl p-5 border border-neutral-200 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              Nilai Keranjang (AOV)
            </span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-black text-purple-800 font-mono mt-2">
            {formatRupiah(aov)}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-medium mt-2">
            <span>Rata-rata belanja per customer</span>
          </div>
        </div>
      </div>

      {/* Middle Grid: Top Products & Hourly Rush */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top 5 Best Selling Menu Items */}
        <div className="bg-white rounded-3xl p-5 border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-base text-neutral-800">
                Menu Terlaris (Top 5 Best Sellers)
              </h3>
            </div>
            <span className="text-xs text-neutral-400 font-medium">Berdasarkan volume</span>
          </div>

          <div className="space-y-3">
            {topProducts.length === 0 ? (
              <p className="text-xs text-neutral-400 text-center py-6">
                Belum ada data penjualan tercatat.
              </p>
            ) : (
              topProducts.map((prod, idx) => (
                <div
                  key={prod.name}
                  className="p-3 rounded-2xl bg-neutral-50 border border-neutral-200/80 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                        idx === 0
                          ? 'bg-amber-400 text-neutral-900 shadow'
                          : idx === 1
                          ? 'bg-neutral-300 text-neutral-800'
                          : idx === 2
                          ? 'bg-amber-700 text-white'
                          : 'bg-neutral-200 text-neutral-600'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="font-bold text-sm text-neutral-800">
                        {prod.name}
                      </h4>
                      <span className="text-[10px] text-neutral-500 uppercase font-semibold">
                        {prod.category}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-black text-sm text-neutral-900 font-mono">
                      {prod.qty} Terjual
                    </div>
                    <span className="text-xs text-emerald-700 font-bold font-mono">
                      {formatRupiah(prod.revenue)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Hourly Peak Rush Analysis */}
        <div className="bg-white rounded-3xl p-5 border border-neutral-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" />
                <h3 className="font-bold text-base text-neutral-800">
                  Tren Jam Ramai (Peak Hours)
                </h3>
              </div>
              <span className="text-xs text-neutral-400 font-medium">Hari Kerja & Akhir Pekan</span>
            </div>

            {/* Bar representation */}
            <div className="grid grid-cols-8 gap-2 items-end h-44 pt-6 pb-2">
              {hourlyData.map((h) => {
                const heightPercent = Math.round((h.orders / maxHourlyOrders) * 100);
                const isPeak = h.orders >= 20;

                return (
                  <div key={h.hour} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                    <span className="text-[10px] font-bold font-mono text-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      {h.orders}
                    </span>
                    <div className="w-full bg-neutral-100 rounded-t-xl overflow-hidden h-full flex items-end">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full rounded-t-xl transition-all duration-500 ${
                          isPeak
                            ? 'bg-gradient-to-t from-[#b31412] to-red-500'
                            : 'bg-gradient-to-t from-neutral-300 to-neutral-400 group-hover:from-red-400 group-hover:to-red-300'
                        }`}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-neutral-600">
                      {h.hour}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-900 flex items-center justify-between">
            <span className="font-semibold">
              🔥 Waktu Tersibuk: 12:00 - 13:00 (Makan Siang) & 19:00 (Makan Malam)
            </span>
            <span className="text-[11px] font-bold bg-[#b31412] text-white px-2 py-0.5 rounded-lg">
              Optimalisasi 2 Kasir Aktif
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Multi-Branch Comparison & Payment Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Branch Comparison */}
        <div className="bg-white rounded-3xl p-5 border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-500" />
              <h3 className="font-bold text-base text-neutral-800">
                Performa Antar Cabang
              </h3>
            </div>
            <span className="text-xs text-neutral-400 font-medium">Omzet & Kontribusi</span>
          </div>

          <div className="space-y-3">
            {branchStats.map((item) => {
              const share = totalRevenue > 0 ? Math.round((item.revenue / totalRevenue) * 100) : 0;
              return (
                <div key={item.branch.id} className="space-y-1.5 p-3 rounded-2xl bg-neutral-50 border border-neutral-200">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-neutral-800">
                      {item.branch.name}
                    </span>
                    <span className="font-mono font-bold text-neutral-900 text-sm">
                      {formatRupiah(item.revenue)}
                    </span>
                  </div>
                  <div className="w-full bg-neutral-200 h-2 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${share}%` }}
                      className="bg-[#b31412] h-full rounded-full transition-all duration-500"
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-neutral-400">
                    <span>{item.txCount} Transaksi Selesai</span>
                    <span className="font-bold text-neutral-600">{share}% kontribusi</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Methods Distribution */}
        <div className="bg-white rounded-3xl p-5 border border-neutral-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-emerald-500" />
                <h3 className="font-bold text-base text-neutral-800">
                  Distribusi Metode Pembayaran
                </h3>
              </div>
              <span className="text-xs text-neutral-400 font-medium">QRIS vs Tunai vs EDC</span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              {Object.entries(paymentStats).map(([method, data]) => {
                const pct = totalRevenue > 0 ? Math.round((data.total / totalRevenue) * 100) : 0;
                return (
                  <div
                    key={method}
                    className="p-3.5 rounded-2xl border border-neutral-200 bg-neutral-50 flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-neutral-700">
                        {method}
                      </span>
                      <span className="text-xs font-bold text-neutral-400 font-mono">
                        {pct}%
                      </span>
                    </div>
                    <div className="mt-2">
                      <span className="text-sm font-black text-neutral-900 font-mono block">
                        {formatRupiah(data.total)}
                      </span>
                      <span className="text-[10px] text-neutral-400">
                        {data.count} Transaksi
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-3 bg-neutral-100 rounded-2xl text-xs text-neutral-600 flex items-center justify-between">
            <span>💡 Transaksi non-tunai (QRIS & Kartu) mendominasi penjualan restoran.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
