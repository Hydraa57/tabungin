import React, { useMemo } from 'react';
export default function CategoryChips({ transaksi=[], onPick, fallback=[] }){
  const top = useMemo(()=>{
    if(!transaksi?.length) return fallback.slice(0,8);
    const map={}; transaksi.forEach(t=>{ if(t.tipe==='Pengeluaran' && t.kategori){ map[t.kategori]=(map[t.kategori]||0)+1; } });
    return Object.entries(map).sort((a,b)=>b[1]-a[1]).map(([k])=>k).slice(0,8);
  },[transaksi,fallback]);
  if(!top.length) return null;
  return (
    <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginTop:10 }}>
      {top.map(k=>(
        <button key={k} onClick={()=>onPick?.(k)} className="chip"
          style={{ padding:'6px 10px', borderRadius:999, border:'1px solid var(--border)',
          background:'color-mix(in hsl, var(--card,#0b1220) 92%, transparent)', color:'var(--text)', fontSize:12.5 }}>
          {k}
        </button>
      ))}
    </div>
  );
}
