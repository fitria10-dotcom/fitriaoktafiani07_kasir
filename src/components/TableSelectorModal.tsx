import React, { useState } from 'react';
import { playClick } from '../utils/audio';
import { Users, X, Check } from 'lucide-react';

interface TableSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTable: string;
  onSelectTable: (table: string) => void;
}

export const TableSelectorModal: React.FC<TableSelectorModalProps> = ({
  isOpen,
  onClose,
  currentTable,
  onSelectTable,
}) => {
  const [customTable, setCustomTable] = useState('');

  if (!isOpen) return null;

  const defaultTables = [
    'Meja 01', 'Meja 02', 'Meja 03', 'Meja 04',
    'Meja 05', 'Meja 06', 'Meja 07', 'Meja 08',
    'Meja 09', 'Meja 10', 'VIP Room 1', 'VIP Room 2',
    'Outdoor 01', 'Outdoor 02', 'Bar Counter', 'Lesehan A',
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-neutral-100 flex flex-col animate-in zoom-in-95">
        <div className="bg-[#b31412] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-300" />
            <h3 className="font-bold text-base">Pilih Nomor Meja (Dine In)</h3>
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
          <div className="grid grid-cols-4 gap-2.5">
            {defaultTables.map((tbl) => (
              <button
                key={tbl}
                onClick={() => {
                  playClick();
                  onSelectTable(tbl);
                  onClose();
                }}
                className={`py-3 px-2 rounded-xl text-xs font-bold transition-all text-center border cursor-pointer ${
                  currentTable === tbl
                    ? 'bg-[#b31412] text-white border-[#b31412] shadow'
                    : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-800 border-neutral-200'
                }`}
              >
                {tbl}
              </button>
            ))}
          </div>

          <div className="border-t border-neutral-200 pt-3">
            <label className="text-xs font-semibold text-neutral-600 block mb-1">
              Atau Masukkan Nomor Meja Custom:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Contoh: Meja 15"
                value={customTable}
                onChange={(e) => setCustomTable(e.target.value)}
                className="flex-1 p-2 border border-neutral-300 rounded-xl text-xs focus:border-[#b31412] outline-none"
              />
              <button
                onClick={() => {
                  if (customTable.trim()) {
                    playClick();
                    onSelectTable(customTable.trim());
                    onClose();
                  }
                }}
                className="px-4 py-2 bg-[#b31412] text-white rounded-xl text-xs font-bold hover:bg-[#9a100e] cursor-pointer"
              >
                Pilih
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
