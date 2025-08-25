import React, { useEffect, useRef, useState } from 'react';

export default function NetworkBanner() {
  const [online, setOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [show, setShow] = useState(true);
  const [fading, setFading] = useState(false);
  const hideTimer = useRef(null); const removeTimer = useRef(null);

  const clearTimers = () => { if (hideTimer.current) clearTimeout(hideTimer.current);
    if (removeTimer.current) clearTimeout(removeTimer.current); hideTimer.current=null; removeTimer.current=null; };

  const scheduleAutoHide = (delay=5000) => {
    clearTimers();
    hideTimer.current = setTimeout(()=>{
      setFading(true);
      removeTimer.current = setTimeout(()=> setShow(false), 320);
    }, delay);
  };

  useEffect(()=>{
    if (online) { setShow(true); setFading(false); scheduleAutoHide(1500); }
    else { setShow(true); setFading(false); }
    const on=()=>{ setOnline(true); setShow(true); setFading(false); scheduleAutoHide(5000); };
    const off=()=>{ setOnline(false); setShow(true); setFading(false); clearTimers(); };
    window.addEventListener('online', on); window.addEventListener('offline', off);
    return ()=>{ window.removeEventListener('online', on); window.removeEventListener('offline', off); clearTimers(); };
  },[]);

  if (!show) return null;

  return (<>
    <style>{`
      .net-banner{ position:fixed; inset:auto 12px 12px 12px; z-index:1200; padding:10px 14px; border-radius:12px;
        font-weight:700; text-align:center; box-shadow:0 6px 16px rgba(0,0,0,.06); transform:translateY(12px);
        opacity:0; animation:nb-enter .28s ease forwards; transition:opacity .28s ease, transform .28s ease; }
      .net-banner.fade-out{ opacity:0; transform:translateY(8px); }
      @keyframes nb-enter { from{opacity:0; transform:translateY(10px);} to{opacity:1; transform:translateY(0);} }
    `}</style>
    <div className={`net-banner ${fading ? 'fade-out' : ''}`}
      style={{
        border:`1px solid ${online ? '#16a34a55' : '#ef444455'}`,
        background: online ? '#ecfdf5' : '#ffefef',
        color: online ? '#065f46' : '#b91c1c'
      }}>
      {online ? 'Online — perubahan akan tersinkron ke cloud.' : 'Offline — perubahan disimpan lokal & tersinkron saat online.'}
    </div>
  </>);
}
