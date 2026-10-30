import React, { useState } from 'react';
import { Branch, CategoryId, Product, StaffUser } from '../types/pos';
import { CATEGORIES } from '../data/initialData';
import { ProductImage } from './ProductImage';
import { formatRupiah, formatRupiahComma } from '../utils/formatters';
import { playClick, playSuccess, playError } from '../utils/audio';
import {
  Package,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  ArrowUpDown,
  Edit,
  TrendingUp,
  Boxes,
  Building2,
  CheckCircle,
  X,
  PlusCircle,
  MinusCircle,
} from 'lucide-react';

interface InventoryViewProps {
  products: Product[];
  branches: Branch[];
  activeBranch: Branch;
  currentStaff: StaffUser;
  onUpdateProductStock: (productId: string, branchId: string, newStock: number, reason: string) => void;
  onAddNewProduct: (newProduct: Product) => void;
  onUpdateProductDetails: (updated: Product) => void;
  onBackToPos: () => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  products,
  branches,
  activeBranch,
  currentStaff,
  onUpdateProductStock,
  onAddNewProduct,
  onUpdateProductDetails,
  onBackToPos,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'ALL'>('ALL');
  const [filterStockStatus, setFilterStockStatus] = useState<'all' | 'low' | 'out'>('all');
  const [selectedBranchId, setSelectedBranchId] = useState<string>(activeBranch.id);

