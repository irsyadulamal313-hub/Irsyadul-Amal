import {
  FoundationSettings,
  BankCategoryGroup,
  ProgramItem,
  OfficialReportItem,
  DocumentationItem,
  DonorRecord,
} from '../types';

export const FOUNDATION_INFO: FoundationSettings = {
  name: 'IRSYADUL AMAL',
  tagline: 'Lembaga Sosial & Kemanusiaan',
  address: 'Kp. Malajati, RT.004/RW.013, Jati, Kec. Tarogong Kaler, Kabupaten Garut, Jawa Barat 44150',
  whatsapp: '087804034140',
  whatsappUrl: 'https://wa.me/6287804034140?text=Assalamu%27alaikum%20Irsyadul%20Amal%2C%20saya%20ingin%20mendapatkan%20informasi%20mengenai%20program%20dan%20donasi.',
  email: 'irsyadulamal313@gmail.com',
};

export const OFFICIAL_BANK_GROUPS: BankCategoryGroup[] = [
  {
    category: 'DONASI UMUM',
    description: 'Penyaluran infaq, sedekah umum, dan operasional bantuan kemanusiaan tanggap bencana.',
    accounts: [
      {
        id: 'bank-umum-bsi',
        bankName: 'BSI',
        accountNumber: '7208684657',
        accountHolder: 'LKS IRSYADUL AMAL',
        category: 'DONASI UMUM',
        logoCode: 'bsi',
      },
      {
        id: 'bank-umum-bri',
        bankName: 'BRI',
        accountNumber: '345901047988536',
        accountHolder: 'LKS IRSYADUL AMAL',
        category: 'DONASI UMUM',
        logoCode: 'bri',
      },
    ],
  },
  {
    category: 'DONASI YAYASAN',
    description: 'Dana amanah pengembangan program dakwah, sosial pembinaan umat, dan kelembagaan.',
    accounts: [
      {
        id: 'bank-yayasan-bsi',
        bankName: 'BSI',
        accountNumber: '7149976625',
        accountHolder: 'Yys Irsyadul Amal Garut',
        category: 'DONASI YAYASAN',
        logoCode: 'bsi',
      },
      {
        id: 'bank-yayasan-mandiri',
        bankName: 'MANDIRI',
        accountNumber: '1770018349560',
        accountHolder: 'IRSYADUL AMAL GARUT',
        category: 'DONASI YAYASAN',
        logoCode: 'mandiri',
      },
    ],
  },
  {
    category: 'WAKAF AIR BERSIH',
    description: 'Program khusus pembangunan sumur bor, pipanisasi mata air, dan fasilitas sanitasi warga prasejahtera.',
    accounts: [
      {
        id: 'bank-wakaf-bsi',
        bankName: 'BSI',
        accountNumber: '7219866628',
        accountHolder: 'Wakaf Air Bersih Irsyadul Amal',
        category: 'WAKAF AIR BERSIH',
        logoCode: 'bsi',
      },
    ],
  },
];

// Flat list for quick selection
export const ALL_BANK_ACCOUNTS = OFFICIAL_BANK_GROUPS.flatMap((g) => g.accounts);

