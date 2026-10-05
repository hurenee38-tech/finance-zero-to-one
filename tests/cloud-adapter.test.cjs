const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict'),{randomUUID}=require('node:crypto');
const C=require('../sync-core.js');
function device(server){
 const storage={},handlers={},h={state:{...C.empty(),mode:'plain',year:'2027'},render(){},set(s){this.state=s}};
 let callback;
 const client={auth:{onAuthStateChange(f){callback=f},async getSession(){return{data:{session:{user:{id:'A',email:'a@example.test'}}}}}},
  async rpc(_,args){for(const op of args.operations){if(!server.rows.some(x=>x.event_id===op.event_id))server.rows.push({...op,seq:server.rows.length+1,received_at:'2026-10-06'});}if(server.failOnce){server.failOnce=false;return{error:Error('response lost')}}return{}},
  from(){let cursor=0;const q={select(){return q},eq(){return q},gt(_,v){cursor=v;return q},order(){return q},async limit(n){return{data:server.rows.filter(x=>x.seq>cursor).slice(0,n)}}};return q}};
 const localStorage=new Proxy(storage,{get(t,k){if(k==='getItem')return k=>t[k]??null;if(k==='setItem')return(k,v)=>{t[k]=v};if(k==='removeItem')return k=>delete t[k];return t[k]}});
 const ctx={window:null,LearningSyncCore:C,LEARNING_CLOUD:{enabled:true,url:'https://example.supabase.co',publishableKey:'sb_publishable_test'},supabase:{createClient:()=>client},localStorage,
  navigator:{onLine:true},crypto:{randomUUID},location:{hash:'#home'},document:{hidden:false,activeElement:null,querySelector:()=>null,querySelectorAll:()=>[],addEventListener(){}},addEventListener(n,f){handlers[n]=f},setTimeout(){return 1},clearTimeout(){},setInterval(){},console};ctx.window=ctx;
 vm.createContext(ctx);vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'../cloud-sync.js'),'utf8'),ctx);
 return{api:ctx.LearningCloud,h,ctx,storage,start:()=>ctx.LearningCloud.start(h),async edit(fn){fn(h.state);ctx.LearningCloud.capture(h.state)}};
}
(async()=>{
 const server={rows:[]},a=device(server),b=device(server);await a.start();await b.start();
 await a.edit(s=>s.completed.push('l01'));await b.edit(s=>s.bookmarks.push('l02'));
 await a.api.sync();await b.api.sync();await a.api.sync();
 assert.deepEqual(a.h.state.completed,['l01']);assert.deepEqual(a.h.state.bookmarks,['l02']);assert.equal(JSON.stringify(a.h.state),JSON.stringify(b.h.state));
 a.ctx.navigator.onLine=false;
 await a.edit(s=>s.notes.l01='first');await a.edit(s=>s.notes.l01='second');
 await a.api.sync();assert.equal(server.rows.filter(x=>x.kind==='notes').length,0);
 a.ctx.navigator.onLine=true;server.failOnce=true;await a.api.sync();await a.api.sync();
 assert.equal(server.rows.filter(x=>x.kind==='notes').length,2);assert.equal(a.h.state.notes.l01,'second');
 await b.api.sync();assert.equal(b.h.state.notes.l01,'second');
 await b.edit(s=>s.bookmarks=[]);await b.api.sync();await a.api.sync();assert.deepEqual(a.h.state.bookmarks,[]);
 assert.equal(a.storage['finance01-progress-v2'],undefined);
 console.log('PASS: two simulated devices converge; offline edits ordered; lost-response replay idempotent; unstar propagates; account state never written to guest');
})();
