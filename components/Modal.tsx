'use client';
import { useEffect, useRef, type ReactNode } from 'react';
export default function Modal({open,onClose,label,drawer=false,children}: {open:boolean;onClose:()=>void;label:string;drawer?:boolean;children:ReactNode}) {
  const ref=useRef<HTMLDialogElement>(null);
  useEffect(()=>{const dialog=ref.current;if(!dialog)return;if(open && !dialog.open) dialog.showModal();else if(!open && dialog.open) dialog.close(); if(open){const previous=document.body.style.overflow;document.body.style.overflow='hidden';return ()=>{document.body.style.overflow=previous;};}},[open]);
  return <dialog ref={ref} className={drawer?'dialog drawer':'dialog'} aria-label={label} onCancel={onClose} onClick={e=>{if(e.target===ref.current)onClose();}}>{children}</dialog>;
}
