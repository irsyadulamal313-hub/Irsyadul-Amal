import React, { useState } from 'react';
import { ProgramItem, BankAccountItem } from '../types';
import { useCMS } from '../data/cmsContext';
import {
  Heart,
  Copy,
  Check,
  MessageSquare,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  Info,
  Layers,
  ArrowDownCircle,
  HelpCircle,
  AlertTriangle,
} from 'lucide-react';

interface DonationPageProps {
  programs: ProgramItem[];
  onSelectProgramDetail: (program: ProgramItem) => void;
  onOpenQuickDonation: (program?: ProgramItem) => void;
}

const PRESET_NOMINALS = [
  { value: 25000, label: 'Rp 25.000' },
  { value: 50000, label: 'Rp 50.000' },
  { value: 100000, label: 'Rp 100.000' },
  { value: 250000, label: 'Rp 250.000' },
  { value: 500000, label: 'Rp 500.000' },
  { value: 1000000, label: 'Rp 1.000.000' },
];

export const DonationPage: React.FC<DonationPageProps> = ({
  programs,
  onSelectProgramDetail,
}) => {
  const { bankGroups, siteSettings } = useCMS();

  // Selected Program state (default to first program or general)
  const [selectedProgramId, setSelectedProgramId] = useState<string>(
    programs.length > 0 ? programs[0].id : 'umum'
  );

  // Selected Nominal state
  const [selectedNominal, setSelectedNominal] = useState<number | null>(100000);
  const [customNominal, setCustomNominal] = useState<string>('');

  // Selected Bank state
  const [selectedBank, setSelectedBank] = useState<BankAccountItem | null>(
    bankGroups[0]?.accounts[0] || null
  );

  // Sender name for WhatsApp confirmation
  const [senderName, setSenderName] = useState<string>('');

  // Copy and Toast State
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Find currently selected program item
  const activeProgram: ProgramItem | undefined =
    selectedProgramId === 'umum'
      ? {
          id: 'umum',
          title: 'Donasi & Infaq Umum Lembaga',
          category: 'Sosial',
          status: 'BERJALAN',
          description:
            'Penyaluran infaq, sedekah, dan bantuan umum untuk operasional tanggap kemanusiaan masyarakat binaan di wilayah Garut.',
          fullStory:
            'Amanah donasi umum dikelola untuk merespons kebutuhan mendesak masyarakat dhuafa, santunan yatim darurat, serta operasional pelayanan dakwah sosial Irsyadul Amal.',
          location: 'Kabupaten Garut',
          targetAmountText: 'Data akan diperbarui.',
          collectedAmountText: 'Data akan diperbarui.',
          donorsCountText: 'Data akan diperbarui.',
          targetRecipients: 'Masyarakat dhuafa & fakir miskin',
          imageUrl:
            'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80',
        }
      : programs.find((p) => p.id === selectedProgramId) || programs[0];

  const handleCopy = (accountNumber: string) => {
    navigator.clipboard.writeText(accountNumber);
    setCopiedNumber(accountNumber);
    setToastMessage('Nomor rekening berhasil disalin.');
    setTimeout(() => {
      setCopiedNumber(null);
      setToastMessage(null);
    }, 3000);
  };

  // Helper formatting for currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID').format(val);
  };

  // Compute final effective nominal string
  const getEffectiveNominalString = (): string => {
    if (customNominal.trim() !== '') {
      return customNominal.replace(/\D/g, '') || '[NOMINAL]';
    }
    if (selectedNominal) {
      return formatCurrency(selectedNominal);
    }
    return '[NOMINAL]';
  };

  // Compute WhatsApp message exactly according to the template from CMS
  const generateWhatsAppMessage = (): string => {
    const programTitle = activeProgram ? activeProgram.title : 'Donasi Umum';
    const nominalStr = getEffectiveNominalString();
    const bankNameStr = selectedBank ? selectedBank.bankName : 'Rekening Resmi';
    const holderStr = senderName.trim()
      ? senderName.trim()
      : selectedBank
        ? selectedBank.accountHolder
        : 'Hamba Allah';

    let template =
      siteSettings.whatsappConfirmationTemplate ||
      "Assalamu'alaikum Irsyadul Amal,\n\nSaya telah melakukan donasi.\n\nProgram:\n[NAMA PROGRAM]\n\nNominal:\nRp[NOMINAL]\n\nBank tujuan:\n[NAMA BANK]\n\nAtas Nama:\n[NAMA REKENING]\n\nSaya akan mengirimkan bukti transfer melalui chat ini.\n\nTerima kasih.";

    return template
      .replace(/\[NAMA PROGRAM\]/g, programTitle)
      .replace(/\[NOMINAL\]/g, nominalStr)
      .replace(/\[NAMA BANK\]/g, bankNameStr)
      .replace(/\[NAMA REKENING\]/g, holderStr);
  };

  const handleSendWhatsAppConfirmation = () => {
    const message = generateWhatsAppMessage();
    const cleanPhone = siteSettings.whatsapp.replace(/\D/g, '').replace(/^0/, '62');
    const url = `https://wa.me/${cleanPhone || '6287804034140'}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-12 sm:space-y-16 animate-in fade-in duration-200 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#004D4F] text-white px-5 py-3 rounded-2xl shadow-2xl border border-teal-300 text-xs sm:text-sm font-extrabold flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2 duration-150">
          <Check className="w-5 h-5 text-emerald-300 stroke-[2.5]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ==================================================
          1. HEADER (Handled by Layout) & 2. JUDUL
          ================================================== */}
      <section className="text-center max-w-2xl mx-auto space-y-3 pt-2">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#008284] bg-teal-50 px-3.5 py-1 rounded-full border border-teal-200/60">
          Amanah Kebaikan Anda
        </span>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#071F20] tracking-tight">
          Salurkan Kebaikan Anda
        </h1>
        <p className="text-xs sm:text-sm text-[#647B7C] leading-relaxed max-w-lg mx-auto">
          Setiap donasi yang Anda titipkan adalah amanah untuk menghadirkan manfaat nyata bagi saudara-saudara kita yang membutuhkan.
        </p>
      </section>

      {/* ==================================================
          3. DAFTAR PROGRAM
          ================================================== */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 pb-3">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-[#071F20] tracking-tight flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#008284]" />
              Daftar Program Donasi
            </h2>
            <p className="text-xs text-gray-500">
              Pilih program kebaikan yang ingin Anda salurkan melalui rekening resmi kami.
            </p>
          </div>
          <span className="text-[11px] font-semibold text-teal-800 bg-teal-50 border border-teal-200 px-3 py-1 rounded-xl self-start sm:self-auto">
            Klik kartu program untuk memilih
          </span>
        </div>

        {/* Notice Placeholder Indicator */}
        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-amber-900">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Informasi Data Program:</p>
            <p className="text-amber-800 leading-relaxed text-[11px]">
              Program akan ditampilkan setelah data resmi tersedia. Foto dan judul berikut merupakan pratinjau contoh (placeholder) untuk memudahkan alur donasi Anda.
            </p>
          </div>
        </div>

        {/* Grid Programs Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card General Infaq */}
          <div
            onClick={() => setSelectedProgramId('umum')}
            className={`cursor-pointer rounded-2xl border-2 p-4 transition-all flex flex-col justify-between space-y-3 bg-white ${
              selectedProgramId === 'umum'
                ? 'border-[#008284] shadow-md ring-2 ring-[#008284]/20'
                : 'border-gray-200 hover:border-gray-300 shadow-xs'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800">
                  Sosial & Umum
                </span>
                {selectedProgramId === 'umum' && (
                  <span className="flex items-center gap-1 text-[11px] font-extrabold text-[#008284]">
                    <CheckCircle2 className="w-4 h-4 fill-[#008284] text-white" />
                    Terpilih
                  </span>
                )}
              </div>
              <h3 className="font-extrabold text-sm text-[#071F20]">
                Donasi & Infaq Umum Lembaga
              </h3>
              <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                Penyaluran infaq, sedekah, dan bantuan umum untuk operasional kemanusiaan masyarakat Garut.
              </p>
            </div>

            <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
              <span>Target: Data akan diperbarui</span>
              <span className="font-bold text-[#008284]">Pilih Program &rarr;</span>
            </div>
          </div>

          {/* List of other available genuine programs */}
          {programs.map((prog) => {
            const isSelected = selectedProgramId === prog.id;
            return (
              <div
                key={prog.id}
                onClick={() => setSelectedProgramId(prog.id)}
                className={`cursor-pointer rounded-2xl border-2 overflow-hidden transition-all flex flex-col justify-between bg-white ${
                  isSelected
                    ? 'border-[#008284] shadow-md ring-2 ring-[#008284]/20'
                    : 'border-gray-200 hover:border-gray-300 shadow-xs'
                }`}
              >
                {/* Image with Placeholder tag */}
                <div className="relative h-36 bg-gray-100 overflow-hidden">
                  <img
                    src={prog.imageUrl}
                    alt={prog.title}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src =
                        prog.category === 'Wakaf'
                          ? 'https://images.unsplash.com/photo-1541252260730-0412e8e2108e?auto=format&fit=crop&w=800&q=80'
                          : 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80';
                    }}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2 left-2 bg-[#008284] text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-xs">
                    {prog.category}
                  </span>
                  <span className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-xs text-white text-[9px] font-semibold px-2 py-0.5 rounded-md">
                    Contoh Ilustrasi
                  </span>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-gray-400 font-semibold">
                        {prog.location || 'Kabupaten Garut'}
                      </span>
                      {isSelected && (
                        <span className="flex items-center gap-1 text-[11px] font-extrabold text-[#008284]">
                          <CheckCircle2 className="w-4 h-4 fill-[#008284] text-white" />
                          Terpilih
                        </span>
                      )}
                    </div>
                    <h3 className="font-extrabold text-xs sm:text-sm text-[#071F20] leading-snug line-clamp-2">
                      {prog.title}
                    </h3>
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                    <span>Target: Data akan diperbarui</span>
                    <span className="font-bold text-[#008284]">
                      {isSelected ? 'Sedang Dipilih' : 'Pilih Program'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ==================================================
          4. DETAIL PROGRAM
          ================================================== */}
      {activeProgram && (
        <section className="bg-white rounded-3xl p-5 sm:p-7 border-2 border-teal-100 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-[#008284] text-white text-xs font-extrabold rounded-full">
                {activeProgram.category}
              </span>
              <span className="text-xs font-bold text-gray-500">
                Detail Program Terpilih
              </span>
            </div>
            {activeProgram.id !== 'umum' && (
              <button
                type="button"
                onClick={() => onSelectProgramDetail(activeProgram)}
                className="text-xs font-bold text-[#008284] hover:underline self-start sm:self-auto"
              >
                Lihat Deskripsi Lengkap &rarr;
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-3">
              <h3 className="text-lg sm:text-xl font-extrabold text-[#071F20] leading-snug">
                {activeProgram.title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                {activeProgram.fullStory || activeProgram.description}
              </p>
              {activeProgram.objective && (
                <p className="text-xs text-teal-800 bg-teal-50 p-2.5 rounded-xl border border-teal-200/60 font-medium">
                  <strong>Tujuan:</strong> {activeProgram.objective}
                </p>
              )}
            </div>

            {/* Metrics cards (No fake numbers - strictly "Data akan diperbarui") */}
            <div className="bg-[#F0FAFA] border border-[#CCFBF1] rounded-2xl p-4 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-[#006769] uppercase tracking-wider">
                  Status Data Program
                </p>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>Target Dana:</span>
                    <strong className="text-gray-800">Data akan diperbarui</strong>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Dana Terkumpul:</span>
                    <strong className="text-[#008284]">Data akan diperbarui</strong>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Penerima Manfaat:</span>
                    <strong className="text-gray-800">
                      {activeProgram.targetRecipients || 'Data akan diperbarui'}
                    </strong>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Jumlah Donatur:</span>
                    <strong className="text-gray-800">Data akan diperbarui</strong>
                  </div>
                </div>
              </div>

              <p className="text-[10px] text-gray-500 italic pt-2 border-t border-teal-200/50">
                Informasi resmi capaian dana dan pembukuan diperbarui langsung oleh pengurus lembaga.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ==================================================
          5. PILIHAN NOMINAL DONASI
          ================================================== */}
      <section className="bg-white rounded-3xl p-5 sm:p-7 border border-[#E0EAEA] shadow-xs space-y-5">
        <div className="border-b border-gray-100 pb-3">
          <h2 className="text-lg sm:text-xl font-extrabold text-[#071F20] tracking-tight flex items-center gap-2">
            <Heart className="w-5 h-5 text-amber-500 fill-amber-500" />
            Pilihan Nominal Donasi
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Tentukan besaran nominal yang ingin Anda salurkan untuk program kebaikan ini.
          </p>
        </div>

        {/* Preset Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {PRESET_NOMINALS.map((nom) => {
            const isSelected = selectedNominal === nom.value && customNominal === '';
            return (
              <button
                key={nom.value}
                type="button"
                onClick={() => {
                  setSelectedNominal(nom.value);
                  setCustomNominal('');
                }}
                className={`py-3 px-2 rounded-2xl text-xs sm:text-sm font-extrabold transition-all border text-center ${
                  isSelected
                    ? 'bg-[#008284] text-white border-[#008284] shadow-xs ring-2 ring-[#008284]/20 scale-[1.02]'
                    : 'bg-gray-50 hover:bg-teal-50/50 text-gray-800 border-gray-200'
                }`}
              >
                {nom.label}
              </button>
            );
          })}
        </div>

        {/* Custom Nominal Field */}
        <div className="pt-2">
          <label className="block text-xs font-bold text-gray-700 mb-1.5">
            Atau Masukkan Nominal Lainnya (Rp):
          </label>
          <div className="relative max-w-md">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-extrabold text-gray-500">
              Rp
            </span>
            <input
              type="text"
              placeholder="Contoh: 75.000 / 300.000"
              value={customNominal}
              onChange={(e) => {
                const clean = e.target.value.replace(/\D/g, '');
                if (clean) {
                  setCustomNominal(formatCurrency(parseInt(clean, 10)));
                  setSelectedNominal(null);
                } else {
                  setCustomNominal('');
                }
              }}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm font-bold text-gray-900 focus:outline-none focus:border-[#008284] focus:ring-2 focus:ring-[#008284]/20 transition-all"
            />
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            Nominal yang Anda tentukan akan otomatis tercantum pada format konfirmasi WhatsApp.
          </p>
        </div>
      </section>

      {/* ==================================================
          6. REKENING RESMI
          ================================================== */}
      <section className="space-y-5">
        <div className="border-b border-gray-200 pb-3">
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#071F20] tracking-tight flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-[#008284]" />
            Rekening Resmi Irsyadul Amal
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Silakan pilih rekening sesuai dengan tujuan donasi Anda.
          </p>
        </div>

        {/* Bank Groups Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {bankGroups.map((group) => (
            <div
              key={group.category}
              className="bg-white rounded-3xl border-2 border-[#CCFBF1] shadow-xs hover:border-[#008284]/60 transition-all p-5 sm:p-6 flex flex-col justify-between space-y-5"
            >
              {/* Category Title & Description */}
              <div className="space-y-1.5 border-b border-gray-100 pb-3">
                <span className="inline-block px-3 py-1 rounded-xl bg-[#E6F7F7] text-[#006769] font-black text-xs tracking-wide uppercase">
                  {group.category}
                </span>
                <p className="text-xs text-gray-600 leading-relaxed pt-1">
                  {group.description}
                </p>
              </div>

              {/* Accounts in Group */}
              <div className="space-y-4 flex-1">
                {group.accounts.map((acc) => {
                  const isCopied = copiedNumber === acc.accountNumber;
                  const isBankSelected = selectedBank?.id === acc.id;

                  return (
                    <div
                      key={acc.id}
                      onClick={() => setSelectedBank(acc)}
                      className={`rounded-2xl p-4 space-y-3 transition-all cursor-pointer border ${
                        isBankSelected
                          ? 'bg-teal-50/50 border-[#008284] shadow-xs ring-1 ring-[#008284]/30'
                          : 'bg-gray-50 border-gray-200/80 hover:bg-gray-100/70'
                      }`}
                    >
                      <div>
                        <span className="text-[10px] uppercase font-bold text-gray-500 block mb-0.5">
                          Nama Bank:
                        </span>
                        <p className="text-xs sm:text-sm font-black text-gray-900 uppercase">
                          {acc.bankName}
                        </p>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-bold text-gray-500 block mb-0.5">
                          Nomor Rekening:
                        </span>
                        <p className="font-mono text-lg sm:text-xl font-black text-[#008284] tracking-wider select-all">
                          {acc.accountNumber}
                        </p>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-bold text-gray-500 block mb-0.5">
                          Nama Pemilik Rekening:
                        </span>
                        <p className="text-xs sm:text-sm text-gray-900 font-extrabold">
                          {acc.accountHolder}
                        </p>
                      </div>

                      {/* Tombol Salin Nomor Rekening */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(acc.accountNumber);
                          setSelectedBank(acc);
                        }}
                        className={`w-full py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 ${
                          isCopied
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white hover:bg-[#008284] hover:text-white text-[#008284] border border-[#008284]/40'
                        }`}
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Nomor rekening berhasil disalin.</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>SALIN NOMOR REKENING</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 text-[11px] text-gray-400 flex items-center gap-1.5 border-t border-gray-100">
                <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Rekening resmi berbadan hukum Irsyadul Amal</span>
              </div>
            </div>
          ))}
        </div>

        {/* INFORMASI KEAMANAN */}
        <div className="bg-amber-50 border-l-4 border-amber-500 rounded-2xl p-4 text-xs text-amber-900 flex items-start gap-3 shadow-2xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-extrabold text-amber-950 text-xs sm:text-sm">
              Informasi Keamanan Transfer
            </h4>
            <p className="mt-0.5 leading-relaxed font-semibold">
              Pastikan nama pemilik rekening sesuai dengan informasi resmi Irsyadul Amal sebelum melakukan transfer.
            </p>
          </div>
        </div>
      </section>

      {/* ==================================================
          7. INSTRUKSI TRANSFER
          ================================================== */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E0EAEA] shadow-xs space-y-5">
        <div className="border-b border-gray-100 pb-3">
          <h2 className="text-lg sm:text-xl font-extrabold text-[#071F20] tracking-tight flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#008284]" />
            Instruksi Transfer
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Langkah mudah menunaikan donasi melalui kanal transfer perbankan resmi:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-2xl p-4 space-y-2 border border-gray-200/60">
            <span className="w-7 h-7 rounded-full bg-[#008284] text-white text-xs font-black flex items-center justify-center">
              1
            </span>
            <h4 className="font-extrabold text-xs sm:text-sm text-[#071F20]">
              Pilih Program & Rekening
            </h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Tentukan tujuan program kebaikan dan pilih nomor rekening yang sesuai (Donasi Umum, Donasi Yayasan, atau Wakaf Air Bersih).
            </p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-4 space-y-2 border border-gray-200/60">
            <span className="w-7 h-7 rounded-full bg-[#008284] text-white text-xs font-black flex items-center justify-center">
              2
            </span>
            <h4 className="font-extrabold text-xs sm:text-sm text-[#071F20]">
              Salin Nomor Rekening
            </h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Gunakan tombol <strong>SALIN NOMOR REKENING</strong> agar tidak terjadi kekeliruan saat memasukkan angka di aplikasi bank.
            </p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-4 space-y-2 border border-gray-200/60">
            <span className="w-7 h-7 rounded-full bg-[#008284] text-white text-xs font-black flex items-center justify-center">
              3
            </span>
            <h4 className="font-extrabold text-xs sm:text-sm text-[#071F20]">
              Lakukan Transfer
            </h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Buka ATM atau Mobile Banking (BSI Mobile, BRImo, Livin' by Mandiri). Pastikan nama penerima cocok persis sebelum mengirim.
            </p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-4 space-y-2 border border-gray-200/60">
            <span className="w-7 h-7 rounded-full bg-[#008284] text-white text-xs font-black flex items-center justify-center">
              4
            </span>
            <h4 className="font-extrabold text-xs sm:text-sm text-[#071F20]">
              Kirim Konfirmasi WhatsApp
            </h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Simpan bukti transfer Anda dan klik tombol konfirmasi di bawah untuk mengirimkan bukti ke WhatsApp resmi 087804034140.
            </p>
          </div>
        </div>
      </section>

      {/* ==================================================
          8. KONFIRMASI VIA WHATSAPP
          ================================================== */}
      <section className="bg-gradient-to-br from-[#006769] to-[#004D4F] text-white rounded-3xl p-6 sm:p-9 shadow-lg space-y-6">
        <div className="max-w-2xl mx-auto text-center space-y-2">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-300 bg-black/20 px-3.5 py-1 rounded-full">
            Layanan Konfirmasi Resmi
          </span>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight">
            Sudah Melakukan Transfer?
          </h2>
          <p className="text-xs sm:text-sm text-teal-100 leading-relaxed max-w-md mx-auto">
            Silakan kirim bukti transfer melalui WhatsApp agar donasi Anda dapat kami verifikasi.
          </p>
        </div>

        {/* Interactive confirmation card */}
        <div className="max-w-xl mx-auto bg-white/10 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-white/20 space-y-4">
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-amber-300 uppercase tracking-wider">
              Ringkasan Pesan Donasi yang Akan Dikirim:
            </h4>

            {/* Live Template Preview */}
            <div className="bg-[#051819]/80 rounded-2xl p-4 text-xs font-mono text-teal-100 space-y-2 border border-white/10 leading-relaxed select-all">
              <p className="text-teal-200 font-semibold">Assalamu'alaikum Irsyadul Amal,</p>
              <p>Saya telah melakukan donasi.</p>
              <div>
                <span className="text-gray-400">Program:</span>
                <p className="text-white font-bold">{activeProgram?.title || '[NAMA PROGRAM]'}</p>
              </div>
              <div>
                <span className="text-gray-400">Nominal:</span>
                <p className="text-amber-300 font-bold">Rp{getEffectiveNominalString()}</p>
              </div>
              <div>
                <span className="text-gray-400">Bank tujuan:</span>
                <p className="text-white font-bold">{selectedBank?.bankName || '[NAMA BANK]'}</p>
              </div>
              <div>
                <span className="text-gray-400">Atas Nama:</span>
                <p className="text-white font-bold">
                  {senderName.trim()
                    ? senderName.trim()
                    : selectedBank
                      ? selectedBank.accountHolder
                      : '[NAMA REKENING]'}
                </p>
              </div>
              <p>Saya akan mengirimkan bukti transfer melalui chat ini.</p>
              <p className="text-teal-200">Terima kasih.</p>
            </div>

            {/* Optional Sender Name input */}
            <div className="pt-1">
              <label className="block text-[11px] text-teal-100 font-semibold mb-1">
                Atas Nama Pengirim (Opsional, agar otomatis terisi di pesan):
              </label>
              <input
                type="text"
                placeholder="Contoh: Hamba Allah / Nama Anda"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white text-gray-900 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-2xs font-medium"
              />
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleSendWhatsAppConfirmation}
              className="w-full py-4 px-6 rounded-2xl bg-amber-400 hover:bg-amber-500 text-gray-900 font-black text-xs sm:text-sm shadow-md hover:shadow-xl transition-all flex items-center justify-center gap-2.5 active:scale-95 tracking-wide"
            >
              <MessageSquare className="w-5 h-5 fill-current" />
              KONFIRMASI DONASI VIA WHATSAPP
            </button>
            <p className="text-[11px] text-center text-teal-200 mt-2 font-medium">
              Nomor WhatsApp resmi:{' '}
              <strong className="text-white">{siteSettings.whatsapp}</strong>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
