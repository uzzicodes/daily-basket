'use client';
import { useState } from 'react';
import { X, ListChecks, Upload, MessageCircle, Check } from 'lucide-react';
import { useCart } from './CartProvider';
import Modal from './Modal';
import { STORE } from '@/lib/constants';
export default function PaperListModal({whatsappNumber}: {whatsappNumber:string}) {
  const {paperOpen,setPaperOpen,area}=useCart();const [text,setText]=useState('');const [file,setFile]=useState<File|null>(null);const [error,setError]=useState('');const [busy,setBusy]=useState(false);
  async function send() {
    setError('');if(!whatsappNumber){setError('The store WhatsApp number has not been configured yet.');return;}
    if(!text.trim()&&!file){setError('Type your grocery list or choose a photo.');return;}
    const message=`${STORE}\nPlease pack my grocery list.\nDelivery area: ${area}\n\n${text.trim()}${file?'\nI am sending a photo of my handwritten grocery list.':''}\n\nPlease confirm availability, price and delivery time.`;
    const url=`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    if(file && navigator.canShare?.({files:[file]})) {setBusy(true);try{await navigator.share({files:[file],text:message,title:'My Askari Departmental Store grocery list'});}catch(e){if((e as Error).name!=='AbortError')setError('Photo sharing failed. Open WhatsApp and attach the selected photo.');}finally{setBusy(false);} }
    else {window.open(url,'_blank','noopener,noreferrer');if(file)setError('WhatsApp opened. Use its attachment button to add your selected photo; WhatsApp links cannot attach files automatically.');}
  }
  return <Modal open={paperOpen} onClose={()=>setPaperOpen(false)} label="Send your grocery list"><div className="modal-header"><span className="modal-icon"><ListChecks/></span><button className="icon-button" onClick={()=>setPaperOpen(false)} aria-label="Close grocery list"><X/></button></div><p className="eyebrow">THE WAY YOU ALWAYS SHOPPED</p><h2>Your list. Our little help.</h2><p className="muted">A handwritten list, a quick note, or last month’s essentials. Send it over and our counter team will do the picking.</p><label className="field">Your grocery list<textarea rows={6} value={text} onChange={e=>setText(e.target.value)} maxLength={6000} placeholder={'5kg atta\n1 litre milk × 4\nTapal tea\nShan biryani masala'}/></label><label className="upload-area"><Upload size={22}/><strong>{file?file.name:'Or add a photo of your paper list'}</strong><span>JPG, PNG or WebP · up to 10 MB</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>{const selected=e.target.files?.[0];if(selected&&selected.size<=10*1024*1024&&['image/jpeg','image/png','image/webp'].includes(selected.type)){setFile(selected);setError('');}else {setFile(null);setError('Choose a JPG, PNG or WebP photo under 10 MB.');}}}/></label><p className="photo-note">On supported phones, choose WhatsApp from the share menu and select the store chat. On desktop, attach your photo in WhatsApp after it opens.</p>{error&&<p className="form-message" role="alert">{error}</p>}<button className="primary wide" disabled={busy} onClick={send}><MessageCircle size={18}/>{busy?'Opening share menu…':'Send via WhatsApp'}</button><p className="modal-footnote"><Check size={13}/>We confirm the price before packing.</p></Modal>;
}
