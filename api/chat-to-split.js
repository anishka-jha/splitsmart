import {chatSchema,chatSystemPrompt,validateChatRequest,validateChatShape,prepareChatDraft} from '../src/chat-engine.js';

export const maxDuration=45;
// Best-effort per-instance throttling; production-wide limits belong in a
// shared store or the platform firewall. No prompt or ledger is persisted here.
const windows=new Map();
function allow(ip){const now=Date.now();for(const [key,v]of windows)if(now-v.start>60000)windows.delete(key);const entry=windows.get(ip)||{start:now,count:0};if(entry.count>=6)return false;entry.count++;windows.set(ip,entry);return true;}

export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='POST'){res.setHeader('Allow','POST');return res.status(405).json({error:'Use POST for Chat-to-Split.'});}
 const origin=req.headers.origin,host=req.headers.host;
 if(origin){try{if(new URL(origin).host!==host)return res.status(403).json({error:'Use Chat-to-Split from this website.'});}catch{return res.status(403).json({error:'Invalid request origin.'});}}
 let input;
 try{input=validateChatRequest(req.body);}catch(err){return res.status(400).json({error:err.message});}
 const token=process.env.AI_GATEWAY_API_KEY||process.env.VERCEL_OIDC_TOKEN;
 if(!token)return res.status(503).json({error:'AI is not configured on this server. You can still add expenses manually.',code:'AI_NOT_CONFIGURED'});
 const ip=String(req.headers['x-vercel-forwarded-for']||req.headers['x-forwarded-for']||req.socket?.remoteAddress||'local').split(',')[0];
 if(!allow(ip)){res.setHeader('Retry-After','60');return res.status(429).json({error:'Too many drafts. Wait a minute and try again.'});}
 try{
  const response=await fetch('https://ai-gateway.vercel.sh/v1/chat/completions',{
   method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},signal:AbortSignal.timeout(35000),
   body:JSON.stringify({model:process.env.AI_GATEWAY_MODEL||'google/gemini-3.8-flash',messages:[{role:'system',content:chatSystemPrompt},{role:'user',content:JSON.stringify(input)}],max_tokens:1800,response_format:{type:'json_schema',json_schema:{name:'expense_draft',schema:chatSchema}}})
  });
  const data=await response.json();
  if(!response.ok){
   const type=data.error?.type||data.error?.code;
   if(response.status===402||type==='customer_verification_required')return res.status(503).json({error:'AI credits need activation by the website owner. Manual expense entry works normally.',code:'AI_CREDITS_REQUIRED'});
   if(response.status===401||response.status===403)return res.status(503).json({error:'AI authentication needs attention from the website owner.',code:'AI_AUTH_REQUIRED'});
   if(response.status===429)return res.status(429).json({error:'The AI service is busy. Wait a moment and retry.'});
   return res.status(502).json({error:'AI could not create a draft. Retry or add the expense manually.'});
  }
  const raw=validateChatShape(JSON.parse(data.choices?.[0]?.message?.content||'null'));
  // The model schema is not enough: use the same financial engine as manual
  // entry before allowing the UI to offer a ledger preview.
  const prepared=prepareChatDraft(raw,input.members);
  return res.status(200).json({draft:raw,preview:prepared.expense,model:data.model||process.env.AI_GATEWAY_MODEL||'google/gemini-3.8-flash'});
 }catch(err){
  if(err.name==='TimeoutError'||err.name==='AbortError')return res.status(504).json({error:'AI took too long. Your expenses have not changed. Please retry.'});
  return res.status(422).json({error:'The AI draft could not pass financial validation. Clarify amounts and names, or use the manual form.'});
 }
}
