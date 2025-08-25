import {
  collection, addDoc, doc, updateDoc, deleteDoc, onSnapshot, query, orderBy, getDoc, setDoc
} from 'firebase/firestore';
import { db } from '../firebase';

export function subTransactions(uid, cb, onErr){
  const col = collection(db, 'users', uid, 'transactions');
  const q = query(col, orderBy('tanggal','asc'));
  return onSnapshot(q, (snap)=>{
    const arr = [];
    snap.forEach((d)=> arr.push({ id: d.id, ...d.data() }));
    cb(arr);
  }, onErr);
}

export async function addTransaction(uid, data){
  const col = collection(db, 'users', uid, 'transactions');
  return await addDoc(col, data);
}

export async function updateTransaction(uid, id, data){
  const ref = doc(db, 'users', uid, 'transactions', id);
  return await updateDoc(ref, data);
}

export async function removeTransaction(uid, id){
  const ref = doc(db, 'users', uid, 'transactions', id);
  return await deleteDoc(ref);
}

export async function getSettings(uid){
  const ref = doc(db, 'users', uid);
  const s = await getDoc(ref);
  return s.exists() ? s.data() : null;
}

export async function setSettings(uid, data){
  const ref = doc(db, 'users', uid);
  const prev = await getDoc(ref);
  if(prev.exists()) return await updateDoc(ref, data);
  return await setDoc(ref, data, { merge: true });
}
