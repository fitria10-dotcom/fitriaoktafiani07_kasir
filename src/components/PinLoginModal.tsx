import React, { useState } from 'react';
import { StaffUser } from '../types/pos';
import { playClick, playError, playSuccess } from '../utils/audio';
import { Lock, ShieldCheck, UserCheck, KeyRound, X, AlertCircle } from 'lucide-react';

interface PinLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffList: StaffUser[];
  currentStaff: StaffUser;
  onSelectStaff: (staff: StaffUser) => void;
  requiredRole?: 'admin' | 'branch_manager' | 'supervisor';
  reason?: string;
}

export const PinLoginModal: React.FC<PinLoginModalProps> = ({
  isOpen,
  onClose,
  staffList,
  currentStaff,
  onSelectStaff,
  requiredRole,
  reason,
}) => {
  const [selectedUser, setSelectedUser] = useState<StaffUser>(currentStaff);
  const [enteredPin, setEnteredPin] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  if (!isOpen) return null;

  const handleKeyPress = (num: string) => {
    playClick();
    if (enteredPin.length < 4) {
      const newPin = enteredPin + num;
      setEnteredPin(newPin);
      setErrorMessage('');

      if (newPin.length === 4) {
        verifyPin(newPin, selectedUser);
      }
    }
  };

  const handleBackspace = () => {
    playClick();
    setEnteredPin((prev) => prev.slice(0, -1));
    setErrorMessage('');
  };

  const verifyPin = (pin: string, user: StaffUser) => {
    if (user.pin === pin) {
      // Check role authorization if specified
      if (requiredRole) {
        const roleWeights = {
          cashier: 1,
          supervisor: 2,
          branch_manager: 3,
          admin: 4,
        };
        if (roleWeights[user.role] < roleWeights[requiredRole]) {
          playError();
          setErrorMessage(`Akses ditolak: Memerlukan hak akses ${requiredRole.toUpperCase()}`);
          setEnteredPin('');
          return;
        }
      }

      playSuccess();
      onSelectStaff(user);
      setEnteredPin('');
      onClose();
    } else {
      playError();
      setErrorMessage('PIN Salah! Silakan coba lagi.');
      setEnteredPin('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-neutral-100 flex flex-col animate-in zoom-in-95">
        {/* Header */}
        <div className="bg-[#b31412] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-amber-300" />
            <h3 className="font-bold text-base">Akses Karyawan & Keamanan PIN</h3>
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

        <div className="p-5 space-y-4">
          {reason && (
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>{reason}</span>
            </div>
          )}

          {/* User selector list */}
          <div>
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block mb-2">
              Pilih Pengguna:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {staffList.map((st) => (
                <button
                  key={st.id}
                  onClick={() => {
                    playClick();
                    setSelectedUser(st);
                    setEnteredPin('');
                    setErrorMessage('');
                  }}
                  className={`p-2.5 rounded-xl border flex items-center gap-2 text-left transition-all cursor-pointer ${
                    selectedUser.id === st.id
                      ? 'border-[#b31412] bg-red-50/70 shadow-sm'
                      : 'border-neutral-200 hover:bg-neutral-50'
                  }`}
                >
                  <img
                    src={st.avatar}
                    alt={st.name}
                    className="w-8 h-8 rounded-full object-cover border border-neutral-200 flex-shrink-0"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-neutral-800 truncate leading-tight">
                      {st.name}
                    </p>
                    <span className="text-[10px] text-red-700 font-semibold block uppercase">
                      {st.roleLabel}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* PIN Input Dots */}
          <div className="text-center py-2">
            <p className="text-xs text-neutral-500 mb-2 font-medium">
              Masukkan 4 digit PIN untuk <span className="font-bold text-neutral-800">{selectedUser.name}</span>
            </p>

            <div className="flex justify-center gap-4 my-2">
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className={`w-4 h-4 rounded-full border-2 transition-all ${
                    idx < enteredPin.length
                      ? 'bg-[#b31412] border-[#b31412] scale-110'
                      : 'border-neutral-300 bg-neutral-100'
                  }`}
                />
              ))}
            </div>

            {errorMessage ? (
              <p className="text-xs font-bold text-red-600 mt-2 animate-bounce">
                {errorMessage}
              </p>
            ) : (
              <p className="text-[11px] text-neutral-400 mt-2">
                Tip Demo: PIN {selectedUser.name} adalah <span className="font-mono font-bold text-neutral-600">{selectedUser.pin}</span>
              </p>
            )}
          </div>

          {/* Numeric Keypad */}
          <div className="grid grid-cols-3 gap-2 max-w-[260px] mx-auto">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                onClick={() => handleKeyPress(digit)}
                className="h-12 bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300 rounded-xl font-bold text-lg text-neutral-800 transition-colors shadow-sm cursor-pointer"
              >
                {digit}
              </button>
            ))}
            <button
              onClick={() => {
                playClick();
                setEnteredPin('');
                setErrorMessage('');
              }}
              className="h-12 bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300 rounded-xl font-semibold text-xs text-neutral-600 transition-colors cursor-pointer"
            >
              C
            </button>
            <button
              onClick={() => handleKeyPress('0')}
              className="h-12 bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300 rounded-xl font-bold text-lg text-neutral-800 transition-colors shadow-sm cursor-pointer"
            >
              0
            </button>
            <button
              onClick={handleBackspace}
              className="h-12 bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300 rounded-xl font-semibold text-xs text-neutral-600 transition-colors cursor-pointer flex items-center justify-center"
            >
              ⌫
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
