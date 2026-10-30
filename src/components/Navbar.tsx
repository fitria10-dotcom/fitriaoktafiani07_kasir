import React, { useState } from 'react';
import {
  Menu,
  Edit2,
  Search,
  Users,
  MoreVertical,
  Cloud,
  CloudCheck,
  RefreshCw,
  Building2,
  Lock,
  Volume2,
  VolumeX,
  FileText,
  Clock,
  Sparkles,
  ShoppingBag,
  Store,
  ChevronDown,
} from 'lucide-react';
import { Branch, ChannelType, CloudSyncState, StaffUser } from '../types/pos';
import { playClick } from '../utils/audio';

interface NavbarProps {
  channel: ChannelType;
  onChangeChannel: (ch: ChannelType) => void;
  customerName: string;
  onEditCustomer: () => void;
  tableNo: string;
  onSelectTable: () => void;
  activeBranch: Branch;
  onOpenBranchSelector: () => void;
  currentStaff: StaffUser;
  onSwitchStaff: () => void;
  cloudSync: CloudSyncState;
  onOpenCloudSync: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenMenuDrawer: () => void;
  onOpenHeldOrders: () => void;
  heldOrdersCount: number;
  currentView: 'pos' | 'inventory' | 'reports' | 'analytics';
  onNavigateView: (view: 'pos' | 'inventory' | 'reports' | 'analytics') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  channel,
  onChangeChannel,
  customerName,
  onEditCustomer,
  tableNo,
  onSelectTable,
  activeBranch,
  onOpenBranchSelector,
  currentStaff,
  onSwitchStaff,
  cloudSync,
  onOpenCloudSync,
  searchQuery,
  onSearchChange,
  onOpenMenuDrawer,
  onOpenHeldOrders,
  heldOrdersCount,
  currentView,
  onNavigateView,
}) => {
  const [showChannelDropdown, setShowChannelDropdown] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);

  const channels: ChannelType[] = [
    'DINE IN',
    'TAKE AWAY',
    'DELIVERY',
    'GOFOOD',
    'GRABFOOD',
    'SHOPEEFOOD',
  ];

  return (
    <header className="bg-[#b31412] text-white select-none shadow-md z-30 sticky top-0">
      <div className="flex items-center justify-between px-3 h-14 md:h-16 gap-2">
        {/* Left Section: Menu toggle & Channel & Member */}
        <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
          <button
            onClick={() => {
              playClick();
              onOpenMenuDrawer();
            }}
            className="p-2 hover:bg-black/15 active:bg-black/25 rounded-lg transition-colors flex items-center justify-center cursor-pointer"
            title="Menu Navigasi"
          >
            <Menu className="w-6 h-6 text-white" />
          </button>

          {/* Channel Selector Pill */}
          <div className="relative">
            <button
              onClick={() => {
                playClick();
                setShowChannelDropdown(!showChannelDropdown);
              }}
              className="flex items-center gap-2 bg-black/20 hover:bg-black/30 text-white px-2.5 py-1.5 rounded-lg text-xs md:text-sm font-semibold tracking-wide transition-all border border-white/10 cursor-pointer"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Channel : {channel}</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-80" />
            </button>

            {showChannelDropdown && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowChannelDropdown(false)}
                />
                <div className="absolute left-0 mt-1.5 w-48 bg-white text-neutral-800 rounded-xl shadow-2xl py-1.5 z-50 border border-neutral-100 text-xs font-medium animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                    Pilih Tipe Penjualan
                  </div>
                  {channels.map((ch) => (
                    <button
                      key={ch}
                      onClick={() => {
                        playClick();
                        onChangeChannel(ch);
                        setShowChannelDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer ${
                        channel === ch ? 'bg-red-50 text-red-700 font-bold' : ''
                      }`}
                    >
                      <span>{ch}</span>
                      {channel === ch && (
                        <span className="w-2 h-2 rounded-full bg-red-600" />
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Member / Customer Selector Pill */}
          <button
            onClick={() => {
              playClick();
              onEditCustomer();
            }}
            className="hidden sm:flex items-center gap-1.5 bg-black/15 hover:bg-black/25 text-white px-2.5 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all border border-white/10 cursor-pointer max-w-[150px] truncate"
            title="Ubah Pelanggan"
          >
            <Users className="w-3.5 h-3.5 text-white/80 flex-shrink-0" />
            <span className="truncate">Member : {customerName || 'CASH'}</span>
            <Edit2 className="w-3 h-3 text-white/70 flex-shrink-0" />
          </button>

          {/* Table Selector Pill (for Dine In) */}
          {channel === 'DINE IN' && (
            <button
              onClick={() => {
                playClick();
                onSelectTable();
              }}
              className="hidden md:flex items-center gap-1.5 bg-black/15 hover:bg-black/25 text-white px-2.5 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all border border-white/10 cursor-pointer"
            >
              <span>{tableNo ? tableNo : 'Pilih Meja'}</span>
            </button>
          )}
        </div>

        {/* Center / Search bar */}
        <div className="flex-1 max-w-xs md:max-w-md mx-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Cari menu / kode item..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-black/20 focus:bg-white focus:text-neutral-900 text-white placeholder-white/60 text-xs md:text-sm rounded-lg pl-8 pr-3 py-1.5 outline-none transition-all border border-white/15 focus:border-white shadow-inner"
            />
            <Search className="w-4 h-4 text-white/70 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-white/70 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Right Section: Branch, Staff, Cloud Sync, Actions */}
        <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
          {/* Branch Pill */}
          <button
            onClick={() => {
              playClick();
              onOpenBranchSelector();
            }}
            className="flex items-center gap-1.5 bg-black/20 hover:bg-black/30 text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-white/15 transition-all cursor-pointer"
            title="Ganti Cabang"
          >
            <Building2 className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden lg:inline">{activeBranch.name}</span>
            <span className="lg:hidden">{activeBranch.code}</span>
          </button>

          {/* Cloud Sync Status Button */}
          <button
            onClick={() => {
              playClick();
              onOpenCloudSync();
            }}
            className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
              cloudSync.isSyncing
                ? 'bg-amber-500/20 text-amber-200 border-amber-300/30 animate-pulse'
                : cloudSync.pendingSyncCount > 0
                ? 'bg-orange-500/20 text-orange-200 border-orange-300/30'
                : 'bg-black/15 text-white/90 border-white/10 hover:bg-black/25'
            }`}
            title="Status Sinkronisasi Cloud"
          >
            {cloudSync.isSyncing ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-300" />
            ) : cloudSync.pendingSyncCount > 0 ? (
              <Cloud className="w-3.5 h-3.5 text-orange-300" />
            ) : (
              <CloudCheck className="w-3.5 h-3.5 text-emerald-300" />
            )}
            <span className="hidden xl:inline">
              {cloudSync.isSyncing
                ? 'Sinkron...'
                : cloudSync.pendingSyncCount > 0
                ? `${cloudSync.pendingSyncCount} Antrean`
                : 'Cloud Aktif'}
            </span>
          </button>

          {/* Staff Login / Role Switch Button */}
          <button
            onClick={() => {
              playClick();
              onSwitchStaff();
            }}
            className="flex items-center gap-1.5 bg-black/20 hover:bg-black/30 text-white px-2 py-1 rounded-lg text-xs font-medium border border-white/10 transition-all cursor-pointer"
            title="Ganti Kasir / Karyawan"
          >
            <img
              src={currentStaff.avatar}
              alt={currentStaff.name}
              className="w-5 h-5 rounded-full object-cover ring-1 ring-white/30"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className="flex flex-col text-left leading-tight hidden sm:flex">
              <span className="text-[11px] font-bold max-w-[80px] truncate">
                {currentStaff.name}
              </span>
              <span className="text-[9px] text-white/70 uppercase">
                {currentStaff.role === 'admin'
                  ? 'Admin'
                  : currentStaff.role === 'branch_manager'
                  ? 'Manajer'
                  : currentStaff.role === 'supervisor'
                  ? 'Spv'
                  : 'Kasir'}
              </span>
            </div>
            <Lock className="w-3 h-3 text-white/60 ml-0.5" />
          </button>

          {/* More Options Menu */}
          <div className="relative">
            <button
              onClick={() => {
                playClick();
                setShowMoreMenu(!showMoreMenu);
              }}
              className="p-2 hover:bg-black/15 active:bg-black/25 rounded-lg transition-colors cursor-pointer"
            >
              <MoreVertical className="w-5 h-5 text-white" />
            </button>

            {showMoreMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowMoreMenu(false)}
                />
                <div className="absolute right-0 mt-1.5 w-56 bg-white text-neutral-800 rounded-xl shadow-2xl py-1.5 z-50 border border-neutral-100 text-xs font-medium animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1.5 border-b border-neutral-100 flex items-center justify-between">
                    <span className="font-bold text-neutral-600">Aksi Cepat</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-red-100 text-red-700 font-bold rounded">
                      POS v2.4
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      playClick();
                      onOpenHeldOrders();
                      setShowMoreMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-neutral-50 flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-600" />
                      Antrean Pesanan Tersimpan
                    </span>
                    {heldOrdersCount > 0 && (
                      <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                        {heldOrdersCount}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      playClick();
                      onNavigateView('reports');
                      setShowMoreMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-neutral-50 flex items-center gap-2 cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-blue-600" />
                    Laporan Penjualan Hari Ini
                  </button>

                  <button
                    onClick={() => {
                      playClick();
                      onNavigateView('inventory');
                      setShowMoreMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-neutral-50 flex items-center gap-2 cursor-pointer"
                  >
                    <Store className="w-4 h-4 text-emerald-600" />
                    Cek Stok & Inventaris
                  </button>

                  <button
                    onClick={() => {
                      playClick();
                      onNavigateView('analytics');
                      setShowMoreMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-neutral-50 flex items-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    Dashboard Analitik Toko
                  </button>

                  <div className="my-1 border-t border-neutral-100" />

                  <button
                    onClick={() => {
                      playClick();
                      onSwitchStaff();
                      setShowMoreMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-neutral-50 text-red-600 flex items-center gap-2 cursor-pointer font-semibold"
                  >
                    <Lock className="w-4 h-4 text-red-600" />
                    Kunci Layar / Ganti Pengguna
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
