import React from 'react';
export default function Button({ children, variant='solid', ...rest }){
  const styles = {
    padding:'10px 12px', borderRadius:12, border:'1px solid var(--border)',
    background: variant==='ghost' ? 'transparent' : 'linear-gradient(180deg, #4776ff, #335dff)',
    color: variant==='ghost' ? 'var(--text)' : '#fff', fontWeight:800, cursor:'pointer'
  };
  return <button {...rest} style={styles}>{children}</button>;
}
