import React, { useState } from 'react';
import { Branch } from '../types/pos';
import { playClick } from '../utils/audio';
import { Building2, MapPin, Phone, Check, Plus, X } from 'lucide-react';

interface BranchSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  branches: Branch[];
  activeBranch: Branch;
  onSelectBranch: (branch: Branch) => void;
  onAddBranch?: (branch: Branch) => void;
}

export const BranchSelectorModal: React.FC<BranchSelectorModalProps> = ({
  isOpen,
  onClose,
  branches,
  activeBranch,
  onSelectBranch,
  onAddBranch,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');
  const [newBranchCode, setNewBranchCode] = useState('');
  const [newBranchCity, setNewBranchCity] = useState('');
  const [newBranchAddress, setNewBranchAddress] = useState('');
  const [newBranchPhone, setNewBranchPhone] = useState('');

  if (!isOpen) return null;

  const handleCreateBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranchName || !newBranchCode || !onAddBranch) return;

    const newBranch: Branch = {
      id: `b${Date.now()}`,
      name: newBranchName,
      code: newBranchCode.toUpperCase(),
      city: newBranchCity || 'Indonesia',
      address: newBranchAddress || 'Alamat Cabang Baru',
      phone: newBranchPhone || '021-000000',
    };

    onAddBranch(newBranch);
    onSelectBranch(newBranch);
    setShowAddForm(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-neutral-100 flex flex-col animate-in zoom-in-95">
        {/* Header */}
        <div className="bg-[#b31412] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-300" />
            <h3 className="font-bold text-base">Operasional Multi-Cabang</h3>
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

        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          <p className="text-xs text-neutral-500">
            Pilih cabang aktif. Seluruh data transaksi, stok inventaris, dan cetak struk akan disesuaikan secara otomatis.
          </p>

          {!showAddForm ? (
            <div className="space-y-2.5">
              {branches.map((b) => {
                const isActive = activeBranch.id === b.id;
                return (
                  <div
                    key={b.id}
                    onClick={() => {
                      playClick();
                      onSelectBranch(b);
                      onClose();
                    }}
                    className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-start justify-between ${
                      isActive
                        ? 'border-[#b31412] bg-red-50/50 shadow-sm'
                        : 'border-neutral-200 hover:border-neutral-300 bg-white hover:bg-neutral-50'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-neutral-900">
                          {b.name}
                        </span>
                        <span className="bg-neutral-100 text-neutral-600 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                          {b.code}
                        </span>
                        {b.isMain && (
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.2 rounded">
                            Kantor Pusat
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                        <MapPin className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                        <span>{b.address}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-mono">
                        <Phone className="w-3.5 h-3.5" />
                        <span>{b.phone}</span>
                      </div>
                    </div>

                    {isActive && (
                      <div className="w-6 h-6 rounded-full bg-[#b31412] text-white flex items-center justify-center flex-shrink-0 mt-1">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                );
              })}

              {onAddBranch && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="w-full py-3 rounded-2xl border-2 border-dashed border-neutral-300 hover:border-[#b31412] text-neutral-600 hover:text-[#b31412] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Cabang Baru</span>
                </button>
              )}
            </div>
          ) : (
            <form onSubmit={handleCreateBranch} className="space-y-3">
              <h4 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                Formulir Cabang Baru
              </h4>

              <div>
                <label className="text-xs font-semibold text-neutral-600 block mb-1">
                  Nama Cabang:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Cabang Yogyakarta (Malioboro)"
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                  className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs focus:border-[#b31412] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-neutral-600 block mb-1">
                    Kode Cabang (Singkat):
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="YOG01"
                    value={newBranchCode}
                    onChange={(e) => setNewBranchCode(e.target.value)}
                    className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs font-mono uppercase focus:border-[#b31412] outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-600 block mb-1">
                    Kota:
                  </label>
                  <input
                    type="text"
                    placeholder="Yogyakarta"
                    value={newBranchCity}
                    onChange={(e) => setNewBranchCity(e.target.value)}
                    className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs focus:border-[#b31412] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-600 block mb-1">
                  Alamat Lengkap:
                </label>
                <input
                  type="text"
                  placeholder="Jl. Malioboro No. 12"
                  value={newBranchAddress}
                  onChange={(e) => setNewBranchAddress(e.target.value)}
                  className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs focus:border-[#b31412] outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-600 block mb-1">
                  No. Telepon:
                </label>
                <input
                  type="text"
                  placeholder="0274-551234"
                  value={newBranchPhone}
                  onChange={(e) => setNewBranchPhone(e.target.value)}
                  className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs focus:border-[#b31412] outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 py-2.5 bg-neutral-100 text-neutral-700 font-bold rounded-xl text-xs hover:bg-neutral-200 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#b31412] text-white font-bold rounded-xl text-xs hover:bg-[#9a100e] cursor-pointer"
                >
                  Simpan Cabang
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
