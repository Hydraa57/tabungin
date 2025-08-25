const KEY = 'dk_offline_queue';
function read(){ try{ return JSON.parse(localStorage.getItem(KEY)||'[]'); }catch{return []} }
function write(arr){ try{ localStorage.setItem(KEY, JSON.stringify(arr)); }catch{} }

export const queue = {
  add(item){ const arr = read(); arr.push(item); write(arr); },
  all(){ return read(); },
  clear(){ write([]); }
};