// Genuine Program Templates (Siap dikelola Admin / Database)
export const INITIAL_PROGRAMS: ProgramItem[] = [
  {
    id: 'prog-wakaf-air',
    title: 'Wakaf Sumur Bor & Instalasi Air Bersih Pelosok',
    category: 'Wakaf',
    status: 'BERJALAN',
    location: 'Kec. Tarogong Kaler & Wilayah Pelosok Garut',
    deadline: 'Program Berkelanjutan',
    description: 'Penyediaan fasilitas sumur bor dan pipanisasi air bersih untuk kebutuhan ibadah masjid serta warga desa yang kesulitan air.',
    fullStory: 'Kebutuhan air bersih adalah urat nadi kehidupan sehari-hari dan penunjang utama ibadah bersuci (wudhu). Di beberapa pelosok pedesaan Kabupaten Garut, warga dan santri harus menempuh jarak jauh ke sumber air saat musim kemarau. Program Wakaf Air Bersih Irsyadul Amal bergerak melakukan survei geolistrik, pengeboran sumur dalam, instalasi pipa, serta tandon penampungan air demi menjamin ketersediaan air bersih yang layak secara berkelanjutan.',
    background: 'Kondisi geografis perbukitan dan minimnya fasilitas pipanisasi di wilayah pelosok desa binaan.',
    objective: 'Menyediakan akses air bersih 24 jam untuk masjid, pesantren, serta ratusan kepala keluarga sekitar.',
    targetRecipients: 'Warga desa dan jamaah masjid pelosok',
    targetAmountText: 'Target akan diperbarui',
    collectedAmountText: 'Data donasi akan diperbarui',
    donorsCountText: 'Data akan diperbarui',
    latestUpdateText: 'Survei titik lokasi sumber air dan koordinasi perangkat desa sedang berlangsung.',
    imageUrl: 'https://images.unsplash.com/photo-1541252260730-0412e8e2108e?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1541252260730-0412e8e2108e?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=900&q=80',
    ],
    documentations: [
      'https://images.unsplash.com/photo-1541252260730-0412e8e2108e?auto=format&fit=crop&w=900&q=80',
    ],
  },
  {
    id: 'prog-quran',
    title: "Tebar Mushaf Al-Qur'an & Pembinaan Santri Pelosok",
    category: "Al-Qur'an",
    status: 'BERJALAN',
    location: 'Madrasah Diniyah & Ponpes Pelosok Garut',
    deadline: 'Program Berkelanjutan',
    description: "Pendistribusian mushaf Al-Qur'an terjemah standar dan buku tajwid bagi santri tahfidz di majelis taklim serta madrasah desa.",
    fullStory: "Semangat belajar para tunas bangsa untuk menghafal firman Allah sering kali terkendala ketiadaan mushaf Al-Qur'an yang layak. Banyak santri di madrasah desa yang masih menggunakan mushaf dengan lembaran terlepas atau bergantian satu sama lain. Melalui program ini, Irsyadul Amal memfasilitasi mushaf baru standar Kemenag yang kokoh agar hafalan dan tilawah para santri terus mengalir sepanjang masa.",
    background: 'Keterbatasan mushaf layak baca di madrasah diniyah dan ponpes pelosok Garut.',
    objective: 'Mencetak generasi penghafal Al-Quran dengan sarana tilawah yang layak dan bimbingan tajwid yang terarah.',
    targetRecipients: 'Santri santriwati madrasah dan majelis taklim',
    targetAmountText: 'Target akan diperbarui',
    collectedAmountText: 'Data donasi akan diperbarui',
    donorsCountText: 'Data akan diperbarui',
    latestUpdateText: 'Pendataan daftar madrasah dan pesantren penerima manfaat.',
    imageUrl: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=900&q=80',
    ],
    documentations: [
      'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=900&q=80',
    ],
  },
  {
    id: 'prog-yatim',
    title: 'Santunan Biaya Pendidikan & Nutrisi Yatim Dhuafa',
    category: 'Sosial',
    status: 'BERJALAN',
    location: 'Kp. Malajati & Sekitarnya, Garut',
    deadline: 'Program Berkelanjutan',
    description: 'Dukungan perlengkapan sekolah, uang saku pendidikan, dan paket sembako nutrisi bulanan untuk anak yatim berprestasi.',
    fullStory: 'Anak-anak yatim berhak meraih masa depan yang cerah dan pendidikan yang bermartabat. Irsyadul Amal hadir mendampingi kebutuhan dasar adik-adik yatim di lingkungan Garut agar mereka tidak putus sekolah, tercukupi nutrisinya, dan senantiasa merasa didampingi oleh masyarakat muslim yang peduli.',
    background: 'Beban ekonomi keluarga prasejahtera pasca wafatnya tulang punggung keluarga.',
    objective: 'Menjamin keberlanjutan sekolah dan nutrisi harian anak-anak yatim dhuafa.',
    targetRecipients: 'Anak-anak yatim & dhuafa',
    targetAmountText: 'Target akan diperbarui',
    collectedAmountText: 'Data donasi akan diperbarui',
    donorsCountText: 'Data akan diperbarui',
    latestUpdateText: 'Penyaluran berkala paket nutrisi dan verifikasi kelanjutan jenjang sekolah penerima santunan.',
    imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=900&q=80',
    ],
    documentations: [
      'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=900&q=80',
    ],
  },
  {
    id: 'prog-lansia',
    title: 'Peduli Lansia Dhuafa & Bantuan Pangan Sehat',
    category: 'Kemanusiaan',
    status: 'BERJALAN',
    location: 'Kabupaten Garut',
    deadline: 'Program Berkelanjutan',
    description: 'Kunjungan silaturahmi ke rumah lansia sebatang kara dengan menyalurkan kebutuhan bahan pangan pokok serta bantuan pemenuhan kesehatan.',
    fullStory: 'Di usia senja, banyak lansia prasejahtera yang berjuang seorang diri memenuhi nafkah harian. Melalui para relawan lapangan, Irsyadul Amal memberikan perhatian langsung dengan menyapa, mengantarkan beras dan lauk pauk sehat, serta mendampingi pengobatan ringan bagi para lansia.',
    background: 'Ketiadaan keluarga penanggung bagi kakek dan nenek prasejahtera di pedesaan.',
    objective: 'Menghadirkan kehangatan serta meringankan beban pemenuhan pangan harian lansia dhuafa.',
    targetRecipients: 'Lansia sebatang kara dan kaum dhuafa',
    targetAmountText: 'Target akan diperbarui',
    collectedAmountText: 'Data donasi akan diperbarui',
    donorsCountText: 'Data akan diperbarui',
    latestUpdateText: 'Kunjungan rutin berkala oleh tim relawan kemanusiaan.',
    imageUrl: 'https://images.unsplash.com/photo-1516307365426-bea591f05011?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1516307365426-bea591f05011?auto=format&fit=crop&w=900&q=80',
    ],
    documentations: [
      'https://images.unsplash.com/photo-1516307365426-bea591f05011?auto=format&fit=crop&w=900&q=80',
    ],
  },
  {
    id: 'prog-beasiswa',
    title: 'Beasiswa Pendidikan & Pembinaan Karakter Santri',
    category: 'Pendidikan',
    status: 'SEGERA DIMULAI',
    location: 'Pondok Pesantren Binaan Garut',
    deadline: 'Tahun Ajaran Baru',
    description: 'Program bantuan biaya kitab dan operasional pendidikan santri berprestasi dari kalangan keluarga kurang mampu.',
    fullStory: 'Pendidikan adalah sarana pemutus mata rantai kemiskinan. Program Beasiswa Santri Irsyadul Amal dirancang untuk membantu biaya SPP, pembelian kitab kuning, serta penguatan kapasitas akhlak dan kemandirian santri.',
    background: 'Banyak santri cerdas terhambat biaya operasional bulanan di pondok pesantren.',
    objective: 'Memberikan kepastian belajar bagi para calon da’i dan cendekiawan muslim di masa depan.',
    targetRecipients: 'Santri santriwati berprestasi dari keluarga dhuafa',
    targetAmountText: 'Target akan diperbarui',
    collectedAmountText: 'Data donasi akan diperbarui',
    donorsCountText: 'Data akan diperbarui',
    latestUpdateText: 'Tahap seleksi berkas dan wawancara calon penerima beasiswa tahun ajaran baru.',
    imageUrl: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=900&q=80',
    gallery: [],
    documentations: [],
  },
];

