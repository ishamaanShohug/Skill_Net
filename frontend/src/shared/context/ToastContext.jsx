import { createContext,useContext,useState } from 'react';
import { CheckCircle2, X } from 'lucide-react';
const ToastContext=createContext(null);
export function ToastProvider({children}){const [toasts,setToasts]=useState([]);const show=(message)=>{const id=Date.now();setToasts(t=>[...t,{id,message}]);setTimeout(()=>setToasts(t=>t.filter(x=>x.id!==id)),3200)};return <ToastContext.Provider value={{show}}>{children}<div className="toast-stack" aria-live="polite">{toasts.map(t=><div className="toast" key={t.id}><CheckCircle2 size={18}/><span>{t.message}</span><button onClick={()=>setToasts(v=>v.filter(x=>x.id!==t.id))} aria-label="Dismiss"><X size={16}/></button></div>)}</div></ToastContext.Provider>}
export const useToast=()=>useContext(ToastContext);
