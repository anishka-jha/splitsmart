import {allocate} from './engine.js';
// All amounts are integer cents. Limits describe capacity, never consent.
export function planUpgrade(base,total,members,responses={}) {
 if(!Number.isSafeInteger(base)||base<=0||!Number.isSafeInteger(total)||total<base)throw Error('Plan cost must be at least the positive baseline.');
 const ids=members.map(m=>m.id),baseline=allocate(base,ids),extra=total-base;
 // An explicit sponsorship offer authorizes that extra amount even when no
 // maximum is entered. An opt-in alone never authorizes an unlimited charge.
 const capacity=Object.fromEntries(ids.map(k=>{const r=responses[k]||{},sponsor=r.sponsor??0,max=r.max??baseline[k]+sponsor;if(!Number.isSafeInteger(max)||max<0||!Number.isSafeInteger(sponsor)||sponsor<0)throw Error('Contribution limits must be valid amounts.');return [k,Math.max(0,Math.min(max-baseline[k],r.upgrade?extra:sponsor))];}));
 const baseShortfall=ids.reduce((s,k)=>s+Math.max(0,baseline[k]-(responses[k]?.max??baseline[k])),0);
 const extras=Object.fromEntries(ids.map(k=>[k,0]));let remaining=extra;
 while(remaining>0){const available=ids.filter(k=>capacity[k]>extras[k]);if(!available.length)break;const round=allocate(remaining,available);let used=0;for(const k of available){const n=Math.min(round[k],capacity[k]-extras[k]);extras[k]+=n;used+=n;}remaining-=used;if(!used)break;}
 const shares=Object.fromEntries(ids.map(k=>[k,baseline[k]+extras[k]]));
 return {baseline,extras,shares,capacity,upgradeShortfall:remaining,baseShortfall,shortfall:remaining+baseShortfall,funded:remaining===0&&baseShortfall===0,extra};
}

// Bind shared-device confirmations to the precise proposal and crew. Changes
// invalidate them synchronously, including member changes outside this screen.
export function upgradeAgreementKey(members,draft){
 const {title,base,options,chosen,responses,payer,multi,paidValues,category}=draft;
 return JSON.stringify({members:members.map(({id,name})=>({id,name})),title,base,options,chosen,responses,payer,multi,paidValues,category});
}
export function hasUpgradeAgreement(plan,members,draft){
 return !!plan?.funded&&members.length>0&&draft.approvals?.key===upgradeAgreementKey(members,draft)&&members.every(m=>draft.approvals.members[m.id]===true);
}