// Honest Reports Template (kosong sampai diunggah oleh admin resmi)
export const INITIAL_OFFICIAL_REPORTS: OfficialReportItem[] = [];

// Authentic Documentation items
export const INITIAL_DOCUMENTATION: DocumentationItem[] = [
  {
    id: 'doc-1',
    title: 'Distribusi Mushaf Al-Quran ke Majelis Santri',
    programName: "Tebar Mushaf Al-Qur'an",
    category: "Al-Qur'an",
    date: 'Dokumentasi Lapangan',
    location: 'Kabupaten Garut',
    imageUrl: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=800&q=80',
    story: 'Penyaluran mushaf Al-Quran titipan donatur kepada santri binaan untuk menunjang kegiatan mengaji harian.',
    targetBeneficiary: 'Santri & Pengajar Majelis',
  },
  {
    id: 'doc-2',
    title: 'Survei dan Persiapan Pengeboran Air Bersih',
    programName: 'Wakaf Sumur Bor & Air Bersih',
    category: 'Wakaf',
    date: 'Dokumentasi Lapangan',
    location: 'Tarogong Kaler & Sekitarnya',
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f8?auto=format&fit=crop&w=800&q=80',
    story: 'Pengecekan titik mata air dan koordinasi teknis pengeboran sarana air bersih untuk warga.',
    targetBeneficiary: 'Warga Sekitar & Jamaah',
  },
  {
    id: 'doc-3',
    title: 'Penyaluran Santunan Perlengkapan Belajar Yatim',
    programName: 'Santunan Yatim Dhuafa',
    category: 'Sosial',
    date: 'Dokumentasi Lapangan',
    location: 'Kp. Malajati & Sekitarnya, Garut',
    imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80',
    story: 'Pemberian santunan peralatan sekolah dan bantuan pangan penunjang kesehatan anak-anak yatim.',
    targetBeneficiary: 'Anak Yatim Dhuafa',
  },
  {
    id: 'doc-4',
    title: 'Silaturahmi dan Penyaluran Sembako Lansia Dhuafa',
    programName: 'Peduli Lansia Dhuafa',
    category: 'Kemanusiaan',
    date: 'Dokumentasi Lapangan',
    location: 'Kec. Tarogong Kaler, Garut',
    imageUrl: 'https://images.unsplash.com/photo-1516307365426-bea591f05011?auto=format&fit=crop&w=800&q=80',
    story: 'Relawan berkunjung langsung menyapa para lansia sebatang kara dan menyerahkan paket kebutuhan pangan pokok.',
    targetBeneficiary: 'Lansia Prasejahtera',
  },
];

// Helper to build whatsapp confirmation text
export function createWhatsAppDonationMessage(params: {
  programName?: string;
  nominal?: string;
  bankName?: string;
  accountHolder?: string;
}): string {
  const pName = params.programName?.trim() || '[NAMA PROGRAM]';
  const nom = params.nominal?.trim() || '[NOMINAL]';
  const bName = params.bankName?.trim() || '[NAMA BANK]';
  const aHolder = params.accountHolder?.trim() || '[NAMA REKENING]';

  return `Assalamu'alaikum Irsyadul Amal,

Saya telah melakukan donasi.

Program:
${pName}

Nominal:
Rp${nom}

Bank tujuan:
${bName}

Atas Nama:
${aHolder}

Saya akan mengirimkan bukti transfer melalui chat ini.

Terima kasih.`;
}