  // Modals
  const [adjustStockProduct, setAdjustStockProduct] = useState<Product | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<number>(10);
  const [adjustType, setAdjustType] = useState<'add' | 'set' | 'reduce'>('add');
  const [adjustReason, setAdjustReason] = useState<string>('Penerimaan Barang Supplier');

  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states for new/edit product
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<CategoryId>('MINUMAN');
  const [formPrice, setFormPrice] = useState<number>(10000);
  const [formCostPrice, setFormCostPrice] = useState<number>(5000);
  const [formCode, setFormCode] = useState('');
  const [formMinStock, setFormMinStock] = useState<number>(10);
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formInitialStock, setFormInitialStock] = useState<number>(30);

  // Filtered products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    const stock = p.stockByBranch[selectedBranchId] ?? 0;

    let matchesStock = true;
    if (filterStockStatus === 'low') {
      matchesStock = stock > 0 && stock <= p.minStock;
    } else if (filterStockStatus === 'out') {
      matchesStock = stock <= 0;
    }

    return matchesSearch && matchesCat && matchesStock;
  });

  // KPI summaries
  const totalItemsCount = products.length;
  const lowStockCount = products.filter(
    (p) => (p.stockByBranch[selectedBranchId] ?? 0) <= p.minStock && (p.stockByBranch[selectedBranchId] ?? 0) > 0
  ).length;
  const outOfStockCount = products.filter(
    (p) => (p.stockByBranch[selectedBranchId] ?? 0) <= 0
  ).length;
  const totalValuation = products.reduce((acc, p) => {
    const stock = p.stockByBranch[selectedBranchId] ?? 0;
    return acc + stock * p.costPrice;
  }, 0);

  const handleOpenAdjust = (product: Product) => {
    setAdjustStockProduct(product);
    setAdjustAmount(10);
    setAdjustType('add');
    setAdjustReason('Penerimaan Barang Supplier');
  };

  const handleConfirmStockAdjust = () => {
    if (!adjustStockProduct) return;
    const currentStock = adjustStockProduct.stockByBranch[selectedBranchId] ?? 0;
    let newStock = currentStock;

    if (adjustType === 'add') {
      newStock = currentStock + adjustAmount;
    } else if (adjustType === 'reduce') {
      newStock = Math.max(0, currentStock - adjustAmount);
    } else {
      newStock = Math.max(0, adjustAmount);
    }

    onUpdateProductStock(adjustStockProduct.id, selectedBranchId, newStock, adjustReason);
    playSuccess();
    setAdjustStockProduct(null);
  };

  const handleOpenAddModal = () => {
    setFormName('');
    setFormCategory('MINUMAN');
    setFormPrice(15000);
    setFormCostPrice(7500);
    setFormCode(`PRD-${Math.floor(100 + Math.random() * 900)}`);
    setFormMinStock(10);
    setFormImageUrl('https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=400&h=400&q=80');
    setFormInitialStock(25);
    setEditingProduct(null);
    setShowAddModal(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormCategory(product.category);
    setFormPrice(product.price);
    setFormCostPrice(product.costPrice);
    setFormCode(product.code);
    setFormMinStock(product.minStock);
    setFormImageUrl(product.imageUrl);
    setFormInitialStock(product.stockByBranch[selectedBranchId] ?? 0);
    setShowAddModal(true);
  };

  const handleSaveProductForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formCode) return;

    if (editingProduct) {
      const updated: Product = {
        ...editingProduct,
        name: formName,
        category: formCategory,
        price: formPrice,
        costPrice: formCostPrice,
        code: formCode,
        minStock: formMinStock,
        imageUrl: formImageUrl,
        stockByBranch: {
          ...editingProduct.stockByBranch,
          [selectedBranchId]: formInitialStock,
        },
      };
      onUpdateProductDetails(updated);
    } else {
      const newProd: Product = {
        id: `p${Date.now()}`,
        name: formName,
        category: formCategory,
        price: formPrice,
        costPrice: formCostPrice,
        code: formCode,
        minStock: formMinStock,
        imageUrl: formImageUrl,
        unit: 'Porsi',
        isAvailable: true,
        stockByBranch: {
          [selectedBranchId]: formInitialStock,
        },
      };
      onAddNewProduct(newProd);
    }

    playSuccess();
    setShowAddModal(false);
  };

  return (
    <div className="flex-1 flex flex-col bg-neutral-100 overflow-hidden select-none">
      {/* Header Bar */}
      <div className="bg-white border-b border-neutral-200 px-4 md:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-red-100 text-[#b31412] rounded-xl">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-black text-neutral-900 tracking-tight">
              Manajemen Inventaris & Stok
            </h2>
            <p className="text-xs text-neutral-500">
              Pantau stok barang per cabang, HPP, peringatan stok menipis, dan opname barang.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Branch Filter dropdown */}
          <div className="flex items-center gap-1.5 bg-neutral-50 border border-neutral-300 rounded-xl px-2.5 py-1.5 text-xs font-semibold">
            <Building2 className="w-4 h-4 text-neutral-500" />
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className="bg-transparent outline-none cursor-pointer text-neutral-800"
            >
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
              handleOpenAddModal();
            }}
            className="px-3.5 py-2 bg-[#b31412] hover:bg-[#9a100e] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Produk</span>
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
        <div className="bg-white p-3.5 rounded-2xl border border-neutral-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-neutral-400 uppercase">
              Total Katalog
            </span>
            <div className="text-xl font-black text-neutral-900 font-mono mt-0.5">
              {totalItemsCount} Menu
            </div>
          </div>
          <Boxes className="w-7 h-7 text-neutral-300" />
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-neutral-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-neutral-400 uppercase">
              Total Nilai Stok (HPP)
            </span>
            <div className="text-xl font-black text-emerald-700 font-mono mt-0.5">
              {formatRupiah(totalValuation)}
            </div>
          </div>
          <TrendingUp className="w-7 h-7 text-emerald-300" />
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-neutral-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-amber-600 uppercase">
              Stok Menipis
            </span>
            <div className="text-xl font-black text-amber-700 font-mono mt-0.5">
              {lowStockCount} Item
            </div>
          </div>
          <AlertTriangle className="w-7 h-7 text-amber-400" />
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-neutral-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-red-600 uppercase">
              Stok Habis
            </span>
            <div className="text-xl font-black text-red-700 font-mono mt-0.5">
              {outOfStockCount} Item
            </div>
          </div>
          <AlertTriangle className="w-7 h-7 text-red-400" />
        </div>
      </div>

      {/* Filters & Search Row */}
      <div className="bg-white mx-4 md:mx-6 p-3 rounded-2xl border border-neutral-200 shadow-sm flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Cari nama produk / kode SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs focus:border-[#b31412] outline-none"
            />
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as any)}
            className="px-2.5 py-1.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-semibold text-neutral-700 outline-none cursor-pointer"
          >
            <option value="ALL">Semua Kategori</option>
            {CATEGORIES.filter((c) => c.id !== 'ALL').map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Stock Status Filter */}
          <div className="flex bg-neutral-100 p-0.5 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setFilterStockStatus('all')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                filterStockStatus === 'all' ? 'bg-white shadow text-neutral-900' : 'text-neutral-500'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setFilterStockStatus('low')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                filterStockStatus === 'low' ? 'bg-white shadow text-amber-700' : 'text-neutral-500'
              }`}
            >
              Menipis ({lowStockCount})
            </button>
            <button
              onClick={() => setFilterStockStatus('out')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                filterStockStatus === 'out' ? 'bg-white shadow text-red-700' : 'text-neutral-500'
              }`}
            >
              Habis ({outOfStockCount})
            </button>
          </div>
        </div>
      </div>

      {/* Product Table */}
      <div className="flex-1 mx-4 md:mx-6 mb-4 bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 text-neutral-500 uppercase font-bold border-b border-neutral-200">
              <tr>
                <th className="px-4 py-3">Produk</th>
                <th className="px-3 py-3">Kategori</th>
                <th className="px-3 py-3">Harga Jual</th>
                <th className="px-3 py-3">HPP (Modal)</th>
                <th className="px-3 py-3">Margin / Laba</th>
                <th className="px-3 py-3">Stok Saat Ini</th>
                <th className="px-3 py-3">Min. Stok</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-neutral-400">
                    Tidak ada produk yang cocok dengan pencarian.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const stock = p.stockByBranch[selectedBranchId] ?? 0;
                  const isLow = stock > 0 && stock <= p.minStock;
                  const isOut = stock <= 0;
                  const marginRp = p.price - p.costPrice;
                  const marginPct = p.price > 0 ? Math.round((marginRp / p.price) * 100) : 0;

                  return (
                    <tr key={p.id} className="hover:bg-neutral-50/70 transition-colors">
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-xs flex-shrink-0">
                            <ProductImage
                              src={p.imageUrl}
                              alt={p.name}
                              category={p.category}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <span className="font-bold text-neutral-800 block text-xs md:text-sm">
                              {p.name}
                            </span>
                            <span className="text-[10px] text-neutral-400 font-mono">
                              SKU: {p.code}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-3 py-2.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-700">
                          {p.category}
                        </span>
                      </td>

                      <td className="px-3 py-2.5 font-bold font-mono text-neutral-800">
                        {formatRupiah(p.price)}
                      </td>

                      <td className="px-3 py-2.5 font-mono text-neutral-500">
                        {formatRupiah(p.costPrice)}
                      </td>

                      <td className="px-3 py-2.5">
                        <span className="text-emerald-700 font-bold font-mono">
                          +{formatRupiah(marginRp)}
                        </span>
                        <span className="text-[10px] text-emerald-600 ml-1">
                          ({marginPct}%)
                        </span>
                      </td>

                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`font-black font-mono text-sm px-2 py-0.5 rounded-md ${
                              isOut
                                ? 'bg-red-100 text-red-700'
                                : isLow
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {stock} {p.unit}
                          </span>
                        </div>
                      </td>

                      <td className="px-3 py-2.5 text-neutral-500 font-mono">
                        {p.minStock} {p.unit}
                      </td>

                      <td className="px-4 py-2.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              playClick();
                              handleOpenAdjust(p);
                            }}
                            className="px-2.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                            title="Atur Stok / Opname"
                          >
                            Atur Stok
                          </button>
                          <button
                            onClick={() => {
                              playClick();
                              handleOpenEditModal(p);
                            }}
                            className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
                            title="Edit Produk"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Stock Modal */}
      {adjustStockProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-base text-neutral-800">
                Penyesuaian Stok Barang
              </h3>
              <button
                onClick={() => setAdjustStockProduct(null)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-neutral-500 mb-3">
              Produk: <span className="font-bold text-neutral-800">{adjustStockProduct.name}</span>
              <br />
              Stok saat ini di cabang: <span className="font-bold font-mono">{adjustStockProduct.stockByBranch[selectedBranchId] ?? 0}</span>
            </p>

            <div className="grid grid-cols-3 gap-2 mb-3">
              <button
                onClick={() => setAdjustType('add')}
                className={`py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                  adjustType === 'add'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-neutral-50 text-neutral-700 border-neutral-200'
                }`}
              >
                + Masuk
              </button>
              <button
                onClick={() => setAdjustType('reduce')}
                className={`py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                  adjustType === 'reduce'
                    ? 'bg-red-600 text-white border-red-600'
                    : 'bg-neutral-50 text-neutral-700 border-neutral-200'
                }`}
              >
                - Keluar
              </button>
              <button
                onClick={() => setAdjustType('set')}
                className={`py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                  adjustType === 'set'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-neutral-50 text-neutral-700 border-neutral-200'
                }`}
              >
                = Opname
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-neutral-600 block mb-1">
                  Jumlah:
                </label>
                <input
                  type="number"
                  min="1"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(Number(e.target.value) || 0)}
                  className="w-full p-2.5 border border-neutral-300 rounded-xl text-sm font-bold font-mono focus:border-red-600 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-600 block mb-1">
                  Keterangan / Alasan:
                </label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs focus:border-red-600 outline-none"
                >
                  <option value="Penerimaan Barang Supplier">Penerimaan Barang Supplier</option>
                  <option value="Hasil Stock Opname Fisik">Hasil Stock Opname Fisik</option>
                  <option value="Barang Rusak / Basi / Kadaluwarsa">Barang Rusak / Basi / Kadaluwarsa</option>
                  <option value="Koreksi Salah Input Kasir">Koreksi Salah Input Kasir</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setAdjustStockProduct(null)}
                className="flex-1 py-2 text-xs font-bold text-neutral-600 bg-neutral-100 rounded-xl hover:bg-neutral-200 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmStockAdjust}
                className="flex-1 py-2 text-xs font-bold text-white bg-[#b31412] rounded-xl hover:bg-[#9a100e] cursor-pointer"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-base text-neutral-800">
                {editingProduct ? 'Edit Informasi Produk' : 'Tambah Produk Baru'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProductForm} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-neutral-600 block mb-1">
                  Nama Menu / Produk:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Es Cendol Nangka"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs font-semibold focus:border-red-600 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-neutral-600 block mb-1">
                    Kategori:
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as CategoryId)}
                    className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs focus:border-red-600 outline-none"
                  >
                    {CATEGORIES.filter((c) => c.id !== 'ALL').map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-600 block mb-1">
                    Kode SKU:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="MNM-012"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs font-mono uppercase focus:border-red-600 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-neutral-600 block mb-1">
                    Harga Jual (Rp):
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value) || 0)}
                    className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs font-mono font-bold focus:border-red-600 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-600 block mb-1">
                    HPP / Modal Pokok (Rp):
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formCostPrice}
                    onChange={(e) => setFormCostPrice(Number(e.target.value) || 0)}
                    className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs font-mono focus:border-red-600 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-neutral-600 block mb-1">
                    Stok di Cabang {activeBranch.name}:
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formInitialStock}
                    onChange={(e) => setFormInitialStock(Number(e.target.value) || 0)}
                    className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs font-mono focus:border-red-600 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-600 block mb-1">
                    Batas Peringatan Min. Stok:
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formMinStock}
                    onChange={(e) => setFormMinStock(Number(e.target.value) || 0)}
                    className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs font-mono focus:border-red-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-600 block mb-1">
                  URL Gambar Produk (Didukung fail-safe fallback otomatis):
                </label>
                <div className="flex gap-2 items-center">
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-neutral-200 flex-shrink-0">
                    <ProductImage
                      src={formImageUrl}
                      alt={formName || 'Preview'}
                      category={formCategory}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    className="flex-1 p-2.5 border border-neutral-300 rounded-xl text-xs focus:border-red-600 outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 bg-neutral-100 text-neutral-700 font-bold rounded-xl text-xs hover:bg-neutral-200 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#b31412] text-white font-bold rounded-xl text-xs hover:bg-[#9a100e] cursor-pointer"
                >
                  {editingProduct ? 'Perbarui Produk' : 'Simpan Produk Baru'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
