import React,{useState,useEffect,useRef} from 'react';
import {prepareChatDraft} from './chat-engine.js';

export default function ChatToSplit({g,money,onReview}){
 const [text,setText]=useState(''),[reply,setReply]=useState(''),[result,setResult]=useState(null),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const controller=useRef(null),membersKey=JSON.stringify(g.members);
 useEffect(()=>()=>controller.current?.abort(),[]);
 useEffect(()=>{controller.current?.abort();setResult(null);setError('');setReply('');},[membersKey,g.currency]);
 const example=`${g.members[0]?.name} ne 800 pay kiye, ${g.members[1]?.name||g.members[0]?.name} ne 400. Dinner total 1200 tha. ${g.members.map(m=>m.name).join(', ')} mein equally split karo.`;
 const generate=async e=>{
  e.preventDefault();const combined=reply.trim()?`${text}\nClarification: ${reply}`:text;
  controller.current?.abort();const current=new AbortController();controller.current=current;
  setBusy(true);setError('');setResult(null);
  try{
   const response=await fetch('/api/chat-to-split',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:combined,members:g.members.map(({id,name})=>({id,name})),currency:g.currency}),signal:current.signal});
   const type=response.headers.get('content-type')||'';
   if(!type.includes('application/json'))throw Error('AI backend is not running here. Use the live website, or run the linked Vercel development server.');
   const data=await response.json();if(!response.ok)throw Error(data.error||'Unable to create a draft.');
   const prepared=prepareChatDraft(data.draft,g.members);
   if(current.signal.aborted)return;
   setResult({...data,prepared});setText(combined);setReply('');
  }catch(err){if(err.name!=='AbortError'&&!current.signal.aborted)setError(err.message);}
  finally{if(controller.current===current)setBusy(false);}
 };
 const cancel=()=>{controller.current?.abort();setBusy(false);};
 return <div className="chat-split">
  <div className="upgrade-hero"><span className="eyebrow">TYPE THE STORY. CHECK THE MATH.</span><h2>Group-chat chaos.<br/>One clean expense.</h2><p>Describe a bill in English, Hindi or Hinglish. AI reads the details; you review every amount before saving.</p></div>
  <div className="upgrade-grid"><section className="panel"><h3>01 / Tell us what happened</h3>
   <form onSubmit={generate}><label>One expense, in your own words<textarea aria-label="Expense message" rows="6" maxLength={3000} value={text} onChange={e=>{cancel();setText(e.target.value);setResult(null);setError('');}} placeholder={example} required/></label>
    <button type="button" className="new-group" disabled={busy} onClick={()=>{setText(example);setResult(null);setError('');}}>Try a message with your crew ↗</button>
    {result?.prepared.questions.length>0&&<div className="chat-questions"><h3>A few details first</h3>{result.prepared.questions.map((q,i)=><p key={i}>{q}</p>)}<label>Your clarification<textarea aria-label="Clarification" rows="3" maxLength={1000} value={reply} onChange={e=>setReply(e.target.value)} required/></label></div>}
    <p className="muted">Only this message, crew names/IDs and group currency are sent to Vercel AI Gateway and its model provider. Your expense history and receipt images are not sent.</p>
    <button className="primary" disabled={busy||!text.trim()}>{busy?'Reading your message…':result?.prepared.questions.length?'Send clarification ↗':'Create expense draft ✦'}</button>{busy&&<button type="button" onClick={cancel}>Cancel</button>}
   </form>{error&&<p className="error" role="alert">{error}</p>}
  </section><section className="panel"><span className="eyebrow">02 / YOUR CALL, ALWAYS</span><h3>{result?.prepared.expense?'Here’s the draft. Check it.':'A draft, never an automatic charge.'}</h3>
   {result?.prepared.expense?<><p>{result.draft.explanation}</p><h2>{result.prepared.expense.title}</h2><strong>{money(result.prepared.expense.amount)}</strong><p className="muted">{result.prepared.expense.category} · {result.prepared.expense.mode} split</p>
    <div className="chat-summary">{g.members.map(m=><div className="history-row" key={m.id}><b>{m.name}</b><span>Paid {money(result.prepared.expense.paidBy[m.id]||0)}<br/>Share {money(result.prepared.expense.shares[m.id]||0)}</span></div>)}</div>
    <button className="dark wide" onClick={()=>onReview(result.prepared.expense,()=>{setResult(null);setText('');setReply('');})}>Review / edit before saving ↗</button><p className="muted">Nothing is saved yet. The regular expense form lets you correct payers, items and shares, then explicitly save.</p><small className="muted">Model: {result.model}</small>
   </>:<><p>“A paid 800, B paid 400; split dinner equally.”</p><p>Multiple payers, exact amounts, percentages, weighted shares and item assignments can all become an editable draft.</p><p className="muted">Unclear names or missing details trigger questions. The financial engine checks sums and rounding. AI can make mistakes—always review.</p></>}
  </section></div>
 </div>;
}
