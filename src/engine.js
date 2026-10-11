export const id = () => crypto.randomUUID();
export function cents(value) { const n=Number(value); if(!Number.isFinite(n)||n<0) throw Error('Enter a valid positive amount.'); return Math.round(n*100); }
export function allocate(total, ids, weights=ids.map(()=>1)) {
 if(!ids.length) throw Error('Select at least one person.');
 if(weights.some(w=>!Number.isFinite(w)||w<0)||!weights.some(w=>w>0)) throw Error('Shares must be non-negative with at least one positive value.');
 const sum=weights.reduce((a,b)=>a+b,0), raw=weights.map(w=>total*w/sum), out=raw.map(Math.floor);
 const order=raw.map((v,i)=>({i,r:v-out[i]})).sort((a,b)=>b.r-a.r||a.i-b.i);
 for(let n=total-out.reduce((a,b)=>a+b,0),i=0;i<n;i++) out[order[i%order.length].i]++;
 return Object.fromEntries(ids.map((k,i)=>[k,out[i]]));
}
export function splitExpense(total, mode, selected, values={}, items=[]) {
 if(!Number.isSafeInteger(total)||total<=0) throw Error('Amount must be greater than zero.');
 if(mode==='items') {
  if(!items.length) throw Error('Add receipt items.'); const result={};let sum=0;
  items.forEach(item=>{if(!item.name.trim())throw Error('Give each item a name.');const amount=cents(item.amount);if(!amount)throw Error('Item amounts must be positive.');sum+=amount;const shares=allocate(amount,item.members);Object.entries(shares).forEach(([k,v])=>result[k]=(result[k]||0)+v);});
  if(sum!==total) throw Error('Receipt item total must match the expense amount.');return result;
 }
 if(!selected.length)throw Error('Select at least one person.');
 if(mode==='exact') {const amounts=selected.map(k=>cents(values[k]||0));if(amounts.reduce((a,b)=>a+b,0)!==total)throw Error('Exact shares must add up to the expense total.');return Object.fromEntries(selected.map((k,i)=>[k,amounts[i]]));}
 const weights=selected.map(k=>mode==='equal'?1:Number(values[k]||0));
 if(mode==='percentage'&&Math.abs(weights.reduce((a,b)=>a+b,0)-100)>0.000001)throw Error('Percentages must add up to 100.');
 return allocate(total,selected,weights);
}
export function balances(group) {
 const b=Object.fromEntries(group.members.map(m=>[m.id,0]));
 group.expenses.forEach(e=>{b[e.payer]=(b[e.payer]||0)+e.amount;Object.entries(e.shares).forEach(([k,v])=>b[k]=(b[k]||0)-v);});
 group.payments.forEach(p=>{b[p.from]=(b[p.from]||0)+p.amount;b[p.to]=(b[p.to]||0)-p.amount;});return b;
}
export function simplify(b) {
 const debt=Object.entries(b).filter(([,v])=>v<0).map(([id,v])=>({id,v:-v})).sort((a,b)=>b.v-a.v), credit=Object.entries(b).filter(([,v])=>v>0).map(([id,v])=>({id,v})).sort((a,b)=>b.v-a.v), result=[];let i=0,j=0;
 while(i<debt.length&&j<credit.length){const amount=Math.min(debt[i].v,credit[j].v);result.push({from:debt[i].id,to:credit[j].id,amount});debt[i].v-=amount;credit[j].v-=amount;if(!debt[i].v)i++;if(!credit[j].v)j++;}return result;
}
export const categories=['Food & drinks','Travel','Stay','Shopping','Activities','Other'];
export function demo() {
 const members=['You','Aanya','Kabir','Zoya'].map((name,i)=>({id:'m'+i,name}));const date=new Date().toISOString().slice(0,10);
 return [{id:id(),name:'Goa, no regrets',emoji:'🌴',currency:'INR',budget:3000000,members,expenses:[{id:id(),title:'Villa with a view',amount:1200000,payer:'m1',category:'Stay',date,mode:'equal',shares:allocate(1200000,members.map(m=>m.id)),items:[]},{id:id(),title:'Sunset tacos & mocktails',amount:248000,payer:'m0',category:'Food & drinks',date,mode:'equal',shares:allocate(248000,members.map(m=>m.id)),items:[]},{id:id(),title:'Scooter squad',amount:180000,payer:'m2',category:'Travel',date,mode:'equal',shares:allocate(180000,members.map(m=>m.id)),items:[]}],payments:[]}];
}
