/* Offline queue and immutable event reducer; usable without a network or auth SDK. */
(function(root){
'use strict';
const fields=['completed','bookmarks','notes','answers'];
const empty=()=>({completed:[],bookmarks:[],notes:{},answers:{}});
const copy=x=>JSON.parse(JSON.stringify(x));
const safe=k=>typeof k==='string'&&k.length>0&&k.length<=200&&!['__proto__','constructor','prototype'].includes(k);
function valid(op){
 if(!op||!fields.includes(op.kind)||!safe(op.item))return false;
 const v=op.value;
 if(['completed','bookmarks'].includes(op.kind))return typeof v==='boolean';
 if(op.kind==='notes')return typeof v==='string'&&v.length<=20000;
 return v&&Number.isInteger(v.answer)&&v.answer>=0&&v.answer<=2&&typeof v.at==='string';
}
function apply(s,op){
 if(!valid(op))throw Error('Invalid learning event');
 if(['completed','bookmarks'].includes(op.kind))s[op.kind]=op.value?[...new Set([...s[op.kind],op.item])]:s[op.kind].filter(x=>x!==op.item);
 else s[op.kind][op.item]=copy(op.value);
 return s;
}
function diff(before,after,id){
 const out=[];
 for(const kind of fields){
  const a=before[kind],b=after[kind];
  const keys=['completed','bookmarks'].includes(kind)?new Set([...a,...b]):new Set([...Object.keys(a),...Object.keys(b)]);
  for(const item of keys){
   const av=Array.isArray(a)?a.includes(item):a[item],bv=Array.isArray(b)?b.includes(item):b[item];
   if(JSON.stringify(av)!==JSON.stringify(bv)&&bv!==undefined){const op={event_id:id(),kind,item,value:copy(bv)};if(valid(op))out.push(op);}
  }
 }
 return out;
}
function materialize(base,pending){return pending.reduce(apply,copy(base));}
root.LearningSyncCore={empty,copy,valid,apply,diff,materialize};
if(typeof module!=='undefined')module.exports=root.LearningSyncCore;
})(typeof window==='undefined'?globalThis:window);
