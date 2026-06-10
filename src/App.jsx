import { useState, useRef, useEffect, useCallback } from "react";

const AVATARS = ["🐯","🦊","🐺","🦁","🐻","🐼","🐨","🦅","🐉","🌟","⚡","🔥","🌊","🌸","🍀","🎭","💎","🎸","🚀","🎯"];
const MUSIC_LIST = ["Original Sound","Lo-fi Chill","Trending Pop","Bollywood Hits","EDM Remix","Acoustic Vibes","Hip Hop Beat","Classical","Desi Trap","Romantic"];
const VID_EMOJIS = ["🎵","🎬","🌟","🔥","💫","🎭","🌊","⚡","🎮","🌺","😎","🤩"];

function fmt(ts) {
  if (!ts) return "";
  const diff = (Date.now() - ts) / 1000;
  if (diff < 60) return "এখনই";
  if (diff < 3600) return Math.floor(diff/60) + "m আগে";
  if (diff < 86400) return Math.floor(diff/3600) + "h আগে";
  return Math.floor(diff/86400) + "d আগে";
}
function fmtNum(n) {
  if (!n) return "0";
  if (n >= 1000000) return (n/1000000).toFixed(1) + "M";
  if (n >= 1000) return (n/1000).toFixed(1) + "K";
  return String(n);
}
async function sget(key, shared=false) {
  try { const r = await window.storage.get(key, shared); return r ? JSON.parse(r.value) : null; } catch { return null; }
}
async function sset(key, val, shared=false) {
  try { await window.storage.set(key, JSON.stringify(val), shared); return true; } catch { return false; }
}
async function slist(prefix, shared=false) {
  try { const r = await window.storage.list(prefix, shared); return r?.keys || []; } catch { return []; }
}
async function sdel(key, shared=false) {
  try { await window.storage.delete(key, shared); return true; } catch { return false; }
}const IC = {
  Home: ({a}) => <svg width="24" height="24" fill={a?"#fff":"none"} stroke={a?"#fff":"#888"} strokeWidth="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Search: ({a}) => <svg width="24" height="24" fill="none" stroke={a?"#fff":"#888"} strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Plus: () => <svg width="20" height="20" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Bell: ({a,n}) => <div style={{position:"relative",display:"inline-flex"}}><svg width="24" height="24" fill="none" stroke={a?"#fff":"#888"} strokeWidth="2" viewBox="0 0 24 24"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>{n>0&&<span style={{position:"absolute",top:-5,right:-6,background:"#FE2C55",color:"#fff",fontSize:9,fontWeight:700,minWidth:16,height:16,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 3px"}}>{n>99?"99+":n}</span>}</div>,
  User: ({a}) => <svg width="24" height="24" fill="none" stroke={a?"#fff":"#888"} strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Heart: ({f,size=28}) => <svg width={size} height={size} fill={f?"#FE2C55":"none"} stroke={f?"#FE2C55":"#fff"} strokeWidth="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
  Comment: ({size=26}) => <svg width={size} height={size} fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
  Share: ({size=26}) => <svg width={size} height={size} fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/></svg>,
  Bookmark: ({f,size=24}) => <svg width={size} height={size} fill={f?"#25F4EE":"none"} stroke={f?"#25F4EE":"#fff"} strokeWidth="2" viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>,
  Back: () => <svg width="22" height="22" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>,
  Close: () => <svg width="22" height="22" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Send: () => <svg width="18" height="18" fill="#fff" viewBox="0 0 24 24"><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  Edit: () => <svg width="18" height="18" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Trash: () => <svg width="18" height="18" fill="none" stroke="#FE2C55" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>,
  Music: () => <svg width="13" height="13" fill="#fff" viewBox="0 0 24 24"><path d="M9 18V5l12-2v13M9 18a3 3 0 11-6 0 3 3 0 016 0zM21 16a3 3 0 11-6 0 3 3 0 016 0z"/></svg>,
  Upload: () => <svg width="32" height="32" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/></svg>,
  Camera: () => <svg width="20" height="20" fill="none" stroke="#888" strokeWidth="2" viewBox="0 0 24 24"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  Settings: () => <svg width="20" height="20" fill="none" stroke="#888" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
  Hash: () => <svg width="14" height="14" fill="none" stroke="#888" strokeWidth="2" viewBox="0 0 24 24"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>,
  Eye: ({off}) => <svg width="18" height="18" fill="none" stroke="#888" strokeWidth="2" viewBox="0 0 24 24">{off?<><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>:<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>}</svg>,
  Crown: () => <svg width="16" height="16" fill="#FFD700" viewBox="0 0 24 24"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>,
  Shield: () => <svg width="16" height="16" fill="#FE2C55" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  ChevRight: () => <svg width="16" height="16" fill="none" stroke="#555" strokeWidth="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>,
};

