import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

// Demo-only data. Accounts and permissions must be implemented server-side before launch.
const people = [
  {id:'ameer',name:'Ameer',role:'employee'},
  {id:'wes',name:'Wes',role:'employee'},
  {id:'ty',name:'Ty',role:'employee'},
  {id:'manager',name:'big L (Manager)',role:'manager'},
];
const initial = [
  {id:'s1',owner:'ameer',date:'2026-10-23',start:'15:00',end:'23:00',location:'Southern Comfort',position:'Lift Operator',note:'Need coverage for Friday pls.',status:'open',comments:[],offers:[]},
  {id:'s2',owner:'ty',date:'2026-10-27',start:'07:00',end:'15:00',location:'Ridge Runner',position:'Lift Operator',note:'Would appreciate the help!',status:'open',comments:[],offers:[]}
];
const personName = id => people.find(p=>p.id===id)?.name || 'Unknown';
const stamp = () => new Date().toLocaleString();
const clock = t => {const [h,m]=t.split(':').map(Number); return new Date(2026,0,1,h,m).toLocaleTimeString([], {hour:'numeric', minute:'2-digit'});};
function App(){
 const [user,setUser]=useState('ameer');
 const [page,setPage]=useState('board');
 const [shifts,setShifts]=useState(()=>{try{return JSON.parse(localStorage.getItem('shift-demo-v1'))||initial}catch{return initial}});
 const [emailLog,setEmailLog]=useState([]);
 const [selected,setSelected]=useState(null);
 const [filters,setFilters]=useState({location:'',position:''});
 const [draft,setDraft]=useState({date:'',start:'',end:'',location:'',position:'',note:''});
 const [comment,setComment]=useState('');
 const [rejectReasons,setRejectReasons]=useState({});
 useEffect(()=>localStorage.setItem('shift-demo-v1',JSON.stringify(shifts)),[shifts]);
 const current=people.find(p=>p.id===user);
 const active=shifts.find(s=>s.id===selected);
 const notify=(recipient,subject)=>setEmailLog(prev=>[{id:crypto.randomUUID(),recipient:personName(recipient),subject,at:stamp()},...prev]);
 const updateShift=(id, updater)=>setShifts(prev=>prev.map(s=>s.id===id?updater(s):s));
 const openShift=id=>{setSelected(id);setComment('');setPage('detail')};
 const post=e=>{e.preventDefault();if(!draft.date||!draft.start||!draft.end||!draft.location.trim()||!draft.position.trim())return;
  if(draft.end===draft.start){alert('Start and end cannot match.');return;}
  setShifts(prev=>[{id:crypto.randomUUID(),owner:user,...draft,status:'open',comments:[],offers:[]},...prev]);setDraft({date:'',start:'',end:'',location:'',position:'',note:''});setPage('board')};
 const addComment=e=>{e.preventDefault();if(!comment.trim()||!active)return;updateShift(active.id,s=>({...s,comments:[...s.comments,{id:crypto.randomUUID(),by:user,body:comment.trim(),at:stamp()}]}));if(active.owner!==user)notify(active.owner,`${personName(user)} commented on your shift`);setComment('')};
 const offer=()=>{if(!active||active.owner===user||active.status==='covered'||active.offers.some(o=>o.by===user))return;
  updateShift(active.id,s=>({...s,offers:[...s.offers,{id:crypto.randomUUID(),by:user,status:'pending',at:stamp(),reason:''}]}));notify(active.owner,`${personName(user)} offered to cover your shift`)};
 const decide=(shiftId,offerId,decision)=>{const s=shifts.find(x=>x.id===shiftId);if(!s||current.role!=='manager'||s.status==='covered')return;
  const o=s.offers.find(x=>x.id===offerId);if(!o||o.status!=='pending')return;
  if(decision==='rejected'&&!rejectReasons[offerId]?.trim()){alert('Please enter a rejection reason.');return;}
  updateShift(shiftId,x=>({...x,status:decision==='approved'?'covered':x.status,offers:x.offers.map(a=>a.id===offerId?{...a,status:decision,reason:decision==='rejected'?rejectReasons[offerId].trim():'',reviewedAt:stamp()}:decision==='approved'&&a.status==='pending'?{...a,status:'closed',reason:'Another offer was approved',reviewedAt:stamp()}:a)}));
  notify(s.owner,`Coverage offer ${decision} for your shift`);notify(o.by,`Your shift coverage offer was ${decision}`);
 };
 const pending=shifts.flatMap(s=>s.offers.filter(o=>o.status==='pending'&&s.status==='open').map(o=>({shift:s,offer:o})));
 const visible=shifts.filter(s=>(!filters.location||s.location===filters.location)&&(!filters.position||s.position===filters.position));
 return <div className="app">
  <header><div><strong>Shift Coverage</strong> <small>Internal prototype</small></div><div className="header-right"><label htmlFor="demo-user">Demo user:</label><select id="demo-user" value={user} onChange={e=>{setUser(e.target.value);setPage('board')}}>{people.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></div></header>
  <nav><button className={page==='board'?'active':''} onClick={()=>setPage('board')}>Shift board</button><button className={page==='post'?'active':''} onClick={()=>setPage('post')}>Post shift</button><button className={page==='mine'?'active':''} onClick={()=>setPage('mine')}>My activity</button>{current.role==='manager'&&<button className={page==='manager'?'active':''} onClick={()=>setPage('manager')}>Manager approvals ({pending.length})</button>}<button className={page==='notifications'?'active':''} onClick={()=>setPage('notifications')}>Email preview ({emailLog.length})</button></nav>
  <main>
   {page==='board'&&<><div className="title"><h1>Available shifts</h1><span>{visible.filter(s=>s.status==='open').length} open</span></div><div className="filters"><label>Location<select value={filters.location} onChange={e=>setFilters({...filters,location:e.target.value})}><option value="">All locations</option>{[...new Set(shifts.map(s=>s.location))].map(v=><option key={v}>{v}</option>)}</select></label><label>Position<select value={filters.position} onChange={e=>setFilters({...filters,position:e.target.value})}><option value="">All positions</option>{[...new Set(shifts.map(s=>s.position))].map(v=><option key={v}>{v}</option>)}</select></label></div><div className="stack">{visible.filter(s=>s.status==='open').length===0&&<p>No open shifts match your filters.</p>}{visible.filter(s=>s.status==='open').map(s=><ShiftCard key={s.id} shift={s} open={()=>openShift(s.id)}/>)}</div></>}
   {page==='post'&&<><h1>Post a shift</h1><p className="muted">Only post shifts that are actually assigned to you. A manager must approve any coverage.</p><form className="card form" onSubmit={post}><label>Date<input required type="date" value={draft.date} onChange={e=>setDraft({...draft,date:e.target.value})}/></label><div className="two"><label>Start time<input required type="time" value={draft.start} onChange={e=>setDraft({...draft,start:e.target.value})}/></label><label>End time<input required type="time" value={draft.end} onChange={e=>setDraft({...draft,end:e.target.value})}/></label></div><label>Location<input required placeholder="e.g. Building A" value={draft.location} onChange={e=>setDraft({...draft,location:e.target.value})}/></label><label>Position / qualification<input required placeholder="e.g. Warehouse Operator" value={draft.position} onChange={e=>setDraft({...draft,position:e.target.value})}/></label><label>Optional note<textarea value={draft.note} onChange={e=>setDraft({...draft,note:e.target.value})}/></label><button className="primary">Publish shift</button></form></>}
   {page==='detail'&&active&&<><button className="link" onClick={()=>setPage('board')}>← Back to shift board</button><ShiftCard shift={active}/>{active.status==='open'&&active.owner!==user&&<button className="primary" disabled={active.offers.some(o=>o.by===user)} onClick={offer}>{active.offers.some(o=>o.by===user)?'You already offered to cover':'I can cover this shift'}</button>}<section className="card"><h2>Coverage offers ({active.offers.length})</h2>{!active.offers.length&&<p className="muted">No offers yet.</p>}{active.offers.map(o=><div className="item" key={o.id}><strong>{personName(o.by)}</strong> <Status status={o.status}/><small>{o.at}</small>{o.reason&&<p className="muted">{o.reason}</p>}</div>)}<p className="hint">Offers are requests, not confirmed transfers. Only a manager can approve coverage.</p></section><section className="card"><h2>Public comments ({active.comments.length})</h2>{active.comments.map(c=><div className="item" key={c.id}><strong>{personName(c.by)}</strong><small>{c.at}</small><p>{c.body}</p></div>)}{active.status==='open'&&<form onSubmit={addComment}><label>Add a public comment<textarea required value={comment} onChange={e=>setComment(e.target.value)} placeholder="Ask a question about this shift…"/></label><button>Post comment</button></form>}</section></>}
   {page==='mine'&&<><h1>My activity</h1><h2>Shifts I posted</h2>{shifts.filter(s=>s.owner===user).length===0&&<p className="muted">Nothing posted yet.</p>}{shifts.filter(s=>s.owner===user).map(s=><ShiftCard key={s.id} shift={s} open={()=>openShift(s.id)}/>)}<h2>Coverage offers I made</h2>{shifts.flatMap(s=>s.offers.filter(o=>o.by===user).map(o=>({s,o}))).map(({s,o})=><div className="card" key={o.id}><strong>{s.date} — {s.position}</strong><Status status={o.status}/><p className="muted">{s.location} · {clock(s.start)}–{clock(s.end)}</p><button onClick={()=>openShift(s.id)}>View shift</button></div>)}</>}
   {page==='manager'&&current.role==='manager'&&<><div className="title"><h1>Manager approval queue</h1><span>{pending.length} pending</span></div><p className="muted">Review location, qualifications, staffing, and scheduling rules outside this prototype before approving.</p>{!pending.length&&<div className="card">No pending coverage offers.</div>}{pending.map(({shift:s,offer:o})=><section key={o.id} className="card"><h2>{s.date} · {clock(s.start)}–{clock(s.end)}</h2><p>{s.location} · {s.position}</p><p>Posted by <strong>{personName(s.owner)}</strong> — Offered by <strong>{personName(o.by)}</strong></p><label>Rejection reason (required to reject)<input placeholder="Explain why this offer cannot be approved" value={rejectReasons[o.id]||''} onChange={e=>setRejectReasons({...rejectReasons,[o.id]:e.target.value})}/></label><div className="actions"><button className="primary" onClick={()=>decide(s.id,o.id,'approved')}>Approve offer</button><button onClick={()=>decide(s.id,o.id,'rejected')}>Reject offer</button><button onClick={()=>openShift(s.id)}>View discussion</button></div></section>)}</>}
   {page==='notifications'&&<><h1>Email notification preview</h1><p className="muted">No actual emails are sent. These are the notifications the future backend would email.</p>{!emailLog.length&&<div className="card">No notifications generated yet. Try posting an offer or a comment as another user.</div>}{emailLog.map(n=><div className="card" key={n.id}><strong>{n.subject}</strong><p>To: {n.recipient}</p><small>{n.at}</small></div>)}</>}
  </main><footer>Prototype only · Data is saved in this browser · Demo account selector is not secure authentication <button className="link" onClick={()=>{if(confirm('Reset all sample shifts and comments?')){setShifts(initial);setEmailLog([]);setPage('board')}}}>Reset demo</button></footer>
 </div>;
}
function Status({status}){return <span className={`status ${status}`}>{status}</span>}
function ShiftCard({shift:s,open}){return <article className="card"><div className="title"><h2>{s.date} · {clock(s.start)}–{clock(s.end)}</h2><Status status={s.status}/></div><p><strong>{s.position}</strong> · {s.location}</p><p className="muted">Posted by {personName(s.owner)} · {s.offers.length} offer(s)</p>{s.note&&<p>{s.note}</p>}{open&&<button onClick={open}>View shift & discussion →</button>}</article>}

createRoot(document.getElementById('root')).render(<App/>);
