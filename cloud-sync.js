/* Supabase adapter. Public configuration only; sessions are handled by the official SDK. */
(function(){
'use strict';
const C=window.LearningSyncCore, cfg=window.LEARNING_CLOUD||{};
const guestKey='finance01-progress-v2', prefix='finance01-cloud-v1:';
let operationClock=0;
let client=null,user=null,env=null,previous=C.empty(),hooks=null,busy=false,timer=null,status='尚未连接云端',ready=false;
const clone=C.copy;
const accountKey=uid=>prefix+uid+':cache';
const opPrefix=uid=>prefix+uid+':op:';
const pending=uid=>Object.keys(localStorage).filter(k=>k.startsWith(opPrefix(uid))).map(k=>JSON.parse(localStorage.getItem(k))).sort((a,b)=>(a.client_order-b.client_order)||a.event_id.localeCompare(b.event_id));
const writeEnv=()=>localStorage.setItem(accountKey(user.id),JSON.stringify(env));
function notify(){const e=document.querySelector('#cloud-status');if(e)e.textContent=status;}
function setStatus(s){status=s;notify();}
function refreshView(){if(hooks&&location.hash==='#me'&&!document.activeElement?.matches('input,textarea'))hooks.render();}
function put(op){operationClock=Math.max(operationClock+1,Date.now()*1000);op.client_order=operationClock;localStorage.setItem(opPrefix(user.id)+op.event_id,JSON.stringify(op));}
function capture(s){
 if(user&&!env)throw Error('account cache unavailable');
 if(!user){localStorage.setItem(guestKey,JSON.stringify(s));return;}
 const ops=C.diff(previous,s,()=>crypto.randomUUID());
 ops.forEach(put);previous=clone(s);
 env.mode=s.mode;env.year=s.year;writeEnv();
 if(ops.length){setStatus(navigator.onLine?'已保存在本机 · 等待同步':'离线 · 联网后同步');schedule();}
}
function updateLocal(){
 const s={...C.materialize(env.base,pending(user.id)),mode:env.mode||'plain',year:env.year||'2027'};
 previous=clone(s);hooks.set(s);refreshView();
}
function schedule(){clearTimeout(timer);timer=setTimeout(sync,900);}
async function sync(){
 if(!user||!client||busy)return;
 if(!navigator.onLine){setStatus('离线 · 修改已保存在本机');return;}
 busy=true;const uid=user.id;setStatus('正在同步…');
 try{
  let ops=pending(uid);
  // Send a bounded snapshot; edits made during this request stay queued.
  const sent=ops.slice(0,100);
  if(sent.length){const {error}=await client.rpc('append_learning_events',{operations:sent});if(error)throw error;}
  if(user?.id!==uid)return;
  // Pull before acknowledging the queue: a lost response is safe to replay.
  for(;;){
   const {data,error}=await client.from('learning_events').select('seq,event_id,kind,item,value,received_at').eq('user_id',uid).gt('seq',env.cursor).order('seq').limit(1000);
   if(error)throw error;if(user?.id!==uid)return;
   for(const op of data){C.apply(env.base,op);env.cursor=Number(op.seq);if(op.kind==='notes'){env.history[op.item] ||= [];if(!env.history[op.item].some(x=>x.event_id===op.event_id))env.history[op.item].push(op);}}
   // Durably store the server snapshot before removing any pending operations.
   writeEnv();
   if(data.length<1000)break;
  }
  if(user?.id!==uid)return;
  sent.forEach(op=>localStorage.removeItem(opPrefix(uid)+op.event_id));
  updateLocal();env.lastSync=new Date().toISOString();writeEnv();
  const left=pending(uid).length;
  setStatus(left?`还有 ${left} 项待同步`:'已同步 · '+new Date().toLocaleTimeString('zh-CN',{hour12:false}));
  if(left)schedule();
 }catch(e){setStatus('同步未完成 · 本机记录已保留，可重试');}
 finally{busy=false;notify();}
}
function readGuest(){try{return JSON.parse(localStorage.getItem(guestKey)||'null')||{...C.empty(),mode:'plain',year:'2027'}}catch{return {...C.empty(),mode:'plain',year:'2027'}}}
async function switchUser(next){
 if(user?.id===next?.id&&ready)return;
 user=next;ready=true;
 if(!user){env=null;previous=C.empty();hooks.set(readGuest());setStatus('未登录 · 使用本机记录');refreshView();return;}
 try{
  env=JSON.parse(localStorage.getItem(accountKey(user.id))||'null')||{base:C.empty(),cursor:0,history:{},migrated:false};
  updateLocal();setStatus('已登录 · 正在检查同步');refreshView();await sync();
 }catch{env=null;setStatus('本机存储异常，请先导出备份后重试');}
}
function panel(esc){
 let body='';
 if(!cfg.enabled)body='<p>云端同步正在配置。当前继续使用本机记录，尚未开启跨设备同步。</p>';
 else if(!ready)body='<p>正在检查登录状态…</p><button id="cloud-retry-init">重试连接</button>';
 else if(!user)body='<form id="cloud-login"><label>邮箱<input id="cloud-email" type="email" autocomplete="email" required placeholder="输入你的邮箱"></label><button class="button" type="submit">发送登录邮件</button></form><p class="muted">在这台设备打开邮件中的登录链接。手机和电脑使用同一邮箱。本机旧记录不会自动上传。</p>';
 else body=`<p>已登录：${esc(user.email||'学习账号')}</p><div class="lesson-actions"><button id="cloud-now">立即同步</button><button id="cloud-out">退出登录</button></div>${env&&!env.migrated?'<p>可将登录前这台设备上的进度、收藏、笔记和答题记录合并到当前账号。原本机备份仍保留。</p><button id="cloud-migrate">导入本机旧记录到此账号</button>':''}<p class="muted">不同设备的操作会合并；同一项目按服务器收到的顺序更新。笔记的每个已同步版本都会保留，可在下方恢复。</p>`;
 let history='';
 if(user&&env)history=Object.entries(env.history).filter(([,a])=>a.length>1).map(([id,a])=>`<details><summary>${esc(id)} · 笔记版本 (${a.length})</summary>${a.slice().reverse().map(v=>`<div class="block"><small>${esc(v.received_at)}</small><p style="white-space:pre-wrap">${esc(v.value)}</p><button data-restore-note="${esc(v.event_id)}">恢复此版本</button></div>`).join('')}</details>`).join('');
 return `<section class="card section"><h2>账号与云端同步</h2><p id="cloud-status" role="status">${esc(status)}</p>${body}${history}</section>`;
}
function bind(){
 document.querySelector('#cloud-login')?.addEventListener('submit',async e=>{
  e.preventDefault();const button=e.target.querySelector('button');button.disabled=true;
  try{const email=document.querySelector('#cloud-email').value.trim();
   const {error}=await client.auth.signInWithOtp({email,options:{emailRedirectTo:location.origin+location.pathname+'#me'}});
   if(error)throw error;setStatus('请查看邮箱，在本设备打开登录链接（也请检查垃圾邮件）');
  }catch{setStatus('登录邮件发送失败，请稍后重试或检查邮箱配置');}finally{button.disabled=false;}
 });
 document.querySelector('#cloud-now')?.addEventListener('click',sync);
 document.querySelector('#cloud-retry-init')?.addEventListener('click',()=>start(hooks));
 document.querySelector('#cloud-out')?.addEventListener('click',async()=>{
  if(busy){setStatus('正在同步，请完成后退出');return;}
  await sync();if(pending(user.id).length){setStatus('仍有未同步修改，请联网同步后再退出');return;}
  const {error}=await client.auth.signOut({scope:'local'});if(error){setStatus('退出失败，请重试');return;}
  await switchUser(null);
 });
 document.querySelector('#cloud-migrate')?.addEventListener('click',()=>{
  if(!env||env.migrated)return;
  try{const guest=readGuest();C.diff(C.empty(),guest,()=>crypto.randomUUID()).forEach(put);env.migrated=true;writeEnv();updateLocal();schedule();}
  catch{setStatus('导入未完成，请先导出本机备份');}
 });
 document.querySelectorAll('[data-restore-note]').forEach(b=>b.onclick=()=>{
  const v=Object.values(env.history).flat().find(x=>x.event_id===b.dataset.restoreNote);if(!v)return;
  try{put({event_id:crypto.randomUUID(),kind:'notes',item:v.item,value:v.value});updateLocal();schedule();}catch{setStatus('无法保存，请先导出备份');}
 });
}
async function start(h){
 hooks=h;if(!cfg.enabled){setStatus('待配置 · 本机模式');return;}
 try{
  if(!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(cfg.url)||!cfg.publishableKey.startsWith('sb_publishable_'))throw Error('invalid public config');
  if(!window.supabase)await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='vendor/supabase-2.117.2.js';s.onload=resolve;s.onerror=reject;document.head.append(s);});
  if(!client){client=window.supabase.createClient(cfg.url,cfg.publishableKey,{auth:{detectSessionInUrl:true,persistSession:true,autoRefreshToken:true}});
   client.auth.onAuthStateChange((event,session)=>{setTimeout(()=>switchUser(session?.user||null),0);});}
  const {data,error}=await client.auth.getSession();if(error)throw error;await switchUser(data.session?.user||null);
 }catch{setStatus('云端连接失败 · 本机记录可继续使用');refreshView();}
}
window.addEventListener('online',sync);
window.addEventListener('focus',()=>{if(!document.hidden)sync();});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)sync();});
setInterval(()=>{if(!document.hidden)sync();},30000);
window.LearningCloud={start,capture,panel,bind,sync};
})();
