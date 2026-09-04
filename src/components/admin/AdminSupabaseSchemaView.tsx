import React, { useState } from 'react';
import { Database, Copy, Check, Download, CheckCircle2, ShieldCheck, Terminal } from 'lucide-react';
import { SUPABASE_SCHEMA_SQL } from '../../data/supabaseSchema';

export const AdminSupabaseSchemaView: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
    setCopied(true);
    setToastMessage('Skema SQL berhasil disalin ke clipboard!');
    setTimeout(() => {
      setCopied(false);
      setToastMessage(null);
    }, 3000);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([SUPABASE_SCHEMA_SQL], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'irsyadul_amal_supabase_schema.sql';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    setToastMessage('File irsyadul_amal_supabase_schema.sql berhasil didownload!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E0EAEA] shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-extrabold text-[#008284]">
            <Database className="w-4 h-4" />
            <span>INTEGRASI SUPABASE & POSTGRESQL</span>
          </div>
          <h1 className="text-xl font-extrabold text-[#071F20] mt-1">
            Skema Database Relasional Supabase
          </h1>
          <p className="text-xs text-[#647B7C] mt-0.5">
            Skrip DDL SQL lengkap siap pakai untuk migrasi dari local state ke database cloud Supabase.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="px-4 py-2.5 rounded-xl bg-white border border-gray-300 hover:bg-gray-50 text-[#008284] text-xs font-extrabold shadow-2xs flex items-center gap-2 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Tersalin' : 'Salin SQL'}
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="px-4 py-2.5 rounded-xl bg-[#008284] hover:bg-[#006769] text-white text-xs font-extrabold shadow-xs flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download .sql
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Guide Card */}
      <div className="bg-white p-5 rounded-2xl border border-[#CCFBF1] shadow-2xs space-y-2 text-xs">
        <h3 className="font-extrabold text-[#008284] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          Petunjuk Menghubungkan ke Supabase:
        </h3>
        <ol className="list-decimal list-inside text-gray-700 space-y-1.5 leading-relaxed">
          <li>
            Buka proyek Supabase Anda di{' '}
            <span className="font-mono text-[#008284]">supabase.com</span> lalu masuk ke menu{' '}
            <strong>SQL Editor</strong>.
          </li>
          <li>
            Klik tombol <strong>Salin SQL</strong> di atas atau download file{' '}
            <span className="font-mono">irsyadul_amal_supabase_schema.sql</span>.
          </li>
          <li>Tempelkan (Paste) seluruh skrip SQL ke SQL Editor Supabase, lalu klik <strong>RUN</strong>.</li>
          <li>
            Seluruh tabel (<code>programs</code>, <code>donations</code>, <code>donors</code>,{' '}
            <code>bank_accounts</code>, <code>reports</code>, <code>documentations</code>,{' '}
            <code>site_settings</code>, <code>homepage_content</code>, <code>news_articles</code>,{' '}
            <code>media_assets</code>, <code>admin_users</code>) beserta indeks dan Row Level Security (RLS)
            akan otomatis terbentuk dan terisi data inisial resmi.
          </li>
        </ol>
      </div>

      {/* SQL Code Block */}
      <div className="bg-[#0b1b1c] rounded-2xl overflow-hidden shadow-xl border border-gray-800">
        <div className="px-4 py-2.5 bg-[#071314] border-b border-gray-800 flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#008284]" />
            <span className="font-mono font-bold text-gray-300">schema.sql</span>
          </div>
          <span className="text-[11px] text-gray-500">PostgreSQL 15+ / Supabase DDL</span>
        </div>

        <pre className="p-4 sm:p-6 text-[11px] font-mono text-teal-100 overflow-x-auto leading-relaxed max-h-[600px] selection:bg-[#008284]">
          <code>{SUPABASE_SCHEMA_SQL}</code>
        </pre>
      </div>
    </div>
  );
};