function Toast({ msg, type="info" }) {
  const bg = type==="success"?"#0a2a1a":type==="error"?"#2a0a0a":"#0a0a2a";
  const border = type==="success"?"#25F4EE":type==="error"?"#FE2C55":"#333";
  return (
    <div style={{position:"fixed",top:60,left:"50%",transform:"translateX(-50%)",zIndex:9999,background:bg,border:`1px solid ${border}`,borderRadius:12,padding:"10px 18px",color:"#fff",fontSize:14,fontWeight:600,whiteSpace:"nowrap",boxShadow:"0 4px 24px rgba(0,0,0,0.7)"}}>
      {msg}
    </div>
  );
}
function useToast() {
  const [toast, setToast] = useState(null);
  const show = useCallback((msg, type="info") => {
    setToast({msg,type});
    setTimeout(()=>setToast(null), 2500);
  }, []);
  return [toast, show];
    }function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState("splash");
  const [uname, setUname] = useState("");
  const [pass, setPass] = useState("");
  const [dname, setDname] = useState("");
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [bio, setBio] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const Field = ({label,val,set,type="text",note}) => (
    <div style={{marginBottom:14}}>
      {label&&<p style={{color:"#666",fontSize:12,marginBottom:5,paddingLeft:2}}>{label}</p>}
      <div style={{position:"relative"}}>
        <input type={showPass&&type==="password"?"text":type} placeholder={label} value={val} onChange={e=>set(e.target.value)}
          style={{width:"100%",background:"#0d0d0d",border:"1px solid #1e1e1e",borderRadius:12,color:"#fff",padding:"13px 16px",paddingRight:type==="password"?44:16,fontSize:15,outline:"none",boxSizing:"border-box",fontFamily:"inherit",letterSpacing:type==="password"&&!showPass?"2px":"normal"}}/>
        {type==="password"&&<button onClick={()=>setShowPass(p=>!p)} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",padding:4}}><IC.Eye off={showPass}/></button>}
      </div>
      {note&&<p style={{color:"#444",fontSize:11,marginTop:4,paddingLeft:2}}>{note}</p>}
    </div>
  );

  const login = async () => {
    if (!uname.trim()||!pass.trim()) { setErr("সব ফিল্ড পূরণ করুন"); return; }
    setBusy(true); setErr("");
    const u = await sget("user:"+uname.trim().toLowerCase(), true);
    if (!u) { setErr("অ্যাকাউন্ট পাওয়া যায়নি"); setBusy(false); return; }
    if (u.banned) { setErr("এই অ্যাকাউন্ট ব্যান করা হয়েছে"); setBusy(false); return; }
    if (u.password!==pass) { setErr("পাসওয়ার্ড ভুল"); setBusy(false); return; }
    await sset("session",{uid:u.uid,username:u.username},false);
    onLogin(u); setBusy(false);
  };

  const signup = async () => {
    if (!uname.trim()||!pass.trim()||!dname.trim()) { setErr("সব ফিল্ড পূরণ করুন"); return; }
    const un = uname.trim().toLowerCase().replace(/[^a-z0-9_\.]/g,"");
    if (un.length<3) { setErr("ইউজারনেম কমপক্ষে ৩ অক্ষর"); return; }
    if (pass.length<4) { setErr("পাসওয়ার্ড কমপক্ষে ৪ অক্ষর"); return; }
    setBusy(true); setErr("");
    if (await sget("user:"+un,true)) { setErr("এই ইউজারনেম আগেই নেওয়া"); setBusy(false); return; }
    const uid = "u_"+Date.now()+"_"+Math.random().toString(36).slice(2,7);
    const allUsers = await slist("user:",true);
    const isAdmin = allUsers.length===0;
    const user = {uid,username:un,displayName:dname.trim(),password:pass,avatar,bio,verified:false,admin:isAdmin,banned:false,createdAt:Date.now()};
    await sset("user:"+un,user,true);
    await sset("session",{uid,username:un},false);
    onLogin(user); setBusy(false);
  };

  if (mode==="splash") return (
    <div style={{height:"100dvh",background:"#000",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"0 32px",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:"20%",left:"50%",transform:"translateX(-50%)",width:300,height:300,borderRadius:"50%",background:"radial-gradient(circle,rgba(254,44,85,0.15) 0%,transparent 70%)",pointerEvents:"none"}}/>
      <div style={{marginBottom:8,fontSize:80,filter:"drop-shadow(0 0 30px #FE2C55)",position:"relative",zIndex:1}}>🎬</div>
      <h1 style={{color:"#fff",fontSize:36,fontWeight:900,letterSpacing:-1,marginBottom:4,position:"relative",zIndex:1}}>VibeReel</h1>
      <p style={{color:"#444",fontSize:14,marginBottom:52,textAlign:"center",lineHeight:1.6,position:"relative",zIndex:1}}>ভিডিও শেয়ার করুন · ট্রেন্ড করুন<br/>বিশ্বের সাথে সংযুক্ত হন</p>
      <button onClick={()=>setMode("signup")} style={{width:"100%",background:"linear-gradient(135deg,#FE2C55,#ff4d6d)",color:"#fff",fontWeight:700,fontSize:16,padding:"16px",borderRadius:14,border:"none",cursor:"pointer",marginBottom:12,boxShadow:"0 4px 20px rgba(254,44,85,0.35)",position:"relative",zIndex:1}}>✨ নতুন অ্যাকাউন্ট তৈরি করুন</button>
      <button onClick={()=>setMode("login")} style={{width:"100%",background:"transparent",color:"#fff",fontWeight:600,fontSize:16,padding:"16px",borderRadius:14,border:"1px solid #222",cursor:"pointer",position:"relative",zIndex:1}}>লগইন করুন</button>
    </div>
  );

  if (mode==="login") return (
    <div style={{height:"100dvh",background:"#000",display:"flex",flexDirection:"column",padding:"0 24px",overflowY:"auto"}}>
      <div style={{paddingTop:56,paddingBottom:32,display:"flex",alignItems:"center",gap:12}}>
        <button onClick={()=>{setMode("splash");setErr("");}} style={{background:"none",border:"none",cursor:"pointer",padding:4,marginLeft:-4}}><IC.Back/></button>
        <div><h2 style={{color:"#fff",fontSize:24,fontWeight:800,margin:0}}>স্বাগতম ফিরে 👋</h2><p style={{color:"#444",fontSize:13,margin:"4px 0 0"}}>আপনার অ্যাকাউন্টে লগইন করুন</p></div>
      </div>
      <Field label="ইউজারনেম" val={uname} set={setUname}/>
      <Field label="পাসওয়ার্ড" val={pass} set={setPass} type="password"/>
      {err&&<p style={{color:"#FE2C55",fontSize:13,marginBottom:12,paddingLeft:4}}>{err}</p>}
      <button onClick={login} disabled={busy} style={{width:"100%",background:"linear-gradient(135deg,#FE2C55,#ff4d6d)",color:"#fff",fontWeight:700,fontSize:16,padding:"15px",borderRadius:14,border:"none",cursor:"pointer",marginTop:8,opacity:busy?0.6:1}}>{busy?"লগইন হচ্ছে...":"লগইন করুন →"}</button>
      <p style={{color:"#444",fontSize:13,textAlign:"center",marginTop:24}}>অ্যাকাউন্ট নেই?{" "}<button onClick={()=>{setMode("signup");setErr("");}} style={{background:"none",border:"none",color:"#25F4EE",cursor:"pointer",fontSize:13,fontWeight:700}}>সাইনআপ করুন</button></p>
    </div>
  );

  return (
    <div style={{height:"100dvh",background:"#000",overflowY:"auto",padding:"0 24px 40px"}}>
      <div style={{paddingTop:56,paddingBottom:24,display:"flex",alignItems:"center",gap:12}}>
        <button onClick={()=>{setMode("splash");setErr("");}} style={{background:"none",border:"none",cursor:"pointer",padding:4,marginLeft:-4}}><IC.Back/></button>
        <div><h2 style={{color:"#fff",fontSize:22,fontWeight:800,margin:0}}>প্রোফাইল তৈরি করুন ✨</h2><p style={{color:"#444",fontSize:13,margin:"4px 0 0"}}>আপনার তথ্য দিন</p></div>
      </div>
      <p style={{color:"#555",fontSize:12,marginBottom:10}}>আইকন বেছে নিন</p>
      <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:20}}>
        {AVATARS.map(a=><button key={a} onClick={()=>setAvatar(a)} style={{width:46,height:46,borderRadius:12,background:avatar===a?"#1a0a0e":"#0d0d0d",border:avatar===a?"2px solid #FE2C55":"2px solid #1a1a1a",fontSize:22,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{a}</button>)}
      </div>
      <Field label="ডিসপ্লে নেম" val={dname} set={setDname} note="যেমন: Rafi Islam"/>
      <Field label="ইউজারনেম" val={uname} set={setUname} note="শুধু a-z, 0-9, _ (কমপক্ষে ৩ অক্ষর)"/>
      <Field label="পাসওয়ার্ড" val={pass} set={setPass} type="password" note="কমপক্ষে ৪ অক্ষর"/>
      <div style={{marginBottom:14}}>
        <p style={{color:"#666",fontSize:12,marginBottom:5,paddingLeft:2}}>বায়ো (ঐচ্ছিক)</p>
        <textarea placeholder="নিজের সম্পর্কে লিখুন..." value={bio} onChange={e=>setBio(e.target.value)} rows={2} style={{width:"100%",background:"#0d0d0d",border:"1px solid #1e1e1e",borderRadius:12,color:"#fff",padding:"13px 16px",fontSize:14,outline:"none",resize:"none",boxSizing:"border-box",fontFamily:"inherit"}}/>
      </div>
      {err&&<p style={{color:"#FE2C55",fontSize:13,marginBottom:12,paddingLeft:4}}>{err}</p>}
      <button onClick={signup} disabled={busy} style={{width:"100%",background:"linear-gradient(135deg,#FE2C55,#ff4d6d)",color:"#fff",fontWeight:700,fontSize:16,padding:"15px",borderRadius:14,border:"none",cursor:"pointer",opacity:busy?0.6:1}}>{busy?"তৈরি হচ্ছে...":"অ্যাকাউন্ট তৈরি করুন ✓"}</button>
      <p style={{color:"#444",fontSize:13,textAlign:"center",marginTop:16}}>আগেই অ্যাকাউন্ট আছে?{" "}<button onClick={()=>{setMode("login");setErr("");}} style={{background:"none",border:"none",color:"#25F4EE",cursor:"pointer",fontSize:13,fontWeight:700}}>লগইন করুন</button></p>
    </div>
  );
    }function CommentPanel({ video, currentUser, onClose, onCount }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const endRef = useRef();
  const load = useCallback(async () => {
    const keys = await slist("cmt:"+video.id+":", true);
    const all = (await Promise.all(keys.map(k=>sget(k,true)))).filter(Boolean);
    all.sort((a,b)=>a.createdAt-b.createdAt);
    setComments(all); setLoading(false);
  }, [video.id]);
  useEffect(()=>{ load(); }, [load]);
  useEffect(()=>{ endRef.current?.scrollIntoView({behavior:"smooth"}); }, [comments]);
  const send = async () => {
    if (!text.trim()) return;
    setSending(true);
    const c = {id:"cmt:"+video.id+":"+Date.now()+"_"+Math.random().toString(36).slice(2,5),videoId:video.id,uid:currentUser.uid,username:currentUser.username,displayName:currentUser.displayName,avatar:currentUser.avatar,text:text.trim(),createdAt:Date.now()};
    await sset(c.id,c,true);
    const vid = await sget(video.id,true);
    if (vid) { vid.comments=(vid.comments||0)+1; await sset(video.id,vid,true); if(onCount) onCount(vid.comments); }
    if (video.uid!==currentUser.uid) await sset("notif:"+video.uid+":"+Date.now()+"_c",{type:"comment",fromUid:currentUser.uid,fromUsername:currentUser.username,fromAvatar:currentUser.avatar,fromDisplayName:currentUser.displayName,videoId:video.id,text:c.text,createdAt:Date.now(),read:false},true);
    setText(""); await load(); setSending(false);
  };
  return (
    <div style={{position:"fixed",inset:0,zIndex:300,display:"flex",flexDirection:"column",justifyContent:"flex-end"}} onClick={onClose}>
      <div style={{background:"#0d0d0d",borderRadius:"20px 20px 0 0",height:"72dvh",display:"flex",flexDirection:"column",border:"1px solid #1a1a1a"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 16px 10px",borderBottom:"1px solid #1a1a1a"}}>
          <span style={{color:"#fff",fontWeight:700,fontSize:16}}>💬 কমেন্ট{comments.length>0?` (${comments.length})`:""}</span>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer"}}><IC.Close/></button>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"8px 14px"}}>
          {loading?<div style={{textAlign:"center",padding:"50px 0",color:"#444"}}>লোড হচ্ছে...</div>:comments.length===0?(
            <div style={{textAlign:"center",padding:"60px 0",color:"#444"}}><div style={{fontSize:40,marginBottom:8}}>💬</div><p style={{fontSize:14}}>প্রথম কমেন্ট করুন!</p></div>
          ):comments.map(c=>(
            <div key={c.id} style={{display:"flex",gap:10,marginBottom:16}}>
              <div style={{width:36,height:36,borderRadius:"50%",background:"#1a1a1a",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{c.avatar||"👤"}</div>
              <div style={{flex:1}}>
                <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                  <span style={{color:"#fff",fontWeight:700,fontSize:13}}>{c.displayName}</span>
                  {c.uid===video.uid&&<span style={{background:"#FE2C55",color:"#fff",fontSize:9,padding:"1px 5px",borderRadius:4}}>creator</span>}
                  <span style={{color:"#444",fontSize:11}}>{fmt(c.createdAt)}</span>
                </div>
                <p style={{color:"#ddd",fontSize:14,marginTop:3,lineHeight:1.45}}>{c.text}</p>
              </div>
            </div>
          ))}
          <div ref={endRef}/>
        </div>
        <div style={{padding:"10px 14px 20px",borderTop:"1px solid #1a1a1a",display:"flex",gap:10,alignItems:"center",background:"#0d0d0d"}}>
          <div style={{width:34,height:34,borderRadius:"50%",background:"#1a1a1a",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{currentUser.avatar||"👤"}</div>
          <input value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}} placeholder="কমেন্ট লিখুন..." style={{flex:1,background:"#1a1a1a",border:"1px solid #222",borderRadius:20,color:"#fff",padding:"10px 14px",fontSize:14,outline:"none",fontFamily:"inherit"}}/>
          <button onClick={send} disabled={!text.trim()||sending} style={{width:36,height:36,borderRadius:"50%",background:text.trim()?"#FE2C55":"#1a1a1a",border:"none",cursor:text.trim()?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><IC.Send/></button>
        </div>
      </div>
    </div>
  );
}

function ShareModal({ video, onClose }) {
  const [copied, setCopied] = useState(false);
  const link = `https://vibereel.app/v/${video.id}`;
  const copy = () => { navigator.clipboard?.writeText(link).catch(()=>{}); setCopied(true); setTimeout(()=>setCopied(false),2000); };
  const apps = [{e:"💬",n:"WhatsApp"},{e:"📘",n:"Facebook"},{e:"📸",n:"Instagram"},{e:"🐦",n:"Twitter/X"},{e:"✈️",n:"Telegram"},{e:"🔗",n:copied?"কপি হয়েছে ✓":"লিংক কপি",a:copy}];
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:400,display:"flex",alignItems:"flex-end"}} onClick={onClose}>
      <div style={{width:"100%",background:"#0d0d0d",borderRadius:"20px 20px 0 0",padding:"16px 18px 40px",border:"1px solid #1a1a1a"}} onClick={e=>e.stopPropagation()}>
        <div style={{width:36,height:4,borderRadius:2,background:"#2a2a2a",margin:"0 auto 16px"}}/>
        <p style={{color:"#fff",fontWeight:700,fontSize:16,marginBottom:16}}>↗️ শেয়ার করুন</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
          {apps.map(a=><button key={a.n} onClick={a.a} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6,background:"#1a1a1a",borderRadius:14,padding:"14px 8px",border:"1px solid #222",cursor:"pointer"}}><span style={{fontSize:26}}>{a.e}</span><span style={{color:"#999",fontSize:11,textAlign:"center"}}>{a.n}</span></button>)}
        </div>
      </div>
    </div>
  );
}

function VideoCard({ video, currentUser, liked, bookmarked, likeCount, following, onLike, onBookmark, onFollow, onOpenProfile }) {
  const [showComments, setShowComments] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [cmtCount, setCmtCount] = useState(video.comments||0);
  const [musicAnim, setMusicAnim] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [heartAnim, setHeartAnim] = useState(false);
  const vidRef = useRef();
  useEffect(()=>{ const t=setInterval(()=>setMusicAnim(a=>(a+2)%360),60); return ()=>clearInterval(t); },[]);
  const isOwn = video.uid===currentUser.uid;
  const handleDoubleTap = () => { if(!liked) onLike(video.id); setHeartAnim(true); setTimeout(()=>setHeartAnim(false),800); };
  const togglePlay = () => { if(vidRef.current){if(playing)vidRef.current.pause();else vidRef.current.play();setPlaying(p=>!p);} };
  return (
    <div style={{position:"relative",width:"100%",height:"100dvh",flexShrink:0,overflow:"hidden",background:"#000",scrollSnapAlign:"start",scrollSnapStop:"always"}}>
      {video.videoData?<video ref={vidRef} src={video.videoData} style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover"}} autoPlay loop muted playsInline onClick={togglePlay}/>:<div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",background:"radial-gradient(ellipse at center,#1a0020 0%,#000 70%)"}} onDoubleClick={handleDoubleTap}><span style={{fontSize:100,opacity:0.7}}>{video.emoji||"🎬"}</span></div>}
      {video.videoData&&!playing&&<div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",zIndex:5,pointerEvents:"none"}}><div style={{width:64,height:64,borderRadius:"50%",background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:28,marginLeft:4}}>▶</span></div></div>}
      {heartAnim&&<div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",zIndex:10,pointerEvents:"none"}}><div style={{fontSize:80,animation:"heartPop 0.8s ease-out forwards",filter:"drop-shadow(0 0 20px #FE2C55)"}}>❤️</div></div>}
      <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(0,0,0,0.9) 28%,rgba(0,0,0,0.05) 55%,transparent 72%)"}}/>
      <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,rgba(0,0,0,0.35) 0%,transparent 18%)"}}/>
      <div style={{position:"absolute",right:10,bottom:108,display:"flex",flexDirection:"column",alignItems:"center",gap:22,zIndex:20}}>
        <button onClick={()=>onOpenProfile(video)} style={{position:"relative",background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
          <div style={{width:50,height:50,borderRadius:"50%",border:"2.5px solid #fff",background:"#111",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>{video.avatar||"👤"}</div>
          {!isOwn&&<div onClick={e=>{e.stopPropagation();onFollow(video.uid,video.username);}} style={{position:"absolute",bottom:-10,left:"50%",transform:"translateX(-50%)",width:22,height:22,borderRadius:"50%",background:following?"#333":"#FE2C55",border:"2px solid #000",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,cursor:"pointer"}}>{following?"✓":"+"}</div>}
        </button>
        <button onClick={()=>onLike(video.id)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,background:"none",border:"none",cursor:"pointer",WebkitTapHighlightColor:"transparent"}}>
          <div style={{transform:liked?"scale(1.25)":"scale(1)",transition:"transform 0.15s"}}><IC.Heart f={liked}/></div>
          <span style={{color:"#fff",fontSize:12,fontWeight:600,textShadow:"0 1px 4px rgba(0,0,0,0.8)"}}>{fmtNum(likeCount)}</span>
        </button>
        <button onClick={()=>setShowComments(true)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,background:"none",border:"none",cursor:"pointer",WebkitTapHighlightColor:"transparent"}}><IC.Comment/><span style={{color:"#fff",fontSize:12,fontWeight:600,textShadow:"0 1px 4px rgba(0,0,0,0.8)"}}>{fmtNum(cmtCount)}</span></button>
        <button onClick={()=>onBookmark(video.id)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,background:"none",border:"none",cursor:"pointer",WebkitTapHighlightColor:"transparent"}}><IC.Bookmark f={bookmarked}/><span style={{color:"#fff",fontSize:12,fontWeight:600,textShadow:"0 1px 4px rgba(0,0,0,0.8)"}}>সেভ</span></button>
        <button onClick={()=>setShowShare(true)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,background:"none",border:"none",cursor:"pointer",WebkitTapHighlightColor:"transparent"}}><IC.Share/><span style={{color:"#fff",fontSize:12,fontWeight:600,textShadow:"0 1px 4px rgba(0,0,0,0.8)"}}>{fmtNum(video.shares||0)}</span></button>
        <div style={{width:44,height:44,borderRadius:"50%",background:"linear-gradient(135deg,#1a1a1a,#2a2a2a)",border:"3px solid #333",display:"flex",alignItems:"center",justifyContent:"center",transform:`rotate(${musicAnim}deg)`,fontSize:20}}>{video.avatar||"🎵"}</div>
      </div>
      <div style={{position:"absolute",bottom:90,left:14,right:76,zIndex:20}}>
        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:5}}>
          <button onClick={()=>onOpenProfile(video)} style={{background:"none",border:"none",cursor:"pointer",padding:0}}><span style={{color:"#fff",fontWeight:800,fontSize:16,textShadow:"0 1px 5px rgba(0,0,0,0.9)"}}>@{video.username}</span></button>
          {video.verified&&<span style={{color:"#25F4EE",fontSize:14}}>✔️</span>}
        </div>
        <p style={{color:"#eee",fontSize:14,lineHeight:1.5,marginBottom:5,textShadow:"0 1px 4px rgba(0,0,0,0.8)"}}>{video.caption}</p>
        {(video.hashtags||[]).length>0&&<p style={{marginBottom:6}}>{(video.hashtags||[]).slice(0,4).map(t=><span key={t} style={{color:"#25F4EE",fontSize:13,marginRight:8,fontWeight:600}}>#{t}</span>)}</p>}
        {video.music&&<div style={{display:"inline-flex",alignItems:"center",gap:6,background:"rgba(0,0,0,0.5)",borderRadius:20,padding:"5px 12px",backdropFilter:"blur(4px)"}}><IC.Music/><span style={{color:"#ddd",fontSize:12}}>{video.music}</span></div>}
      </div>
      {showComments&&<CommentPanel video={video} currentUser={currentUser} onClose={()=>setShowComments(false)} onCount={n=>setCmtCount(n)}/>}
      {showShare&&<ShareModal video={video} onClose={()=>setShowShare(false)}/>}
      <style>{`@keyframes heartPop{0%{transform:scale(0);opacity:0}50%{transform:scale(1.3);opacity:1}100%{transform:scale(1.5);opacity:0}}`}</style>
    </div>
  );
}

function HomeTab({ currentUser, following, bookmarks, onFollow, onBookmark, onLike, liked, likeCounts, onOpenProfile, refresh }) {
  const [feedTab, setFeedTab] = useState("foryou");
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef();
  const load = useCallback(async () => {
    setLoading(true);
    const keys = await slist("video:",true);
    const all = (await Promise.all(keys.map(k=>sget(k,true)))).filter(Boolean);
    all.sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));
    setVideos(all); setLoading(false);
  },[]);
  useEffect(()=>{ load(); },[load,refresh]);
  const feed = feedTab==="foryou"?videos:videos.filter(v=>v.uid!==currentUser.uid&&following[v.uid]);
  return (
    <div style={{width:"100%",height:"100dvh",background:"#000",position:"relative"}}>
      <div style={{position:"absolute",top:0,left:0,right:0,zIndex:50,display:"flex",justifyContent:"center",gap:32,paddingTop:14,paddingBottom:12,background:"linear-gradient(to bottom,rgba(0,0,0,0.7),transparent)"}}>
        {[["foryou","For You"],["following","ফলোয়িং"]].map(([t,l])=><button key={t} onClick={()=>setFeedTab(t)} style={{color:t===feedTab?"#fff":"rgba(255,255,255,0.45)",fontWeight:t===feedTab?800:500,fontSize:16,background:"none",border:"none",cursor:"pointer",paddingBottom:5,borderBottom:t===feedTab?"2.5px solid #fff":"2.5px solid transparent"}}>{l}</button>)}
      </div>
      <div ref={containerRef} style={{width:"100%",height:"100dvh",overflowY:"scroll",scrollSnapType:"y mandatory",scrollbarWidth:"none"}}>
        {loading?<div style={{height:"100dvh",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:12,color:"#444"}}><div style={{fontSize:48,filter:"drop-shadow(0 0 15px #FE2C55)"}}>🎬</div><p style={{fontSize:14}}>ভিডিও লোড হচ্ছে...</p></div>:feed.length===0?<div style={{height:"100dvh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",color:"#444",gap:10}}><span style={{fontSize:52}}>📭</span><p style={{fontSize:15,color:"#555"}}>{feedTab==="following"?"ফলো করা কেউ পোস্ট করেননি":"এখনো কোনো ভিডিও নেই"}</p><p style={{fontSize:12,color:"#333"}}>নিচের + বাটন চেপে প্রথম ভিডিও আপলোড করুন</p></div>:feed.map(v=><VideoCard key={v.id} video={v} currentUser={currentUser} liked={!!liked[v.id]} bookmarked={!!bookmarks[v.id]} likeCount={likeCounts[v.id]||(v.likes||0)} following={!!following[v.uid]} onLike={onLike} onBookmark={onBookmark} onFollow={onFollow} onOpenProfile={onOpenProfile}/>)}
      </div>
    </div>
  );
      }function UploadScreen({ currentUser, onClose, onUploaded, editVideo }) {
  const [caption, setCaption] = useState(editVideo?.caption||"");
  const [hashtags, setHashtags] = useState((editVideo?.hashtags||[]).map(t=>"#"+t).join(" "));
  const [music, setMusic] = useState(editVideo?.music||MUSIC_LIST[0]);
  const [emoji, setEmoji] = useState(editVideo?.emoji||VID_EMOJIS[0]);
  const [videoFile, setVideoFile] = useState(null);
  const [thumbFile, setThumbFile] = useState(null);
  const [preview, setPreview] = useState(editVideo?.videoData||null);
  const [thumbPreview, setThumbPreview] = useState(editVideo?.thumbnail||null);
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState(editVideo?"details":"pick");
  const [toast, showToast] = useToast();
  const fileRef = useRef(); const thumbRef = useRef();
  const handleVid = (e) => { const f=e.target.files[0]; if(!f) return; if(!f.type.startsWith("video/")){showToast("শুধু ভিডিও ফাইল সাপোর্টেড","error");return;} if(f.size>50*1024*1024){showToast("ভিডিও সর্বোচ্চ ৫০MB","error");return;} setVideoFile(f);setPreview(URL.createObjectURL(f));setStep("details"); };
  const handleThumb = (e) => { const f=e.target.files[0]; if(!f) return; if(!f.type.startsWith("image/")){showToast("শুধু ইমেজ সাপোর্টেড","error");return;} setThumbFile(f);setThumbPreview(URL.createObjectURL(f)); };
  const parseTags = (str) => (str.match(/#[\w\u0980-\u09FF]+/g)||[]).map(t=>t.slice(1).toLowerCase());
  const submit = async () => {
    if (!caption.trim()){showToast("ক্যাপশন দিন","error");return;} setBusy(true);
    try {
      let thumbData=editVideo?.thumbnail||null;
      if(thumbFile) thumbData=await new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(thumbFile);});
      if(editVideo){
        const vid=await sget(editVideo.id,true);
        if(vid){vid.caption=caption.trim();vid.hashtags=parseTags(hashtags+" "+caption);vid.music=music;vid.emoji=emoji;if(thumbData)vid.thumbnail=thumbData;vid.editedAt=Date.now();await sset(editVideo.id,vid,true);showToast("ভিডিও আপডেট হয়েছে ✓","success");}
      } else {
        const vid={id:"video:"+Date.now()+"_"+Math.random().toString(36).slice(2,7),uid:currentUser.uid,username:currentUser.username,displayName:currentUser.displayName,avatar:currentUser.avatar,verified:currentUser.verified||false,caption:caption.trim(),emoji,music,hashtags:parseTags(hashtags+" "+caption),likes:0,comments:0,shares:0,createdAt:Date.now()};
        if(videoFile) vid.videoData=await new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(videoFile);});
        if(thumbData) vid.thumbnail=thumbData;
        await sset(vid.id,vid,true);
        const fData=await sget("followers:"+currentUser.uid,true)||{};
        for(const fuid of Object.keys(fData)) await sset("notif:"+fuid+":"+Date.now()+"_v"+Math.random().toString(36).slice(2,4),{type:"new_video",fromUid:currentUser.uid,fromUsername:currentUser.username,fromAvatar:currentUser.avatar,fromDisplayName:currentUser.displayName,videoId:vid.id,caption:vid.caption,createdAt:Date.now(),read:false},true);
        showToast("পোস্ট হয়েছে! 🚀","success");
      }
      setTimeout(()=>{onUploaded();onClose();},800);
    } catch{showToast("ব্যর্থ হয়েছে, আবার চেষ্টা করুন","error");}
    setBusy(false);
  };
  return (
    <div style={{position:"fixed",inset:0,background:"#000",zIndex:200,display:"flex",flexDirection:"column",overflowY:"auto"}}>
      {toast&&<Toast msg={toast.msg} type={toast.type}/>}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 18px",borderBottom:"1px solid #111",position:"sticky",top:0,background:"#080808",zIndex:10}}>
        <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",padding:4}}><IC.Close/></button>
        <span style={{color:"#fff",fontWeight:700,fontSize:16}}>{editVideo?"ভিডিও এডিট করুন":"নতুন ভিডিও পোস্ট"}</span>
        <div style={{width:30}}/>
      </div>
      {step==="pick"?(
        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:20,padding:"0 28px"}}>
          <div style={{width:120,height:120,borderRadius:"50%",background:"#0d0d0d",border:"2px dashed #2a2a2a",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}} onClick={()=>fileRef.current?.click()}><IC.Upload/></div>
          <div style={{textAlign:"center"}}><p style={{color:"#fff",fontWeight:700,fontSize:17,marginBottom:6}}>গ্যালারি থেকে ভিডিও বেছে নিন</p><p style={{color:"#444",fontSize:13}}>MP4, MOV সাপোর্টেড · সর্বোচ্চ ৫০MB</p></div>
          <button onClick={()=>fileRef.current?.click()} style={{background:"linear-gradient(135deg,#FE2C55,#ff4d6d)",color:"#fff",fontWeight:700,fontSize:15,padding:"13px 36px",borderRadius:12,border:"none",cursor:"pointer"}}>📁 ফাইল বেছে নিন</button>
          <input ref={fileRef} type="file" accept="video/*" onChange={handleVid} style={{display:"none"}}/>
          <button onClick={()=>setStep("details")} style={{background:"none",border:"none",color:"#444",fontSize:13,cursor:"pointer"}}>বা শুধু ইমোজি পোস্ট করুন →</button>
        </div>
      ):(
        <div style={{padding:"20px 18px 60px",display:"flex",flexDirection:"column",gap:16}}>
          <div style={{borderRadius:16,overflow:"hidden",background:"#0d0d0d",aspectRatio:"9/16",maxHeight:280,display:"flex",alignItems:"center",justifyContent:"center",position:"relative",border:"1px solid #1a1a1a"}}>
            {preview?<video src={preview} style={{width:"100%",height:"100%",objectFit:"cover"}} controls muted autoPlay loop playsInline/>:<div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8}}><span style={{fontSize:60}}>{emoji}</span><p style={{color:"#444",fontSize:12}}>ইমোজি প্রিভিউ</p></div>}
            {!preview&&<button onClick={()=>fileRef.current?.click()} style={{position:"absolute",bottom:10,right:10,background:"rgba(0,0,0,0.7)",border:"1px solid #333",borderRadius:8,color:"#aaa",fontSize:11,padding:"5px 10px",cursor:"pointer"}}>📁 ভিডিও যোগ করুন</button>}
          </div>
          <input ref={fileRef} type="file" accept="video/*" onChange={handleVid} style={{display:"none"}}/>
          <div style={{background:"#0d0d0d",borderRadius:14,padding:"14px",border:"1px solid #1a1a1a"}}>
            <p style={{color:"#888",fontSize:13,marginBottom:10}}>🖼 থাম্বনেইল (ঐচ্ছিক)</p>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              {thumbPreview&&<img src={thumbPreview} style={{width:48,height:64,objectFit:"cover",borderRadius:8,border:"1px solid #333"}} alt="thumb"/>}
              <button onClick={()=>thumbRef.current?.click()} style={{background:"#1a1a1a",border:"1px solid #2a2a2a",borderRadius:10,color:"#aaa",fontSize:13,padding:"9px 16px",cursor:"pointer",display:"flex",alignItems:"center",gap:6}}><IC.Camera/><span>ইমেজ বেছে নিন</span></button>
            </div>
            <input ref={thumbRef} type="file" accept="image/*" onChange={handleThumb} style={{display:"none"}}/>
          </div>
          <div><p style={{color:"#666",fontSize:13,marginBottom:6}}>ক্যাপশন *</p><textarea value={caption} onChange={e=>setCaption(e.target.value)} placeholder="আপনার ভিডিও সম্পর্কে লিখুন..." rows={3} style={{width:"100%",background:"#0d0d0d",border:"1px solid #1a1a1a",borderRadius:12,color:"#fff",padding:"12px",fontSize:14,outline:"none",resize:"none",boxSizing:"border-box",fontFamily:"inherit"}}/></div>
          <div><p style={{color:"#666",fontSize:13,marginBottom:6}}>হ্যাশট্যাগ</p><input value={hashtags} onChange={e=>setHashtags(e.target.value)} placeholder="#মজা #ট্রেন্ড #gaming" style={{width:"100%",background:"#0d0d0d",border:"1px solid #1a1a1a",borderRadius:12,color:"#fff",padding:"12px",fontSize:14,outline:"none",boxSizing:"border-box",fontFamily:"inherit"}}/></div>
          <div><p style={{color:"#666",fontSize:13,marginBottom:8}}>🎵 মিউজিক</p><div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:4}}>{MUSIC_LIST.map(m=><button key={m} onClick={()=>setMusic(m)} style={{flexShrink:0,padding:"7px 14px",borderRadius:20,background:music===m?"#FE2C55":"#1a1a1a",color:"#fff",fontSize:12,border:music===m?"none":"1px solid #2a2a2a",cursor:"pointer",fontWeight:music===m?700:400,whiteSpace:"nowrap"}}>{m}</button>)}</div></div>
          {!preview&&<div><p style={{color:"#666",fontSize:13,marginBottom:8}}>ইমোজি থিম</p><div style={{display:"flex",flexWrap:"wrap",gap:8}}>{VID_EMOJIS.map(e=><button key={e} onClick={()=>setEmoji(e)} style={{width:42,height:42,borderRadius:10,background:emoji===e?"#1a0a0e":"#0d0d0d",border:emoji===e?"2px solid #FE2C55":"2px solid #1a1a1a",fontSize:22,cursor:"pointer"}}>{e}</button>)}</div></div>}
          <button onClick={submit} disabled={busy} style={{background:"linear-gradient(135deg,#FE2C55,#ff4d6d)",color:"#fff",fontWeight:700,fontSize:16,padding:"15px",borderRadius:14,border:"none",cursor:"pointer",opacity:busy?0.6:1,marginTop:4}}>{busy?(editVideo?"আপডেট হচ্ছে...":"আপলোড হচ্ছে..."):(editVideo?"আপডেট করুন ✓":"🚀 পোস্ট করুন")}</button>
        </div>
      )}
    </div>
  );
}

