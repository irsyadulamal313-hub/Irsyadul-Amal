import React, { useState } from 'react';
import { Shield, Plus, Trash2, Edit3, Key, CheckCircle2, UserCheck, X } from 'lucide-react';
import { useCMS } from '../../data/cmsContext';
import { AdminUserItem, AdminRole } from '../../types';

export const AdminUsersSection: React.FC = () => {
  const { adminUsers, addAdminUser, updateAdminUser, deleteAdminUser } = useCMS();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUserItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<AdminRole>('Admin Konten');
  const [password, setPassword] = useState('admin123');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const openAdd = () => {
    setEditingUser(null);
    setName('');
    setEmail('');
    setRole('Admin Konten');
    setPassword('admin123');
    setIsModalOpen(true);
  };

  const openEdit = (user: AdminUserItem) => {
    setEditingUser(user);
    setName(user.name);
    setEmail(user.email);
    setRole(user.role);
    setPassword('');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !name.trim()) return;

    if (editingUser) {
      updateAdminUser({
        ...editingUser,
        name: name.trim(),
        email: email.trim(),
        role,
      });
      showToast('Data admin berhasil diperbarui!');
    } else {
      const newUser: AdminUserItem = {
        id: `adm-${Date.now()}`,
        name: name.trim(),
        email: email.trim(),
        role,
        status: 'Aktif',
        createdAt: new Date().toISOString().split('T')[0],
      };
      addAdminUser(newUser);
      showToast('Admin baru berhasil ditambahkan!');
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, userName: string) => {
    if (adminUsers.length <= 1) {
      alert('Minimal harus ada 1 Super Admin di dalam sistem.');
      return;
    }
    if (confirm(`Hapus hak akses admin untuk ${userName}?`)) {
      deleteAdminUser(id);
      showToast('Akun admin dihapus.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E0EAEA] shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-extrabold text-[#008284]">
            <Shield className="w-4 h-4" />
            <span>HAK AKSES PENGELOLA</span>
          </div>
          <h1 className="text-xl font-extrabold text-[#071F20] mt-1">
            Manajemen Pengguna & Administrator
          </h1>
          <p className="text-xs text-[#647B7C] mt-0.5">
            Atur staf pengelola website, role kewenangan, dan izin akses dashboard.
          </p>
        </div>

        <button
          type="button"
          onClick={openAdd}
          className="px-4 py-2.5 rounded-xl bg-[#008284] hover:bg-[#006769] text-white text-xs font-extrabold shadow-xs flex items-center gap-2 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          Tambah Admin Baru
        </button>
      </div>

      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Users List */}
      <div className="bg-white rounded-2xl border border-[#E0EAEA] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-extrabold text-[#647B7C] uppercase tracking-wider">
                <th className="py-3 px-4">Nama Lengkap</th>
                <th className="py-3 px-4">Email Login</th>
                <th className="py-3 px-4">Role Kewenangan</th>
                <th className="py-3 px-4">Tanggal Dibuat</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {adminUsers.map((u) => (
                <tr key={u.id} className="hover:bg-teal-50/40 transition-colors">
                  <td className="py-3 px-4 font-bold text-[#071F20] flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#E6F4F4] text-[#008284] font-extrabold flex items-center justify-center text-xs">
                      {u.name.charAt(0)}
                    </div>
                    <span>{u.name}</span>
                  </td>
                  <td className="py-3 px-4 text-[#647B7C] font-mono">{u.email}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        u.role === 'Super Admin'
                          ? 'bg-purple-100 text-purple-800 border border-purple-200'
                          : u.role === 'Admin Donasi'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[#647B7C]">{u.createdAt}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(u)}
                        className="p-1.5 text-gray-400 hover:text-[#008284] rounded-lg"
                        title="Edit"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(u.id, u.name)}
                        className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#CCFBF1]">
            <div className="p-4 bg-[#F0FAFA] border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#008284] text-white rounded-xl">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-[#071F20]">
                    {editingUser ? 'Edit Pengguna Admin' : 'Tambah Admin Baru'}
                  </h3>
                  <p className="text-[10px] text-[#647B7C]">Akses dashboard Irsyadul Amal</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#071F20] block">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama staf pengelola..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#071F20] block">Email Login *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@irsyadulamal.org"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#071F20] block">Role Akses</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as AdminRole)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs outline-none bg-white font-semibold"
                >
                  <option value="Super Admin">Super Admin (Akses Penuh)</option>
                  <option value="Admin Konten">Admin Konten (Program, Berita, Teks)</option>
                  <option value="Admin Donasi">Admin Donasi (Verifikasi & Laporan)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#071F20] block">
                  {editingUser ? 'Password Baru (Opsional)' : 'Password Awal *'}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={editingUser ? 'Biarkan kosong jika tidak diubah' : 'Minimal 6 karakter'}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs outline-none font-mono"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#008284] hover:bg-[#006769] text-white text-xs font-extrabold shadow-xs"
                >
                  {editingUser ? 'Perbarui Akses' : 'Simpan Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
