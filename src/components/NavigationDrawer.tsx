import React from 'react';
import { Branch, StaffUser } from '../types/pos';
import { playClick } from '../utils/audio';
import {
  Store,
  Package,
  FileText,
  BarChart3,
  Clock,
  Cloud,
  Building2,
  Lock,
  X,
  Sparkles,
  ChevronRight,
  Shield,
} from 'lucide-react';

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: 'pos' | 'inventory' | 'reports' | 'analytics';
  onNavigate: (view: 'pos' | 'inventory' | 'reports' | 'analytics') => void;
  onOpenHeldOrders: () => void;
  heldOrdersCount: number;
  onOpenCloudSync: () => void;
  onOpenBranchSelector: () => void;
  activeBranch: Branch;
  currentStaff: StaffUser;
  onSwitchStaff: () => void;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  isOpen,
  onClose,
  currentView,
  onNavigate,
  onOpenHeldOrders,
  heldOrdersCount,
  onOpenCloudSync,
  onOpenBranchSelector,
  activeBranch,
  currentStaff,
  onSwitchStaff,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={() => {
          playClick();
          onClose();
        }}
      />

      {/* Drawer Sidebar */}
      <div className="relative w-72 md:w-80 bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
        {/* Brand Header */}
        <div className="bg-[#b31412] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center font-black text-lg border border-white/20 shadow-inner">
              KP
            </div>
            <div>
              <h2 className="font-black text-base tracking-tight leading-tight">
                KasirPro POS
              </h2>
              <span className="text-[11px] text-red-200">
                Sistem Kasir & Multi-Cabang
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              playClick();
              onClose();
            }}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Staff & Branch Info */}
        <div className="p-4 bg-neutral-50 border-b border-neutral-200">
          <div className="flex items-center gap-3">
            <img
              src={currentStaff.avatar}
              alt={currentStaff.name}
              className="w-11 h-11 rounded-full object-cover ring-2 ring-red-600/30"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className="min-w-0 flex-1">
              <span className="font-bold text-neutral-800 text-sm block truncate">
                {currentStaff.name}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] bg-red-100 text-[#b31412] font-bold px-2 py-0.5 rounded-full uppercase">
                  {currentStaff.roleLabel}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-neutral-200 flex items-center justify-between text-xs text-neutral-600">
            <span className="flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-neutral-400" />
              <span className="font-bold text-neutral-700">{activeBranch.name}</span>
            </span>
            <button
              onClick={() => {
                playClick();
                onOpenBranchSelector();
                onClose();
              }}
              className="text-[#b31412] font-bold hover:underline"
            >
              Ubah
            </button>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
            Menu Operasional
          </div>

          <button
            onClick={() => {
              playClick();
              onNavigate('pos');
              onClose();
            }}
            className={`w-full p-3 rounded-2xl flex items-center justify-between transition-colors cursor-pointer ${
              currentView === 'pos'
                ? 'bg-red-50 text-[#b31412] font-bold'
                : 'text-neutral-700 hover:bg-neutral-100 font-medium'
            }`}
          >
            <div className="flex items-center gap-3">
              <Store className="w-5 h-5 text-red-600" />
              <span>Kasir POS (Layar Jual)</span>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-400" />
          </button>

          <button
            onClick={() => {
              playClick();
              onOpenHeldOrders();
              onClose();
            }}
            className="w-full p-3 rounded-2xl flex items-center justify-between text-neutral-700 hover:bg-neutral-100 font-medium transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-amber-500" />
              <span>Antrean Pesanan Tersimpan</span>
            </div>
            {heldOrdersCount > 0 ? (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white">
                {heldOrdersCount}
              </span>
            ) : (
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            )}
          </button>

          <button
            onClick={() => {
              playClick();
              onNavigate('inventory');
              onClose();
            }}
            className={`w-full p-3 rounded-2xl flex items-center justify-between transition-colors cursor-pointer ${
              currentView === 'inventory'
                ? 'bg-red-50 text-[#b31412] font-bold'
                : 'text-neutral-700 hover:bg-neutral-100 font-medium'
            }`}
          >
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5 text-emerald-600" />
              <span>Manajemen Inventaris & Stok</span>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-400" />
          </button>

          <button
            onClick={() => {
              playClick();
              onNavigate('reports');
              onClose();
            }}
            className={`w-full p-3 rounded-2xl flex items-center justify-between transition-colors cursor-pointer ${
              currentView === 'reports'
                ? 'bg-red-50 text-[#b31412] font-bold'
                : 'text-neutral-700 hover:bg-neutral-100 font-medium'
            }`}
          >
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-blue-600" />
              <span>Laporan Penjualan Real-Time</span>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-400" />
          </button>

          <button
            onClick={() => {
              playClick();
              onNavigate('analytics');
              onClose();
            }}
            className={`w-full p-3 rounded-2xl flex items-center justify-between transition-colors cursor-pointer ${
              currentView === 'analytics'
                ? 'bg-red-50 text-[#b31412] font-bold'
                : 'text-neutral-700 hover:bg-neutral-100 font-medium'
            }`}
          >
            <div className="flex items-center gap-3">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              <span>Dashboard Analitik Toko</span>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-400" />
          </button>

          <div className="my-2 border-t border-neutral-100" />

          <div className="px-3 py-1.5 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
            Sistem & Cloud
          </div>

          <button
            onClick={() => {
              playClick();
              onOpenCloudSync();
              onClose();
            }}
            className="w-full p-3 rounded-2xl flex items-center justify-between text-neutral-700 hover:bg-neutral-100 font-medium transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Cloud className="w-5 h-5 text-cyan-600" />
              <span>Sinkronisasi Cloud & Cadangan</span>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-400" />
          </button>

          <button
            onClick={() => {
              playClick();
              onOpenBranchSelector();
              onClose();
            }}
            className="w-full p-3 rounded-2xl flex items-center justify-between text-neutral-700 hover:bg-neutral-100 font-medium transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Building2 className="w-5 h-5 text-amber-600" />
              <span>Pengaturan Multi-Cabang</span>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-400" />
          </button>
        </div>

        {/* Bottom Lock / Switch Staff */}
        <div className="p-3 bg-neutral-50 border-t border-neutral-200">
          <button
            onClick={() => {
              playClick();
              onSwitchStaff();
              onClose();
            }}
            className="w-full py-2.5 px-3 bg-white hover:bg-red-50 text-red-600 border border-neutral-200 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
          >
            <Lock className="w-4 h-4" />
            <span>Kunci Layar / Ganti Pengguna</span>
          </button>
        </div>
      </div>
    </div>
  );
};