function VideoThumb({ v }) {
  return (
    <div style={{aspectRatio:"9/16",background:"#0a0a0a",borderRadius:4,overflow:"hidden",position:"relative"}}>
      {v.thumbnail?<img src={v.thumbnail} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:v.videoData?<video src={v.videoData} style={{width:"100%",height:"100%",objectFit:"cover"}} muted playsInline/>:<div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:28}}>{v.emoji||"🎬"}</span></div>}
      <div style={{position:"absolute",bottom:0,left:0,right:0,background:"linear-gradient(transparent,rgba(0,0,0,0.85))",padding:"18px 6px 5px"}}>
        <p style={{color:"#fff",fontSize:10,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>@{v.username}</p>
        <div style={{display:"flex",alignItems:"center",gap:3,marginTop:1}}><span style={{color:"#FE2C55",fontSize:9}}>❤️</span><span style={{color:"#aaa",fontSize:9}}>{fmtNum(v.likes||0)}</span></div>
      </div>
    </div>
  );
}

function UserRow({ u, currentUser, following, onFollow }) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderBottom:"1px solid #0d0d0d"}}>
      <div style={{width:50,height:50,borderRadius:"50%",background:"#1a1a1a",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0,border:"1.5px solid #2a2a2a"}}>{u.avatar||"👤"}</div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{display:"flex",alignItems:"center",gap:5}}><p style={{color:"#fff",fontWeight:700,fontSize:14,margin:0}}>{u.displayName}</p>{u.verified&&<span style={{color:"#25F4EE",fontSize:12}}>✔️</span>}{u.admin&&<span style={{fontSize:12}}>🛡</span>}</div>
        <p style={{color:"#555",fontSize:12,margin:0}}>@{u.username}</p>
        {u.bio&&<p style={{color:"#444",fontSize:11,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",marginTop:2}}>{u.bio}</p>}
      </div>
      {u.uid!==currentUser.uid&&<button onClick={()=>onFollow(u.uid,u.username)} style={{background:following[u.uid]?"#1a1a1a":"#FE2C55",border:following[u.uid]?"1px solid #2a2a2a":"none",borderRadius:8,color:"#fff",fontSize:13,fontWeight:700,padding:"7px 14px",cursor:"pointer",flexShrink:0}}>{following[u.uid]?"আনফলো":"ফলো"}</button>}
    </div>
  );
}

function SearchTab({ currentUser, following, onFollow }) {
  const [q, setQ] = useState(""); const [mode, setMode] = useState("all");
  const [users, setUsers] = useState([]); const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false); const [trending, setTrending] = useState([]);
  useEffect(()=>{
    const load = async () => {
      setLoading(true);
      const uk=await slist("user:",true); const us=(await Promise.all(uk.map(k=>sget(k,true)))).filter(Boolean).filter(u=>!u.banned); setUsers(us);
      const vk=await slist("video:",true); const vs=(await Promise.all(vk.map(k=>sget(k,true)))).filter(Boolean); vs.sort((a,b)=>(b.createdAt||0)-(a.createdAt||0)); setVideos(vs);
      const tc={}; vs.forEach(v=>(v.hashtags||[]).forEach(t=>{tc[t]=(tc[t]||0)+1;})); setTrending(Object.entries(tc).sort((a,b)=>b[1]-a[1]).slice(0,12));
      setLoading(false);
    }; load();
  },[]);
  const lq=q.trim().toLowerCase().replace(/^#/,"");
  const fUsers=!lq?users:users.filter(u=>u.username?.toLowerCase().includes(lq)||u.displayName?.toLowerCase().includes(lq));
  const fVids=!lq?videos:videos.filter(v=>v.username?.toLowerCase().includes(lq)||v.caption?.toLowerCase().includes(lq)||(v.hashtags||[]).some(t=>t.includes(lq)));
  const fAll=!lq?{users:users.slice(0,5),videos:videos.slice(0,9)}:{users:fUsers.slice(0,5),videos:fVids.slice(0,12)};
  return (
    <div style={{background:"#000",minHeight:"100%",paddingBottom:100}}>
      <div style={{padding:"56px 14px 0",position:"sticky",top:0,background:"#000",zIndex:10,paddingBottom:10}}>
        <div style={{display:"flex",alignItems:"center",background:"#0d0d0d",borderRadius:14,padding:"11px 14px",gap:10,border:"1px solid #1a1a1a",marginBottom:10}}>
          <IC.Search a={false}/>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="ইউজার, ক্যাপশন বা #হ্যাশট্যাগ..." style={{flex:1,background:"none",border:"none",color:"#fff",fontSize:15,outline:"none",fontFamily:"inherit"}}/>
          {q&&<button onClick={()=>setQ("")} style={{background:"none",border:"none",cursor:"pointer",color:"#444",fontSize:20,lineHeight:1}}>×</button>}
        </div>
        {q&&<div style={{display:"flex",gap:8,marginBottom:2,paddingBottom:8}}>{[["all","전체"],["users","👤 ইউজার"],["videos","🎬 ভিডিও"],["tags","# ট্যাগ"]].map(([m,l])=><button key={m} onClick={()=>setMode(m)} style={{padding:"6px 12px",borderRadius:20,background:mode===m?"#FE2C55":"#1a1a1a",color:"#fff",fontSize:12,border:"none",cursor:"pointer",fontWeight:mode===m?700:400,flexShrink:0}}>{l}</button>)}</div>}
      </div>
      {loading?<div style={{textAlign:"center",padding:"60px 0",color:"#444"}}><p style={{fontSize:32}}>🔍</p><p>লোড হচ্ছে...</p></div>:!q?(
        <div style={{padding:"0 14px"}}>
          <p style={{color:"#fff",fontWeight:700,fontSize:15,marginBottom:12}}>🔥 ট্রেন্ড হ্যাশট্যাগ</p>
          <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:24}}>{trending.length===0?<p style={{color:"#444",fontSize:13}}>এখনো কোনো হ্যাশট্যাগ নেই</p>:trending.map(([tag,cnt])=><button key={tag} onClick={()=>setQ("#"+tag)} style={{display:"flex",alignItems:"center",gap:5,padding:"8px 14px",borderRadius:20,background:"#0d0d0d",border:"1px solid #1a1a1a",cursor:"pointer"}}><IC.Hash/><span style={{color:"#fff",fontSize:13,fontWeight:600}}>{tag}</span><span style={{color:"#444",fontSize:11}}>({cnt})</span></button>)}</div>
          <p style={{color:"#fff",fontWeight:700,fontSize:15,marginBottom:12}}>✨ সম্প্রতি যোগ দিয়েছেন</p>
          <div style={{display:"flex",flexDirection:"column",gap:2}}>{users.slice(0,5).map(u=><UserRow key={u.uid} u={u} currentUser={currentUser} following={following} onFollow={onFollow}/>)}</div>
          {videos.length>0&&<><p style={{color:"#fff",fontWeight:700,fontSize:15,marginBottom:12,marginTop:24}}>🎬 সাম্প্রতিক ভিডিও</p><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:3}}>{videos.slice(0,9).map(v=><VideoThumb key={v.id} v={v}/>)}</div></>}
        </div>
      ):(
        <div style={{padding:"0 14px"}}>
          {(mode==="all"||mode==="users")&&fAll.users.length>0&&<div style={{marginBottom:20}}>{mode==="all"&&<p style={{color:"#666",fontSize:13,marginBottom:10}}>👤 ইউজার</p>}{fAll.users.map(u=><UserRow key={u.uid} u={u} currentUser={currentUser} following={following} onFollow={onFollow}/>)}</div>}
          {(mode==="all"||mode==="videos"||mode==="tags")&&fAll.videos.length>0&&<div>{mode==="all"&&<p style={{color:"#666",fontSize:13,marginBottom:10}}>🎬 ভিডিও</p>}<div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:3}}>{fAll.videos.map(v=><VideoThumb key={v.id} v={v}/>)}</div></div>}
          {fAll.users.length===0&&fAll.videos.length===0&&<div style={{textAlign:"center",padding:"80px 0",color:"#444"}}><p style={{fontSize:40,marginBottom:10}}>😕</p><p>কোনো ফলাফল নেই</p><p style={{fontSize:12,marginTop:6,color:"#333"}}>অন্য কিওয়ার্ড দিয়ে খুঁজুন</p></div>}
        </div>
      )}
    </div>
  );
}

