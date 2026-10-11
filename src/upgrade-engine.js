import {allocate} from './engine.js';
// All amounts are integer cents. Limits describe capacity, never consent.
export function planUpgrade(base,total,members,responses={}) {
 if(!Number.isSafeInteger(base)||base<=0||!Number.isSafeInteger(total)||total<base)throw Error('Plan cost must be at least the positive baseline.');
 const ids=members.map(m=>m.id),baseline=allocate(base,ids),extra=total-base;
 const capacity=Object.fromEntries(ids.map(k=>{const r=responses[k]||{},max=r.max??baseline[k],sponsor=r.sponsor||0;if(!Number.isSafeInteger(max)||max<0||!Number.isSafeInteger(sponsor)||sponsor<0)throw Error('Contribution limits must be valid amounts.');return [k,Math.max(0,Math.min(max-baseline[k],r.upgrade?extra:sponsor))];}));
 const baseShortfall=ids.reduce((s,k)=>s+Math.max(0,baseline[k]-(responses[k]?.max??baseline[k])),0);
 const extras=Object.fromEntries(ids.map(k=>[k,0]));let remaining=extra;
 while(remaining>0){const available=ids.filter(k=>capacity[k]>extras[k]);if(!available.length)break;const round=allocate(remaining,available);let used=0;for(const k of available){const n=Math.min(round[k],capacity[k]-extras[k]);extras[k]+=n;used+=n;}remaining-=used;if(!used)break;}
 const shares=Object.fromEntries(ids.map(k=>[k,baseline[k]+extras[k]]));
 return {baseline,extras,shares,shortfall:remaining+baseShortfall,funded:remaining===0&&baseShortfall===0,extra};
}
