import React, { useState, useEffect } from 'react';
import { Branch, PaymentMethod, Transaction } from '../types/pos';
import { formatRupiah, formatRupiahComma, generateQrisReference, generateRrn } from '../utils/formatters';
import { playSuccess, playClick, playError } from '../utils/audio';
import confetti from 'canvas-confetti';
import {
  QrCode,
  Banknote,
  CreditCard,
  Building,
  CheckCircle2,
  Printer,
  Clock,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  X,
} from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  activeBranch: Branch;
  onConfirmPayment: (
    method: PaymentMethod,
    cashPaid?: number,
    change?: number,
    qrisRef?: string,
    qrisRrn?: string,
    autoPrintReceipt?: boolean
  ) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  totalAmount,
  activeBranch,
  onConfirmPayment,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('QRIS');
  const [cashAmount, setCashAmount] = useState<number>(totalAmount);
  const [qrisRef, setQrisRef] = useState<string>('');
  const [qrisRrn, setQrisRrn] = useState<string>('');
  const [qrisSecondsLeft, setQrisSecondsLeft] = useState<number>(900); // 15 mins
  const [isSimulatingQris, setIsSimulatingQris] = useState<boolean>(false);
  const [autoPrintReceipt, setAutoPrintReceipt] = useState<boolean>(true);
  const [edcBank, setEdcBank] = useState<string>('BCA');
  const [approvalCode, setApprovalCode] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setQrisRef(generateQrisReference());
      setQrisRrn(generateRrn());
      setQrisSecondsLeft(900);
      setCashAmount(totalAmount);
      setIsSimulatingQris(false);
    }
  }, [isOpen, totalAmount]);

  // Countdown timer for QRIS
  useEffect(() => {
    if (!isOpen || selectedMethod !== 'QRIS') return;
    const interval = setInterval(() => {
      setQrisSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, selectedMethod]);

  if (!isOpen) return null;

  const changeAmount = Math.max(0, cashAmount - totalAmount);
  const isCashSufficient = cashAmount >= totalAmount;

  // Quick cash options
  const quickCashOptions = [
    { label: 'Uang Pas', value: totalAmount },
    { label: 'Rp 20.000', value: 20000 },
    { label: 'Rp 50.000', value: 50000 },
    { label: 'Rp 100.000', value: 100000 },
    { label: 'Rp 150.000', value: 150000 },
    { label: 'Rp 200.000', value: 200000 },
  ].filter((opt) => opt.value >= totalAmount || opt.label === 'Uang Pas');

  const handleCompletePayment = (method: PaymentMethod) => {
    playSuccess();
    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch {
      // ignore
    }

    if (method === 'TUNAI') {
      onConfirmPayment(
        'TUNAI',
        cashAmount,
        changeAmount,
        undefined,
        undefined,
        autoPrintReceipt
      );
    } else if (method === 'QRIS') {
      onConfirmPayment(
        'QRIS',
        totalAmount,
        0,
        qrisRef,
        qrisRrn,
        autoPrintReceipt
      );
    } else {
      onConfirmPayment(
        method,
        totalAmount,
        0,
        undefined,
        undefined,
        autoPrintReceipt
      );
    }
  };

  const simulateCustomerQrisPay = () => {
    setIsSimulatingQris(true);
    setTimeout(() => {
      handleCompletePayment('QRIS');
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-neutral-100 flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#b31412] text-white px-6 py-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-red-200 uppercase tracking-widest">
              Pembayaran Transaksi
            </span>
            <h2 className="text-xl md:text-2xl font-black font-mono">
              {formatRupiah(totalAmount)}
            </h2>
          </div>
          <button
            onClick={() => {
              playClick();
              onClose();
            }}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Payment Methods Bar */}
        <div className="grid grid-cols-4 gap-1 p-2 bg-neutral-100 border-b border-neutral-200">
          <button
            onClick={() => {
              playClick();
              setSelectedMethod('QRIS');
            }}
            className={`flex flex-col items-center justify-center py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedMethod === 'QRIS'
                ? 'bg-[#b31412] text-white shadow'
                : 'bg-white text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            <QrCode className="w-4 h-4 mb-1" />
            <span>QRIS Dinamis</span>
          </button>

          <button
            onClick={() => {
              playClick();
              setSelectedMethod('TUNAI');
            }}
            className={`flex flex-col items-center justify-center py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedMethod === 'TUNAI'
                ? 'bg-[#b31412] text-white shadow'
                : 'bg-white text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            <Banknote className="w-4 h-4 mb-1" />
            <span>Tunai (Cash)</span>
          </button>

          <button
            onClick={() => {
              playClick();
              setSelectedMethod('DEBIT');
            }}
            className={`flex flex-col items-center justify-center py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedMethod === 'DEBIT' || selectedMethod === 'KREDIT'
                ? 'bg-[#b31412] text-white shadow'
                : 'bg-white text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            <CreditCard className="w-4 h-4 mb-1" />
            <span>Kartu EDC</span>
          </button>

          <button
            onClick={() => {
              playClick();
              setSelectedMethod('TRANSFER');
            }}
            className={`flex flex-col items-center justify-center py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedMethod === 'TRANSFER'
                ? 'bg-[#b31412] text-white shadow'
                : 'bg-white text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            <Building className="w-4 h-4 mb-1" />
            <span>Transfer Bank</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* --- METHOD: QRIS DINAMIS --- */}
          {selectedMethod === 'QRIS' && (
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* QR Code Card (Authentic Indonesian QRIS styling) */}
              <div className="bg-white border-2 border-neutral-300 rounded-2xl p-4 shadow-md flex flex-col items-center w-64 flex-shrink-0">
                {/* Official QRIS Header */}
                <div className="w-full flex items-center justify-between pb-2 border-b border-neutral-200 mb-2">
                  <div className="flex items-center gap-1">
                    <span className="font-extrabold text-red-600 text-sm tracking-tighter">
                      QRIS
                    </span>
                    <span className="text-[9px] bg-red-600 text-white font-bold px-1 rounded">
                      GPN
                    </span>
                  </div>
                  <span className="text-[10px] text-neutral-400 font-semibold">
                    STANDAR NASIONAL
                  </span>
                </div>

                <div className="text-center mb-2">
                  <p className="text-xs font-extrabold text-neutral-800 uppercase tracking-tight">
                    KASIRPRO - {activeBranch.name.toUpperCase()}
                  </p>
                  <p className="text-[10px] text-neutral-500 font-mono">
                    NMID: ID102008392183
                  </p>
                </div>

                {/* Dynamic QR SVG */}
                <div className="w-44 h-44 bg-neutral-900 rounded-xl p-2.5 flex items-center justify-center relative overflow-hidden group">
                  <svg
                    viewBox="0 0 100 100"
                    className="w-full h-full fill-white"
                  >
                    {/* QR Finder Corners */}
                    <rect x="0" y="0" width="28" height="28" rx="4" />
                    <rect x="4" y="4" width="20" height="20" rx="2" fill="#171717" />
                    <rect x="8" y="8" width="12" height="12" rx="1" fill="#fff" />

                    <rect x="72" y="0" width="28" height="28" rx="4" />
                    <rect x="76" y="4" width="20" height="20" rx="2" fill="#171717" />
                    <rect x="80" y="8" width="12" height="12" rx="1" fill="#fff" />

                    <rect x="0" y="72" width="28" height="28" rx="4" />
                    <rect x="4" y="76" width="20" height="20" rx="2" fill="#171717" />
                    <rect x="8" y="80" width="12" height="12" rx="1" fill="#fff" />

                    {/* QR Data Pattern Dots */}
                    <circle cx="36" cy="12" r="3" />
                    <circle cx="48" cy="12" r="3" />
                    <circle cx="60" cy="12" r="3" />
                    <circle cx="36" cy="24" r="3" />
                    <circle cx="54" cy="24" r="3" />
                    <circle cx="12" cy="38" r="3" />
                    <circle cx="24" cy="40" r="3" />
                    <circle cx="38" cy="38" r="3" />
                    <circle cx="50" cy="42" r="3" />
                    <circle cx="62" cy="38" r="3" />
                    <circle cx="76" cy="42" r="3" />
                    <circle cx="88" cy="38" r="3" />
                    <circle cx="14" cy="54" r="3" />
                    <circle cx="28" cy="54" r="3" />
                    <circle cx="42" cy="54" r="3" />
                    <circle cx="70" cy="54" r="3" />
                    <circle cx="86" cy="54" r="3" />
                    <circle cx="38" cy="70" r="3" />
                    <circle cx="52" cy="70" r="3" />
                    <circle cx="64" cy="70" r="3" />
                    <circle cx="80" cy="74" r="3" />
                    <circle cx="40" cy="86" r="3" />
                    <circle cx="56" cy="88" r="3" />
                    <circle cx="68" cy="86" r="3" />
                    <circle cx="84" cy="88" r="3" />
                  </svg>

                  {/* Center QRIS logo badge */}
                  <div className="absolute inset-0 m-auto w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center border-2 border-red-600">
                    <span className="text-[10px] font-black text-red-600 tracking-tighter">
                      QRIS
                    </span>
                  </div>
                </div>

                <div className="mt-3 text-center w-full">
                  <div className="text-xs font-bold text-neutral-800 font-mono">
                    {formatRupiah(totalAmount)}
                  </div>
                  <div className="flex items-center justify-center gap-1 text-[11px] text-amber-600 font-semibold mt-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      Berlaku: {Math.floor(qrisSecondsLeft / 60)}:
                      {(qrisSecondsLeft % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                </div>
              </div>

              {/* QRIS Instructions & Action */}
              <div className="flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-emerald-800 text-xs">
                    <div className="flex items-center gap-2 font-bold mb-1">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      QRIS Dinamis Siap Dipindai
                    </div>
                    <p className="text-emerald-700 text-[11px]">
                      Mendukung BCA, Mandiri Livin, BRImo, BNI, GoPay, OVO, Dana, ShopeePay, LinkAja, dsb.
                    </p>
                  </div>

                  <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-200 text-xs space-y-1.5 font-mono">
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Ref Transaksi:</span>
                      <span className="font-bold text-neutral-800">{qrisRef}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">RRN:</span>
                      <span className="font-bold text-neutral-800">{qrisRrn}</span>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-500">
                    Arahkan layar ini ke pelanggan atau tunggu konfirmasi notifikasi otomatis dari gateway pembayaran.
                  </p>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    onClick={simulateCustomerQrisPay}
                    disabled={isSimulatingQris}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSimulatingQris ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Menerima Notifikasi Pembayaran...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Simulasi Pelanggan Scan & Bayar</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleCompletePayment('QRIS')}
                    className="w-full py-2.5 bg-[#b31412] hover:bg-[#9a100e] text-white rounded-xl font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Konfirmasi Manual (Sudah Masuk)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* --- METHOD: TUNAI (CASH) --- */}
          {selectedMethod === 'TUNAI' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Total & Input */}
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block mb-1">
                      Total Tagihan
                    </label>
                    <div className="text-2xl font-black text-neutral-900 font-mono">
                      {formatRupiah(totalAmount)}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-neutral-700 block mb-1">
                      Uang Diterima dari Pelanggan (Rp):
                    </label>
                    <input
                      type="number"
                      value={cashAmount || ''}
                      onChange={(e) => setCashAmount(Number(e.target.value) || 0)}
                      className="w-full p-3 text-xl font-bold font-mono border-2 border-neutral-300 focus:border-[#b31412] rounded-xl outline-none"
                      placeholder="0"
                    />
                  </div>

                  {/* Kembalian Box */}
                  <div
                    className={`p-3.5 rounded-xl border ${
                      isCashSufficient
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : 'bg-red-50 border-red-200 text-red-900'
                    }`}
                  >
                    <div className="text-xs font-semibold">
                      {isCashSufficient ? 'Kembalian' : 'Uang Kurang'}
                    </div>
                    <div className="text-2xl font-black font-mono mt-0.5">
                      {isCashSufficient
                        ? formatRupiah(changeAmount)
                        : formatRupiah(totalAmount - cashAmount)}
                    </div>
                  </div>
                </div>

                {/* Quick Cash Chips */}
                <div>
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block mb-2">
                    Pilihan Cepat Nominal Uang
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {quickCashOptions.map((opt) => (
                      <button
                        key={opt.label}
                        onClick={() => {
                          playClick();
                          setCashAmount(opt.value);
                        }}
                        className={`py-3 px-3 rounded-xl border font-bold text-xs md:text-sm transition-all cursor-pointer ${
                          cashAmount === opt.value
                            ? 'bg-[#b31412] text-white border-[#b31412] shadow'
                            : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border-neutral-200'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleCompletePayment('TUNAI')}
                disabled={!isCashSufficient}
                className="w-full py-3.5 bg-[#b31412] hover:bg-[#9a100e] text-white rounded-xl font-extrabold text-base tracking-wide uppercase transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Selesaikan Transaksi & Cetak Struk</span>
              </button>
            </div>
          )}

          {/* --- METHOD: DEBIT / KREDIT --- */}
          {(selectedMethod === 'DEBIT' || selectedMethod === 'KREDIT') && (
            <div className="space-y-4 max-w-md mx-auto">
              <div>
                <label className="text-xs font-bold text-neutral-600 block mb-1.5">
                  Pilih Mesin EDC:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['BCA', 'Mandiri', 'BRI', 'BNI'].map((bank) => (
                    <button
                      key={bank}
                      onClick={() => setEdcBank(bank)}
                      className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        edcBank === bank
                          ? 'bg-blue-600 text-white border-blue-600 shadow'
                          : 'bg-neutral-50 text-neutral-700 border-neutral-200'
                      }`}
                    >
                      EDC {bank}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-600 block mb-1">
                  Nomor Approval Code / No. Kartu (Opsional):
                </label>
                <input
                  type="text"
                  placeholder="Contoh: APPR-882910"
                  value={approvalCode}
                  onChange={(e) => setApprovalCode(e.target.value)}
                  className="w-full p-2.5 border border-neutral-300 rounded-xl text-sm font-mono focus:border-red-600 outline-none"
                />
              </div>

              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs text-neutral-600">
                Pastikan kartu nasabah sudah di-dip / swipe di mesin EDC dan transaksi dinyatakan SUKSES.
              </div>

              <button
                onClick={() => handleCompletePayment(selectedMethod)}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-extrabold text-sm uppercase tracking-wide transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Konfirmasi Pembayaran Kartu</span>
              </button>
            </div>
          )}

          {/* --- METHOD: TRANSFER BANK --- */}
          {selectedMethod === 'TRANSFER' && (
            <div className="space-y-4 max-w-md mx-auto">
              <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-2">
                <div className="text-xs font-bold text-neutral-500 uppercase">
                  Rekening Penerimaan KasirPro
                </div>
                <div className="flex justify-between items-center text-sm font-bold text-neutral-800">
                  <span>Bank Central Asia (BCA)</span>
                  <span className="font-mono text-red-700">827-092-1829</span>
                </div>
                <div className="text-xs text-neutral-500">
                  a.n. PT KASIRPRO INDONESIA JAYA
                </div>
              </div>

              <button
                onClick={() => handleCompletePayment('TRANSFER')}
                className="w-full py-3.5 bg-[#b31412] hover:bg-[#9a100e] text-white rounded-xl font-extrabold text-sm uppercase tracking-wide transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Konfirmasi Bukti Transfer Diterima</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer (Auto Print toggle) */}
        <div className="bg-neutral-50 px-6 py-3 border-t border-neutral-200 flex items-center justify-between text-xs text-neutral-600">
          <label className="flex items-center gap-2 cursor-pointer font-medium">
            <input
              type="checkbox"
              checked={autoPrintReceipt}
              onChange={(e) => setAutoPrintReceipt(e.target.checked)}
              className="rounded text-red-600 focus:ring-red-500 cursor-pointer"
            />
            <Printer className="w-4 h-4 text-neutral-500" />
            <span>Cetak struk otomatis setelah pembayaran berhasil</span>
          </label>

          <span className="text-[11px] text-neutral-400">
            Shift Aktif: Kasir 01
          </span>
        </div>
      </div>
    </div>
  );
};
