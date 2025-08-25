import React,{createContext,useContext,useEffect,useState} from 'react'
import { auth } from '../firebase'
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth'

const AuthCtx = createContext(null)
export function AuthProvider({ children }){
  const [user,setUser]=useState(null)
  const [loading,setLoading]=useState(true)
  useEffect(()=>{
    const unsub = onAuthStateChanged(auth, u=>{ setUser(u); setLoading(false) })
    return ()=>unsub()
  },[])
  const value = {
    user, loading,
    login: (email,pass)=>signInWithEmailAndPassword(auth,email,pass),
    register: (email,pass)=>createUserWithEmailAndPassword(auth,email,pass),
    logout: ()=>signOut(auth)
  }
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}
export const useAuth=()=>useContext(AuthCtx)
