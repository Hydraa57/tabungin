export function exportToExcel(rows, filename='Transaksi.csv'){
  const headers = ['tanggal','tipe','kategori','prioritas','deskripsi','jumlah'];
  const csv = [headers.join(',')].concat(
    rows.map(r => [
      r.tanggal, r.tipe, r.kategori ?? '', r.prioritas ?? '',
      (r.deskripsi||'').replace(/,/g,';'),
      r.jumlah
    ].join(','))
  ).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename.endsWith('.csv') ? filename : filename + '.csv';
  a.click();
  URL.revokeObjectURL(url);
}
