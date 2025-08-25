import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { rupiah } from '../utils/numberFormat';

export default function GrafikTrenHarian({ transaksi=[] }){
  const data = useMemo(()=>{
    const map = {};
    transaksi.forEach(t=>{
      map[t.tanggal] = (map[t.tanggal]||0) + (t.tipe==='Pengeluaran' ? t.jumlah : -t.jumlah);
    });
    return Object.entries(map).sort((a,b)=>a[0].localeCompare(b[0])).map(([tanggal, value])=>({ tanggal, value }));
  },[transaksi]);
  return (
    <div className="card">
      <div className="section-title">📈 Tren Harian (Net)</div>
      <div style={{height:260}}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="tanggal" />
            <YAxis tickFormatter={(v)=>'Rp'+rupiah(v)} />
            <Tooltip formatter={(v)=>['Rp'+rupiah(v),'Net']} />
            <Line type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
