import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#6366F1','#22C55E','#F59E0B','#06B6D4','#EF4444','#8B5CF6','#10B981','#F97316'];

export default function GrafikKategori({ transaksi=[] }){
  const data = useMemo(()=>{
    const map = {};
    transaksi.filter(t=>t.tipe==='Pengeluaran').forEach(t=>{
      map[t.kategori] = (map[t.kategori]||0) + t.jumlah;
    });
    return Object.entries(map).map(([name, value])=>({ name, value }));
  },[transaksi]);

  return (
    <div className="card">
      <div className="section-title">📊 Pengeluaran per Kategori</div>
      <div style={{height:260}}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" outerRadius={90} label>
              {data.map((e,i)=> <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
