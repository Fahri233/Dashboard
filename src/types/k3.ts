export type LokasiType = 'Area Tunggu' | 'Meja Pendaftaran' | 'Ruang Pelayanan';

export type KategoriType = 'Ergonomi' | 'Biologis' | 'Fisik' | 'Psikososial' | 'Kimia';

export type TingkatRisikoType = 'Tinggi' | 'Sedang' | 'Rendah';

export type StatusType = 'Belum' | 'Proses' | 'Selesai';

export const VALID_LOKASI: LokasiType[] = ['Area Tunggu', 'Meja Pendaftaran', 'Ruang Pelayanan'];
export const VALID_KATEGORI: KategoriType[] = ['Ergonomi', 'Biologis', 'Fisik', 'Psikososial', 'Kimia'];
export const VALID_TINGKAT_RISIKO: TingkatRisikoType[] = ['Tinggi', 'Sedang', 'Rendah'];
export const VALID_STATUS: StatusType[] = ['Belum', 'Proses', 'Selesai'];

export interface K3Finding {
  id: string;
  no: number;
  tanggal: string; // dd/mm/yyyy
  tanggalIso: string; // yyyy-mm-dd
  lokasi: LokasiType;
  aktivitas: string;
  potensiBahaya: string;
  kategori: KategoriType;
  tingkatRisiko: TingkatRisikoType;
  pengendalian: string;
  status: StatusType;
  keterangan: string;
  raw?: {
    kategori?: string;
    pengendalian?: string;
    potensiBahaya?: string;
    tanggal?: string;
  };
}

export interface FilterState {
  lokasi: LokasiType[];
  kategori: KategoriType[];
  tingkatRisiko: TingkatRisikoType[];
  status: StatusType[];
  startDate?: string;
  endDate?: string;
  searchQuery?: string;
}

export type AnomalyType = 
  | 'normalization'
  | 'future_date'
  | 'whitespace'
  | 'potential_wrong_category'
  | 'spelling_inconsistency'
  | 'invalid_value';

export interface QualityAnomaly {
  id: string;
  findingNo: number;
  type: AnomalyType;
  field: string;
  message: string;
  originalValue: string;
  currentValue: string;
  severity: 'info' | 'warning' | 'error';
}

