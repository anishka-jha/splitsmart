import {test} from 'node:test';
import assert from 'node:assert/strict';
import {balances,simplify,paidAmounts,validatePaidBy} from '../src/engine.js';
const members=['a','b','c'].map(id=>({id}));
test('two payers credited for actual contributions and settlements clear',()=>{const g={members,expenses:[{amount:120000,paidBy:{a:80000,b:40000},shares:{a:40000,b:40000,c:40000}}],payments:[]};assert.deepEqual(balances(g),{a:40000,b:0,c:-40000});g.payments=simplify(balances(g));assert.deepEqual(balances(g),{a:0,b:0,c:0});});
test('three unequal payers preserve zero-sum balances',()=>{const g={members,expenses:[{amount:120000,paidBy:{a:60000,b:50000,c:10000},shares:{a:20000,b:40000,c:60000}}],payments:[]};assert.deepEqual(balances(g),{a:40000,b:10000,c:-50000});assert.equal(Object.values(balances(g)).reduce((s,v)=>s+v,0),0);});
test('legacy single-payer expenses remain compatible',()=>{assert.deepEqual(paidAmounts({payer:'a',amount:500}),{a:500});});
test('reject mismatched, unknown, negative or empty payer contributions',()=>{assert.throws(()=>validatePaidBy(500,{a:499},members));assert.throws(()=>validatePaidBy(500,{z:500},members));assert.throws(()=>validatePaidBy(500,{a:-100,b:600},members));assert.throws(()=>validatePaidBy(500,{},members));});
