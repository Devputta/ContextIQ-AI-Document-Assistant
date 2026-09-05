'use client';
import {createContext,useContext,useEffect,useState} from 'react';
import {apiFetch,clearToken,getToken,setToken} from '@/lib/api';
export type User={id:string;username:string;email:string;createdAt:string};
type Ctx={user:User|null;loading:boolean;login:(identifier:string,password:string)=>Promise<void>;register:(username:string,email:string,password:string)=>Promise<void>;logout:()=>void;refresh:()=>Promise<void>};
const AuthContext=createContext<Ctx|null>(null);
export function AuthProvider({children}:{children:React.ReactNode}){const[user,setUser]=useState<User|null>(null);const[loading,setLoading]=useState(true);
 const refresh=async()=>{if(!getToken()){setUser(null);setLoading(false);return}try{setUser(await apiFetch<User>('/api/auth/me'))}catch{clearToken();setUser(null)}finally{setLoading(false)}};
 useEffect(()=>{refresh()},[]);
 const login=async(identifier:string,password:string)=>{const d=await apiFetch<{accessToken:string;user:User}>('/api/auth/login',{method:'POST',body:JSON.stringify({identifier,password})});setToken(d.accessToken);setUser(d.user)};
 const register=async(username:string,email:string,password:string)=>{const d=await apiFetch<{accessToken:string;user:User}>('/api/auth/register',{method:'POST',body:JSON.stringify({username,email,password})});setToken(d.accessToken);setUser(d.user)};
 const logout=()=>{clearToken();setUser(null);window.location.href='/auth/login'};
 return <AuthContext.Provider value={{user,loading,login,register,logout,refresh}}>{children}</AuthContext.Provider>}
export function useAuth(){const c=useContext(AuthContext);if(!c)throw new Error('useAuth must be used inside AuthProvider');return c}
