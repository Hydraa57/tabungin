import { db } from '../firebase'
import { collection, addDoc, doc, onSnapshot, updateDoc, deleteDoc, setDoc, getDoc } from 'firebase/firestore'

export function subTransactions(uid, cb){
  const col = collection(db, 'users', uid, 'transactions')
  return onSnapshot(col, (snap)=>{
    const arr = snap.docs.map(d=>({ id:d.id, ...d.data() }))
    cb(arr)
  })
}
export async function addTransaction(uid, trx){
  const col = collection(db, 'users', uid, 'transactions')
  await addDoc(col, trx)
}
export async function updateTransaction(uid, id, payload){
  await updateDoc(doc(db,'users',uid,'transactions',id), payload)
}
export async function deleteTransaction(uid, id){
  await deleteDoc(doc(db,'users',uid,'transactions',id))
}

export async function setSettings(uid, obj){
  await setDoc(doc(db,'users',uid,'settings','app'), obj, { merge:true })
}
export async function getSettings(uid){
  const d = await getDoc(doc(db,'users',uid,'settings','app'))
  return d.exists()? d.data(): {}
}
