import React, { useState } from 'react';
import { ProgramItem, BankAccountItem } from '../types';
import { OFFICIAL_BANK_GROUPS, ALL_BANK_ACCOUNTS, createWhatsAppDonationMessage } from '../data/officialData';
import { X, Heart, Copy, Check, MessageSquare, CreditCard, ShieldCheck } from 'lucide-react';

interface DonationActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProgram?: ProgramItem | null;
  programs: ProgramItem[];
}

export const DonationActionModal: React.FC<DonationActionModalProps> = ({
  isOpen,
  onClose,
  selectedProgram,
  programs,
}) => {
  if (!isOpen) return null;

  const [chosenProgramTitle, setChosenProgramTitle] = useState(
    selectedProgram ? selectedProgram.title : programs[0]?.title || 'Infaq & Sedekah Umum'
  );
  const [chosenBankId, setChosenBankId] = useState(ALL_BANK_ACCOUNTS[0].id);
  const [nominalInput, setNominalInput] = useState('100.000');
  const [donorNameInput, setDonorNameInput] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const selectedBank =
    ALL_BANK_ACCOUNTS.find((b) => b.id === chosenBankId) || ALL_BANK_ACCOUNTS[0];

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(selectedBank.accountNumber);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleOpenWhatsApp = () => {
    const text = createWhatsAppDonationMessage({
      programName: chosenProgramTitle,
      nominal: nominalInput,
      bankName: selectedBank.bankName,
      accountHolder: selectedBank.accountHolder,
    });

    const url = `https://wa.me/6287804034140?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col border border-[#CCFBF1]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-[#F0FAFA]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#008284] text-white flex items-center justify-center">
              <Heart className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-[#071F20]">
                Salurkan Donasi Kebaikan
              </h3>
              <p className="text-[11px] text-[#647B7C]">Lembaga Sosial & Kemanusiaan Irsyadul Amal</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Pilihan Program */}
          <div>
            <label className="block text-[11px] font-bold text-gray-700 mb-1">
              Pilih Program Kebaikan
            </label>
            <select
              value={chosenProgramTitle}
              onChange={(e) => setChosenProgramTitle(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-[#008284] font-medium"
            >
              {programs.map((p) => (
                <option key={p.id} value={p.title}>
                  [{p.category}] {p.title}
                </option>
              ))}
              <option value="Infaq & Sedekah Umum">Infaq & Sedekah Umum</option>
            </select>
          </div>

          {/* Nominal Donasi Cepat */}
          <div>
            <label className="block text-[11px] font-bold text-gray-700 mb-1">
              Nominal Donasi (Rp)
            </label>
            <input
              type="text"
              placeholder="Contoh: 100.000"
              value={nominalInput}
              onChange={(e) => setNominalInput(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 font-bold focus:outline-none focus:border-[#008284]"
            />
            <div className="flex items-center gap-1.5 pt-1.5">
              {['50.000', '100.000', '250.000', '500.000', '1.000.000'].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setNominalInput(amt)}
                  className="px-2 py-1 bg-gray-100 hover:bg-teal-50 hover:text-[#008284] rounded-lg text-[10px] font-semibold text-gray-700"
                >
                  {amt}
                </button>
              ))}
            </div>
          </div>

          {/* Nama Donatur (Opsional) */}
          <div>
            <label className="block text-[11px] font-bold text-gray-700 mb-1">
              Nama Pengirim / Pemilik Rekening
            </label>
            <input
              type="text"
              placeholder="Contoh: Hamba Allah / Nama Anda"
              value={donorNameInput}
              onChange={(e) => setDonorNameInput(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-[#008284]"
            />
          </div>

          {/* Pilihan Bank Transfer */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-gray-700">
              Pilih Rekening Tujuan Transfer
            </label>
            <div className="space-y-1.5">
              {ALL_BANK_ACCOUNTS.map((acc) => {
                const isSelected = chosenBankId === acc.id;
                return (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => setChosenBankId(acc.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-[#008284] bg-teal-50/70 shadow-2xs'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-[#071F20]">
                          {acc.bankName}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-gray-100 text-gray-600">
                          {acc.category}
                        </span>
                      </div>
                      <p className="font-mono text-xs font-bold text-[#008284] mt-0.5">
                        {acc.accountNumber}
                      </p>
                      <p className="text-[10px] text-gray-500">
                        a.n. {acc.accountHolder}
                      </p>
                    </div>

                    <div className="w-4 h-4 rounded-full border border-[#008284] flex items-center justify-center">
                      {isSelected && <div className="w-2 h-2 rounded-full bg-[#008284]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Salin Rekening Terpilih Box */}
          <div className="bg-[#F0FAFA] border border-[#CCFBF1] rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-gray-600">Nomor Rekening Terpilih:</span>
              <button
                type="button"
                onClick={handleCopyAccount}
                className="px-2.5 py-1 bg-white border border-teal-200 text-[#008284] hover:bg-teal-50 rounded-lg text-[10px] font-bold flex items-center gap-1"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span>Nomor rekening berhasil disalin.</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>SALIN NOMOR REKENING</span>
                  </>
                )}
              </button>
            </div>
            <p className="font-mono text-sm font-extrabold text-[#008284]">
              {selectedBank.accountNumber} ({selectedBank.bankName})
            </p>
            <p className="text-[10px] text-gray-500">
              Atas Nama: <strong>{selectedBank.accountHolder}</strong>
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row items-center gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-xs"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleOpenWhatsApp}
            className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-[#008284] hover:bg-[#006769] text-white font-extrabold text-xs shadow-xs flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-4 h-4 fill-white" />
            KONFIRMASI DONASI VIA WHATSAPP
          </button>
        </div>
      </div>
    </div>
  );
};
