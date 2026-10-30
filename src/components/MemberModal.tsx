import React, { useState } from 'react';
import { playClick } from '../utils/audio';
import { Users, X, Check, Star } from 'lucide-react';

interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCustomer: string;
  onSaveCustomer: (name: string) => void;
}

export const MemberModal: React.FC<MemberModalProps> = ({
  isOpen,
  onClose,
  currentCustomer,
  onSaveCustomer,
}) => {
  const [name, setName] = useState(currentCustomer);

  if (!isOpen) return null;

  const quickMembers = [
    { name: 'CASH', type: 'Pelanggan Umum' },
    { name: 'Bpk. Hendra Gunawan', type: 'VIP Member (Gold)' },
    { name: 'Ibu Ratna Sari', type: 'Member Reguler' },
    { name: 'Sdr. Kevin Anggara', type: 'Member Reguler' },
    { name: 'Pak RT 04 Bambang', type: 'Tetangga / Langganan' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden border border-neutral-100 flex flex-col animate-in zoom-in-95">
        <div className="bg-[#b31412] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-300" />
            <h3 className="font-bold text-base">Identitas Pelanggan / Member</h3>
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

        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-bold text-neutral-600 block mb-1">
              Nama Pelanggan di Struk:
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: CASH atau Bpk. Rudi"
              className="w-full p-2.5 border border-neutral-300 rounded-xl text-sm font-semibold focus:border-[#b31412] outline-none"
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block mb-2">
              Pilihan Cepat / Member Terdaftar:
            </label>
            <div className="space-y-1.5">
              {quickMembers.map((m) => (
                <button
                  key={m.name}
                  onClick={() => {
                    playClick();
                    onSaveCustomer(m.name);
                    onClose();
                  }}
                  className={`w-full text-left p-2.5 rounded-xl border flex items-center justify-between text-xs transition-colors cursor-pointer ${
                    name === m.name
                      ? 'bg-red-50 border-red-300 text-red-800 font-bold'
                      : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border-neutral-200'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="font-bold">{m.name}</span>
                    <span className="text-[10px] text-neutral-400">{m.type}</span>
                  </div>
                  {name === m.name && <Check className="w-4 h-4 text-red-600" />}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => {
                playClick();
                onClose();
              }}
              className="flex-1 py-2.5 bg-neutral-100 text-neutral-700 font-bold rounded-xl text-xs hover:bg-neutral-200 cursor-pointer"
            >
              Batal
            </button>
            <button
              onClick={() => {
                playClick();
                onSaveCustomer(name.trim() || 'CASH');
                onClose();
              }}
              className="flex-1 py-2.5 bg-[#b31412] text-white font-bold rounded-xl text-xs hover:bg-[#9a100e] cursor-pointer"
            >
              Simpan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
