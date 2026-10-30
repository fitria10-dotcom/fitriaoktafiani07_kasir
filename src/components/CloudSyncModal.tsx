import React, { useState } from 'react';
import { CloudSyncState, Product, Transaction, Branch } from '../types/pos';
import { formatDateIndo } from '../utils/formatters';
import { playClick, playSuccess } from '../utils/audio';
import {
  Cloud,
  CloudCheck,
  RefreshCw,
  Download,
  Upload,
  Server,
  ShieldCheck,
  CheckCircle2,
  Clock,
  X,
  Database,
} from 'lucide-react';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  cloudSync: CloudSyncState;
  onTriggerSync: () => void;
  onToggleAutoSync: () => void;
  products: Product[];
  transactions: Transaction[];
  branches: Branch[];
  onImportData: (imported: { products?: Product[]; transactions?: Transaction[]; branches?: Branch[] }) => void;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({
  isOpen,
  onClose,
  cloudSync,
  onTriggerSync,
  onToggleAutoSync,
  products,
  transactions,
  branches,
  onImportData,
}) => {
  const [importNotice, setImportNotice] = useState('');

  if (!isOpen) return null;

  const handleExportJSON = () => {
    playClick();
    const dataToExport = {
      app: 'KasirPro POS',
      version: '2.4.0',
      exportedAt: new Date().toISOString(),
      branches,
      products,
      transactions,
    };
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kasirpro-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    playSuccess();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        onImportData(json);
        setImportNotice('Data backup cloud berhasil dipulihkan!');
        playSuccess();
        setTimeout(() => setImportNotice(''), 3000);
      } catch {
        setImportNotice('Format file JSON tidak valid!');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden border border-neutral-100 flex flex-col max-h-[88vh] animate-in zoom-in-95">
        {/* Header */}
        <div className="bg-[#b31412] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-amber-300" />
            <h3 className="font-bold text-base">Sinkronisasi Cloud & Cadangan Data</h3>
          </div>
          <button
            onClick={() => {
              playClick();
              onClose();
            }}
            className="text-white/80 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Status Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-neutral-900 to-neutral-800 text-white flex items-center justify-between shadow-md">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-bold text-sm">Cloud Server: Terhubung</span>
              </div>
              <p className="text-xs text-neutral-300">
                Region: Google Cloud (asia-east1 / Jakarta)
              </p>
              <p className="text-[11px] text-neutral-400">
                Terakhir Sinkron: {cloudSync.lastSyncedAt ? formatDateIndo(cloudSync.lastSyncedAt) : 'Baru saja'}
              </p>
            </div>

            <button
              onClick={() => {
                playClick();
                onTriggerSync();
              }}
              disabled={cloudSync.isSyncing}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${cloudSync.isSyncing ? 'animate-spin' : ''}`} />
              <span>{cloudSync.isSyncing ? 'Menyinkronkan...' : 'Sinkron Sekarang'}</span>
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-center">
              <span className="text-[10px] text-neutral-500 uppercase font-bold block">
                Total Produk
              </span>
              <span className="text-lg font-black text-neutral-800 font-mono">
                {products.length}
              </span>
            </div>
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-center">
              <span className="text-[10px] text-neutral-500 uppercase font-bold block">
                Total Transaksi
              </span>
              <span className="text-lg font-black text-neutral-800 font-mono">
                {transactions.length}
              </span>
            </div>
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-center">
              <span className="text-[10px] text-neutral-500 uppercase font-bold block">
                Status Antrean
              </span>
              <span className="text-lg font-black text-emerald-600 font-mono">
                {cloudSync.pendingSyncCount === 0 ? '0 Antrean' : `${cloudSync.pendingSyncCount} Tertunda`}
              </span>
            </div>
          </div>

          {/* Auto-Sync Toggle */}
          <div className="flex items-center justify-between p-3.5 bg-neutral-50 rounded-xl border border-neutral-200">
            <div>
              <span className="text-xs font-bold text-neutral-800 block">
                Otomatis Sinkronisasi Real-Time
              </span>
              <span className="text-[11px] text-neutral-500">
                Data pesanan dan perubahan stok langsung terdistribusi ke semua tablet cabang.
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={cloudSync.autoSync}
                onChange={onToggleAutoSync}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-neutral-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#b31412]"></div>
            </label>
          </div>

          {/* Backup & Restore Data */}
          <div>
            <h4 className="text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
              Cadangan & Pemulihan Data Offline/Cloud
            </h4>
            <div className="flex gap-2">
              <button
                onClick={handleExportJSON}
                className="flex-1 py-2.5 px-3 bg-white hover:bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-bold text-neutral-700 flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-neutral-600" />
                <span>Unduh Cadangan (JSON)</span>
              </button>

              <label className="flex-1 py-2.5 px-3 bg-white hover:bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-bold text-neutral-700 flex items-center justify-center gap-2 transition-colors cursor-pointer">
                <Upload className="w-4 h-4 text-neutral-600" />
                <span>Pulihkan Cadangan</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
            {importNotice && (
              <p className="text-xs font-bold text-emerald-600 mt-1.5 text-center">
                {importNotice}
              </p>
            )}
          </div>

          {/* Sync Activity Logs */}
          <div>
            <h4 className="text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-neutral-500" />
              <span>Log Riwayat Sinkronisasi</span>
            </h4>
            <div className="bg-neutral-900 rounded-xl p-3 font-mono text-[11px] text-neutral-300 space-y-1.5 max-h-36 overflow-y-auto">
              {cloudSync.logs.map((log) => (
                <div key={log.id} className="flex items-start gap-2">
                  <span className="text-neutral-500 text-[10px] flex-shrink-0">
                    [{log.time}]
                  </span>
                  <span
                    className={
                      log.type === 'success'
                        ? 'text-emerald-400'
                        : log.type === 'error'
                        ? 'text-red-400'
                        : 'text-neutral-300'
                    }
                  >
                    {log.message}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