function NotifTab({ currentUser, onClear }) {
  const [notifs, setNotifs] = useState([]); const [loading, setLoading] = useState(true);
  useEffect(()=>{
    const load = async () => {
      setLoading(true);
      const keys=await slist("notif:"+currentUser.uid+":",true);
      const all=(await Promise.all(keys.map(k=>sget(k,true)))).filter(Boolean);
      all.sort((a,b)=>b.createdAt-a.createdAt); setNotifs(all);
      for(const key of keys){const n=await sget(key,true);if(n&&!n.read){n.read=true;await sset(key,n,true);}}
      onClear(); setLoading(false);
    }; load();
  },[currentUser.uid,onClear]);
  const icons={new_video:"🎬",comment:"💬",like:"❤️",follow:"👤",mention:"@"};
  const labels={new_video:"নতুন ভিডিও পোস্ট করেছে",comment:"আপনার ভিডিওতে কমেন্ট করেছে",like:"আপনার ভিডিও লাইক করেছে",follow:"আপনাকে ফলো করেছে",mention:"আপনাকে মেনশন করেছে"};
  return (
    <div style={{background:"#000",minHeight:"100%",paddingBottom:100}}>
      <div style={{padding:"54px 16px 14px",borderBottom:"1px solid #111",position:"sticky",top:0,background:"#000",zIndex:10}}><p style={{color:"#fff",fontWeight:800,fontSize:20,margin:0}}>🔔 নোটিফিকেশন</p></div>
      {loading?<div style={{textAlign:"center",padding:"80px 0",color:"#444"}}><p style={{fontSize:32}}>🔔</p><p>লোড হচ্ছে...</p></div>:notifs.length===0?<div style={{textAlign:"center",padding:"100px 0",color:"#444"}}><p style={{fontSize:52,marginBottom:12}}>🔕</p><p style={{fontSize:15,color:"#555"}}>কোনো নোটিফিকেশন নেই</p></div>:notifs.map((n,i)=>(
      <div key={i} style={{display:"flex",gap:12,padding:"14px 16px",borderBottom:"1px solid #0a0a0a",background:n.read?"transparent":"rgba(254,44,85,0.04)"}}>
        <div style={{width:48,height:48,borderRadius:"50%",background:"#1a1a1a",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{n.fromAvatar||"👤"}</div>
        <div style={{flex:1}}>
          <p style={{color:"#fff",fontSize:14,lineHeight:1.5,margin:0}}><span style={{fontWeight:700}}>{n.fromDisplayName}</span>{" "}<span style={{color:"#666"}}>@{n.fromUsername}</span>{" "}<span style={{color:"#ddd"}}>{labels[n.type]||"অ্যাক্টিভিটি"}</span>{" "}{icons[n.type]||"📣"}</p>
          {n.text&&<p style={{color:"#555",fontSize:12,marginTop:4,fontStyle:"italic"}}>"{n.text}"</p>}
          <p style={{color:"#333",fontSize:11,marginTop:5}}>{fmt(n.createdAt)}</p>
        </div>
        {!n.read&&<div style={{width:8,height:8,borderRadius:"50%",background:"#FE2C55",marginTop:6,flexShrink:0}}/>}
      </div>))}
    </div>
  );
}

function ProfilePage({ targetUser, currentUser, following, onFollow, onBack, onEdit, onLogout }) {
  const [videos, setVideos] = useState([]); const [savedVids, setSavedVids] = useState([]);
  const [tab, setTab] = useState("videos"); const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCountState] = useState(0); const [editing, setEditing] = useState(null);
  const [toast, showToast] = useToast(); const [confirmDel, setConfirmDel] = useState(null);
  const isOwn=targetUser.uid===currentUser.uid; const isFollowing=!!following[targetUser.uid];
  const load = useCallback(async () => {
    const vk=await slist("video:",true); const all=(await Promise.all(vk.map(k=>sget(k,true)))).filter(Boolean);
    setVideos(all.filter(v=>v.uid===targetUser.uid).sort((a,b)=>(b.createdAt||0)-(a.createdAt||0)));
    const fData=await sget("followers:"+targetUser.uid,true)||{}; setFollowerCount(function AdminPanel({ currentUser, onClose }) {
  const [adminTab, setAdminTab] = useState("stats");
  const [users, setUsers] = useState([]); const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true); const [toast, showToast] = useToast();
  const [confirmAction, setConfirmAction] = useState(null);
  const load = useCallback(async () => {
    setLoading(true);
    const uk=await slist("user:",true); const us=(await Promise.all(uk.map(k=>sget(k,true)))).filter(Boolean); us.sort((a,b)=>b.createdAt-a.createdAt); setUsers(us);
    const vk=await slist("video:",true); const vs=(await Promise.all(vk.map(k=>sget(k,true)))).filter(Boolean); vs.sort((a,b)=>b.createdAt-a.createdAt); setVideos(vs);
    setLoading(false);
  },[]);
  useEffect(()=>{ load(); },[load]);
  const banUser = async (u) => { const updated={...u,banned:!u.banned}; await sset("user:"+u.username,updated,true); showToast(updated.banned?"ইউজার ব্যান করা হয়েছে":"ব্যান তুলে নেওয়া হয়েছে",updated.banned?"error":"success"); setConfirmAction(null); load(); };
  const verifyUser = async (u) => { const updated={...u,verified:!u.verified}; await sset("user:"+u.username,updated,true); showToast(updated.verified?"ভেরিফাইড করা হয়েছে ✔️":"ভেরিফিকেশন সরানো হয়েছে","info"); load(); };
  const deleteVideo = async (v) => { await sdel(v.id,true); showToast("ভিডিও মুছে ফেলা হয়েছে","success"); setConfirmAction(null); load(); };
  const totalLikes=videos.reduce((s,v)=>s+(v.likes||0),0); const totalComments=videos.reduce((s,v)=>s+(v.comments||0),0);
  return (
    <div style={{position:"fixed",inset:0,background:"#000",zIndex:400,display:"flex",flexDirection:"column"}}>
      {toast&&<Toast msg={toast.msg} type={toast.type}/>}
      {confirmAction&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}><div style={{background:"#0d0d0d",borderRadius:20,padding:"24px 20px",width:"100%",maxWidth:320,border:"1px solid #1a1a1a"}}><p style={{color:"#fff",fontWeight:700,fontSize:16,marginBottom:8}}>{confirmAction.title}</p><p style={{color:"#555",fontSize:13,marginBottom:20}}>{confirmAction.desc}</p><div style={{display:"flex",gap:10}}><button onClick={()=>setConfirmAction(null)} style={{flex:1,background:"#1a1a1a",color:"#fff",border:"1px solid #2a2a2a",borderRadius:10,padding:"11px",fontSize:14,cursor:"pointer"}}>বাতিল</button><button onClick={confirmAction.fn} style={{flex:1,background:"#FE2C55",color:"#fff",border:"none",borderRadius:10,padding:"11px",fontSize:14,fontWeight:700,cursor:"pointer"}}>নিশ্চিত</button></div></div></div>}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 18px",borderBottom:"1px solid #111",background:"#080808"}}>
        <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",padding:4}}><IC.Back/></button>
        <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:16}}>🛡</span><span style={{color:"#fff",fontWeight:700,fontSize:16}}>অ্যাডমিন প্যানেল</span></div>
        <div style={{width:30}}/>
      </div>
      <div style={{display:"flex",borderBottom:"1px solid #111",background:"#000",flexShrink:0}}>
        {[["stats","📊 স্ট্যাটস"],["users","👥 ইউজার"],["videos","🎬 ভিডিও"]].map(([t,l])=><button key={t} onClick={()=>setAdminTab(t)} style={{flex:1,color:adminTab===t?"#fff":"#444",fontWeight:adminTab===t?700:400,fontSize:13,background:"none",border:"none",cursor:"pointer",padding:"12px 4px",borderBottom:adminTab===t?"2px solid #FE2C55":"2px solid transparent"}}>{l}</button>)}
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"16px"}}>
        {loading?<div style={{textAlign:"center",padding:"60px 0",color:"#444"}}>লোড হচ্ছে...</div>:adminTab==="stats"?(
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              {[["👥 ইউজার",users.length,"#FE2C55"],["🎬 ভিডিও",videos.length,"#25F4EE"],["❤️ টোটাল লাইক",fmtNum(totalLikes),"#FE2C55"],["💬 কমেন্ট",fmtNum(totalComments),"#25F4EE"]].map(([l,v,c])=><div key={l} style={{background:"#0d0d0d",borderRadius:14,padding:"18px 16px",border:"1px solid #1a1a1a"}}><p style={{color:"#666",fontSize:12,margin:"0 0 6px"}}>{l}</p><p style={{color:c,fontWeight:800,fontSize:28,margin:0}}>{v}</p></div>)}
            </div>
            <div style={{background:"#0d0d0d",borderRadius:14,padding:"16px",border:"1px solid #1a1a1a"}}>
              <p style={{color:"#fff",fontWeight:700,fontSize:14,marginBottom:12}}>🏆 টপ ক্রিয়েটর</p>
              {[...users].sort((a,b)=>{const av=videos.filter(v=>v.uid===a.uid).reduce((s,v)=>s+(v.likes||0),0);const bv=videos.filter(v=>v.uid===b.uid).reduce((s,v)=>s+(v.likes||0),0);return bv-av;}).slice(0,5).map((u,i)=>{
                const ul=videos.filter(v=>v.uid===u.uid).reduce((s,v)=>s+(v.likes||0),0);
                return <div key={u.uid} style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}><span style={{color:i===0?"#FFD700":i===1?"#C0C0C0":i===2?"#CD7F32":"#555",fontWeight:700,fontSize:14,width:20}}>#{i+1}</span><div style={{width:36,height:36,borderRadius:"50%",background:"#1a1a1a",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{u.avatar}</div><div style={{flex:1}}><p style={{color:"#fff",fontSize:13,fontWeight:600,margin:0}}>{u.displayName}</p><p style={{color:"#444",fontSize:11,margin:0}}>❤️ {fmtNum(ul)} লাইক</p></div>{u.verified&&<span style={{color:"#25F4EE",fontSize:12}}>✔️</span>}</div>;
              })}
            </div>
          </div>
        ):adminTab==="users"?(
          <div>
            <p style={{color:"#666",fontSize:13,marginBottom:12}}>মোট {users.length} জন ইউজার</p>
            {users.map(u=><div key={u.uid} style={{display:"flex",alignItems:"center",gap:10,padding:"12px 0",borderBottom:"1px solid #0d0d0d"}}>
              <div style={{width:44,height:44,borderRadius:"50%",background:"#1a1a1a",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0,position:"relative"}}>{u.avatar}{u.banned&&<div style={{position:"absolute",inset:0,borderRadius:"50%",background:"rgba(254,44,85,0.4)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>🚫</div>}</div>
              <div style={{flex:1,minWidth:0}}><div style={{display:"flex",alignItems:"center",gap:5}}><span style={{color:u.banned?"#FE2C55":"#fff",fontWeight:600,fontSize:13}}>{u.displayName}</span>{u.verified&&<span style={{color:"#25F4EE",fontSize:11}}>✔️</span>}{u.admin&&<span style={{fontSize:11}}>🛡</span>}</div><span style={{color:"#444",fontSize:11}}>@{u.username} · {videos.filter(v=>v.uid===u.uid).length} ভিডিও</span></div>
              {u.uid!==currentUser.uid&&<div style={{display:"flex",gap:6,flexShrink:0}}>
                <button onClick={()=>verifyUser(u)} style={{background:u.verified?"#1a1a1a":"rgba(37,244,238,0.15)",border:`1px solid ${u.verified?"#2a2a2a":"#25F4EE"}`,borderRadius:6,color:u.verified?"#666":"#25F4EE",fontSize:11,padding:"5px 8px",cursor:"pointer"}}>{u.verified?"✔️ সরান":"✔️"}</button>
                <button onClick={()=>setConfirmAction({title:u.banned?"ব্যান তুলবেন?":"ব্যান করবেন?",desc:`@${u.username} কে ${u.banned?"ব্যান থেকে মুক্ত করবেন":"ব্যান করবেন"}?`,fn:()=>banUser(u)})} style={{background:"rgba(254,44,85,0.1)",border:"1px solid rgba(254,44,85,0.3)",borderRadius:6,color:"#FE2C55",fontSize:11,padding:"5px 8px",cursor:"pointer"}}>{u.banned?"আনব্যান":"ব্যান"}</button>
              </div>}
            </div>)}
          </div>
        ):(
          <div>
            <p style={{color:"#666",fontSize:13,marginBottom:12}}>মোট {videos.length}টি ভিডিও</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {videos.map(v=><div key={v.id} style={{background:"#0d0d0d",borderRadius:12,overflow:"hidden",border:"1px solid #1a1a1a"}}>
                <div style={{aspectRatio:"9/16",maxHeight:180,background:"#000",position:"relative",display:"flex",alignItems:"center",justifyContent:"center"}}>{v.thumbnail?<img src={v.thumbnail} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:v.videoData?<video src={v.videoData} style={{width:"100%",height:"100%",objectFit:"cover"}} muted playsInline/>:<span style={{fontSize:36}}>{v.emoji||"🎬"}</span>}</div>
                <div style={{padding:"8px 10px"}}><p style={{color:"#fff",fontSize:11,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",margin:0}}>@{v.username}</p><p style={{color:"#444",fontSize:10,marginTop:2}}>❤️{fmtNum(v.likes||0)} 💬{fmtNum(v.comments||0)}</p><button onClick={()=>setConfirmAction({title:"ভিডিও মুছবেন?",desc:"এই ভিডিও পার্মানেন্ট মুছে যাবে।",fn:()=>deleteVideo(v)})} style={{width:"100%",marginTop:6,background:"rgba(254,44,85,0.1)",border:"1px solid rgba(254,44,85,0.3)",borderRadius:6,color:"#FE2C55",fontSize:11,padding:"5px",cursor:"pointer"}}>🗑 মুছুন</button></div>
              </div>)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null); const [tab, setTab] = useState("home");
  const [booting, setBooting] = useState(true); const [showUpload, setShowUpload] = useState(false);
  const [uploadKey, setUploadKey] = useState(0); const [following, setFollowing] = useState({});
  const [liked, setLiked] = useState({}); const [likeCounts, setLikeCounts] = useState({});
  const [bookmarks, setBookmarks] = useState({}); const [unread, setUnread] = useState(0);
  const [profileTarget, setProfileTarget] = useState(null); const [editingProfile, setEditingProfile] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false); const [toast, showToast] = useToast();

  useEffect(()=>{
    const boot = async () => {
      const sess=await sget("session",false);
      if(sess?.username){const u=await sget("user:"+sess.username,true);if(u&&!u.banned){setUser(u);setFollowing(await sget("following:"+u.uid,false)||{});setLiked(await sget("liked:"+u.uid,false)||{});setBookmarks(await sget("bookmarks:"+u.uid,false)||{});}}
      setBooting(false);
    }; boot();
  },[]);

  useEffect(()=>{
    if(!user) return;
    const check = async () => { const keys=await slist("notif:"+user.uid+":",true);let cnt=0;for(const k of keys){const n=await sget(k,true);if(n&&!n.read)cnt++;}setUnread(cnt); };
    check(); const t=setInterval(check,12000); return ()=>clearInterval(t);
  },[user]);

  const handleFollow = useCallback(async (targetUid,targetUsername) => {
    if(!user) return;
    const fw={...following}; const nowFollowing=!fw[targetUid];
    if(nowFollowing) fw[targetUid]={username:targetUsername,since:Date.now()}; else delete fw[targetUid];
    setFollowing(fw); await sset("following:"+user.uid,fw,false);
    const fData=await sget("followers:"+targetUid,true)||{};
    if(nowFollowing){fData[user.uid]={username:user.username,since:Date.now()};await sset("notif:"+targetUid+":"+Date.now()+"_f",{type:"follow",fromUid:user.uid,fromUsername:user.username,fromAvatar:user.avatar,fromDisplayName:user.displayName,createdAt:Date.now(),read:false},true);}else delete fData[user.uid];
    await sset("followers:"+targetUid,fData,true);
    showToast(nowFollowing?"ফলো করা হয়েছে ✓":"আনফলো করা হয়েছে",nowFollowing?"success":"info");
  },[user,following,showToast]);

  const handleLike = useCallback(async (vidId) => {
    if(!user) return;
    const nl={...liked,[vidId]:!liked[vidId]}; setLiked(nl); await sset("liked:"+user.uid,nl,false);
    const vid=await sget(vidId,true);
    if(vid){vid.likes=Math.max(0,(vid.likes||0)+(nl[vidId]?1:-1));await sset(vidId,vid,true);setLikeCounts(p=>({...p,[vidId]:vid.likes}));if(nl[vidId]&&vid.uid!==user.uid)await sset("notif:"+vid.uid+":"+Date.now()+"_l",{type:"like",fromUid:user.uid,fromUsername:user.username,fromAvatar:user.avatar,fromDisplayName:user.displayName,videoId:vidId,createdAt:Date.now(),read:false},true);}
  },[user,liked]);

  const handleBookmark = useCallback(async (vidId) => {
    if(!user) return;
    const nb={...bookmarks,[vidId]:!bookmarks[vidId]}; if(!nb[vidId]) delete nb[vidId];
    setBookmarks(nb); await sset("bookmarks:"+user.uid,nb,false);
    showToast(nb[vidId]?"সেভ হয়েছে 🔖":"সেভ থেকে সরানো হয়েছে","info");
  },[user,bookmarks,showToast]);

  const handleLogout = async () => { await sset("session",null,false); setUser(null);setFollowing({});setLiked({});setBookmarks({});setTab("home"); };
  const handleOpenProfile = (video) => { setProfileTarget({uid:video.uid,username:video.username,displayName:video.displayName,avatar:video.avatar,bio:video.bio||"",verified:video.verified||false,admin:video.admin||false}); };

  if(booting) return <div style={{height:"100dvh",background:"#000",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16}}><div style={{fontSize:60,filter:"drop-shadow(0 0 25px #FE2C55)"}}>🎬</div><p style={{color:"#222",fontSize:13,fontWeight:600,letterSpacing:3}}>VIBEREEL</p></div>;
  if(!user) return <AuthScreen onLogin={setUser}/>;

  const TABS = [
    {id:"home",label:"হোম",icon:<IC.Home a={tab==="home"}/>},
    {id:"search",label:"সার্চ",icon:<IC.Search a={tab==="search"}/>},
    {id:"notif",label:"নোটিফ",icon:<IC.Bell a={tab==="notif"} n={unread}/>},
    {id:"profile",label:"প্রোফাইল",icon:<IC.User a={tab==="profile"}/>},
  ];

  return (
    <div style={{width:"100%",height:"100dvh",background:"#000",display:"flex",flexDirection:"column",overflow:"hidden",position:"relative",fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"}}>
      {toast&&<Toast msg={toast.msg} type={toast.type}/>}
      {showAdmin&&<AdminPanel currentUser={user} onClose={()=>setShowAdmin(false)}/>}
      {profileTarget&&!showAdmin&&<div style={{position:"fixed",inset:0,zIndex:150,overflowY:"auto",background:"#000"}}><ProfilePage targetUser={profileTarget} currentUser={user} following={following} onFollow={handleFollow} onBack={()=>setProfileTarget(null)} onEdit={()=>setEditingProfile(true)} onLogout={handleLogout}/></div>}
      {editingProfile&&<EditProfileScreen currentUser={user} onSave={(updated)=>{setUser(updated);setEditingProfile(false);}} onClose={()=>setEditingProfile(false)}/>}
      {showUpload&&<UploadScreen currentUser={user} onClose={()=>setShowUpload(false)} onUploaded={()=>{setUploadKey(k=>k+1);setTab("home");}}/>}
      <div style={{flex:1,overflowY:"auto",overflowX:"hidden",position:"relative"}}>
        {tab==="home"&&<HomeTab currentUser={user} following={following} bookmarks={bookmarks} liked={liked} likeCounts={likeCounts} onFollow={handleFollow} onBookmark={handleBookmark} onLike={handleLike} onOpenProfile={handleOpenProfile} refresh={uploadKey}/>}
        {tab==="search"&&<SearchTab currentUser={user} following={following} onFollow={handleFollow}/>}
        {tab==="notif"&&<NotifTab currentUser={user} onClear={()=>setUnread(0)}/>}
        {tab==="profile"&&<ProfilePage targetUser={user} currentUser={user} following={following} onFollow={handleFollow} onEdit={()=>setEditingProfile(true)} onLogout={handleLogout}/>}
      </div>
      <div style={{display:"flex",alignItems:"stretch",background:"#060606",borderTop:"1px solid #111",paddingBottom:"env(safe-area-inset-bottom)",zIndex:100,flexShrink:0}}>
        {TABS.slice(0,2).map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"10px 0 8px",background:"none",border:"none",cursor:"pointer",gap:3}}>{t.icon}<span style={{color:tab===t.id?"#fff":"#444",fontSize:10,fontWeight:tab===t.id?700:400}}>{t.label}</span></button>)}
        <button onClick={()=>setShowUpload(true)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"8px 0 6px",background:"none",border:"none",cursor:"pointer",gap:3}}>
          <div style={{width:46,height:30,borderRadius:10,background:"linear-gradient(135deg,#FE2C55,#ff4d6d)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 14px rgba(254,44,85,0.45)"}}><IC.Plus/></div>
          <span style={{color:"#444",fontSize:10}}>আপলোড</span>
        </button>
        {TABS.slice(2).map(t=><button key={t.id} onClick={()=>{setTab(t.id);if(t.id==="notif")setUnread(0);}} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"10px 0 8px",background:"none",border:"none",cursor:"pointer",gap:3}}>{t.icon}<span style={{color:tab===t.id?"#fff":"#444",fontSize:10,fontWeight:tab===t.id?700:400}}>{t.label}</span></button>)}
      </div>
      {user.admin&&<button onClick={()=>setShowAdmin(true)} style={{position:"fixed",bottom:80,right:16,background:"linear-gradient(135deg,#1a0a0e,#2a0a10)",border:"1px solid rgba(254,44,85,0.4)",borderRadius:12,color:"#FE2C55",fontSize:12,fontWeight:700,padding:"8px 12px",cursor:"pointer",zIndex:99,display:"flex",alignItems:"center",gap:6}}>🛡 Admin</button>}
    </div>
  );
    }
