import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/shared';
import { clearTokens,getRefreshToken,setTokens } from '../services/api';
const AuthContext=createContext(null);
const SESSION_KEY='skillnet_user';
export function AuthProvider({children}){
 const [user,setUser]=useState(()=>{try{return JSON.parse(sessionStorage.getItem(SESSION_KEY))}catch{return null}});
 const [loading,setLoading]=useState(false);
 useEffect(()=>{if(user?.email==='seeker@skillnet.demo'&&user.name==='Nadia Rahman'){const updated={...user,name:'Shohug'};setUser(updated);sessionStorage.setItem(SESSION_KEY,JSON.stringify(updated));}},[user]);
 const clear=()=>{clearTokens();setUser(null);sessionStorage.removeItem(SESSION_KEY)};
 useEffect(()=>{window.addEventListener('skillnet:unauthorized',clear);return()=>window.removeEventListener('skillnet:unauthorized',clear)},[]);
 const persist=result=>{setTokens({access:result.access,refresh:result.refresh});setUser(result.user);sessionStorage.setItem(SESSION_KEY,JSON.stringify(result.user));return result.user};
 const login=async(data)=>{setLoading(true);try{return persist(await authService.login(data))}finally{setLoading(false)}};
 const register=async(data)=>{setLoading(true);try{return persist(await authService.register(data))}finally{setLoading(false)}};
 const logout=async()=>{const refresh=getRefreshToken();try{if(refresh)await authService.logout(refresh)}finally{clear()}};
 const value=useMemo(()=>({user,loading,login,register,logout,isAuthenticated:!!user}),[user,loading]);
 return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
export const useAuth=()=>useContext(AuthContext);
