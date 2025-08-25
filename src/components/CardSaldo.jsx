import React from 'react';
import { rupiah } from '../utils/numberFormat';
export default function CardSaldo({ saldo=0 }){
  return (
    <div className="card">
      <div className="section-title">💰 Saldo Terkini</div>
      <div style={{fontSize:28, fontWeight:900}}>Rp{rupiah(saldo)}</div>
    </div>
  );
}
