import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { rupiah } from '../utils/numberFormat';

function weekOf(dateStr){
  const d = new Date(dateStr+'T00:00:00');
  const onejan = new Date(d.getFullYear(),0,1);
  const week = Math.ceil((((d - onejan) / 86400000) + onejan.getDay()+1)/7);
  return 'W'+week;
}

export default function GrafikMingguan({ transaksi=[] }){
  const data = useMemo(()=>{
    const map = {};
    transaksi.filter(t=>t.tipe==='Pengeluaran').forEach(t=>{
      const w = weekOf(t.tanggal);
      map[w] = (map[w]||0) + t.jumlah;
    });
    return Object.entries(map).sort((a,b)=>a[0].localeCompare(b[0])).map(([w, value])=>({ minggu:w, value }));
  },[transaksi]);
  return (
    <div className="card">
      <div className="section-title">🗓️ Pengeluaran Mingguan</div>
      <div style={{height:260}}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="minggu" />
            <YAxis tickFormatter={(v)=>'Rp'+rupiah(v)} />
            <Tooltip formatter={(v)=>['Rp'+rupiah(v),'Pengeluaran']} />
            <Bar dataKey="value" fill="#22c55e" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
