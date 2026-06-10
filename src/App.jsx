import { useState, useRef, useEffect, useCallback } from "react";

// ─── ICONS ─────────────────────────────────────────────────────
const IC = {
  Home: ({ a }) => <svg width="24" height="24" fill={a?"white":"none"} stroke={a?"white":"#777"} strokeWidth="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Friends: ({ a }) => <svg width="24" height="24" fill="none" stroke={a?"white":"#777"} strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
  Inbox: ({ a, n }) => <div style={{position:"relative"}}><svg width="24" height="24" fill="none" stroke={a?"white":"#777"} strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>{n>0&&<span style={{position:"absolute",top:-4,right:-6,background:"#fe2c55",color:"white",fontSize:9,fontWeight:700,minWidth:15,height:15,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 3px"}}>{n}</span>}</div>,
  Profile: ({ a }) => <svg width="24" height="24" fill="none" stroke={a?"white":"#777"} strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Heart: ({ f }) => <svg width="28" height="28" fill={f?"#fe2c55":"white"} viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
  Comment: () => <svg width="28" height="28" fill="white" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
  Share: () => <svg width="26" height="26" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/></svg>,
  Back: () => <svg width="22" height="22" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>,
  Send: () => <svg width="18" height="18" fill="white" viewBox="0 0 24 24"><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  Edit: () => <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Camera: () => <svg width="20" height="20" fill="none" stroke="#555" strokeWidth="2" viewBox="0 0 24 24"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  Search: ({ a }) => <svg width="24" height="24" fill="none" stroke={a?"white":"#777"} strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Plus: () => <svg width="22" height="22" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Check: () => <svg width="16" height="16" fill="none" stroke="#00e5ff" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>,
  Upload: () => <svg width="28" height="28" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/></svg>,
  Video: () => <svg width="24" height="24" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>,
  Close: () => <svg width="22" height="22" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
};

const AVATARS = ["🐯","🦊","🐺","🦁","🐻","🐼","🐨","🦅","🐉","🌟","⚡","🔥","🌊","🌸","🍀","🎭","💎","🎸","🚀","🎯"];
const BG_GRADIENTS = [
  "from-purple-900 via-indigo-900 to-black",
  "from-rose-900 via-pink-900 to-black",
  "from-green-900 via-emerald-900 to-black",
  "from-yellow-900 via-amber-900 to-black",
  "from-blue-900 via-cyan-900 to-black",
  "from-red-900 via-orange-900 to-black",
];
const VID_EMOJIS = ["🎵","🎬","🌟","🔥","💫","🎭","🌊","⚡","🎮","🌺","😎","🤩"];

function fmtTime(ts) {
  if (!ts) return "";
  const d = new Date(ts), now = new Date();
  const diff = (now - d) / 1000;
  if (diff < 60) return "এখনই";
  if (diff < 3600) return Math.floor(diff/60) + "m আগে";
  if (diff < 86400) return Math.floor(diff/3600) + "h আগে";
  return d.toLocaleDateString("bn-BD");
}

// ─── STORAGE HELPERS ──────────────────────────────────────────
async function sget(key, shared=false) {
  try { const r = await window.storage.get(key, shared); return r ? JSON.parse(r.value) : null; } catch { return null; }
}
async function sset(key, val, shared=false) {
  try { await window.storage.set(key, JSON.stringify(val), shared); return true; } catch { return false; }
}
async function slist(prefix, shared=false) {
  try { const r = await window.storage.list(prefix, shared); return r?.keys || []; } catch { return []; }
}

// ─── AUTH SCREEN ──────────────────────────────────────────────
function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState("welcome");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [bio, setBio] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const doLogin = async () => {
    if (!username.trim() || !password.trim()) { setError("সব ফিল্ড পূরণ করুন"); return; }
    setLoading(true); setError("");
    const user = await sget("user:" + username.toLowerCase().trim(), true);
    if (!user) { setError("অ্যাকাউন্ট পাওয়া যায়নি"); setLoading(false); return; }
    if (user.password !== password) { setError("পাসওয়ার্ড ভুল"); setLoading(false); return; }
    await sset("session", { uid: user.uid, username: user.username }, false);
    onLogin(user);
    setLoading(false);
  };

  const doSignup = async () => {
    if (!username.trim() || !password.trim() || !displayName.trim()) { setError("সব ফিল্ড পূরণ করুন"); return; }
    if (username.length < 3) { setError("ইউজারনেম কমপক্ষে ৩ অক্ষর"); return; }
    if (password.length < 4) { setError("পাসওয়ার্ড কমপক্ষে ৪ অক্ষর"); return; }
    setLoading(true); setError("");
    const existing = await sget("user:" + username.toLowerCase().trim(), true);
    if (existing) { setError("এই ইউজারনেম আগেই নেওয়া হয়েছে"); setLoading(false); return; }
    const uid = "u_" + Date.now() + "_" + Math.random().toString(36).slice(2,7);
    const user = { uid, username: username.toLowerCase().trim(), displayName: displayName.trim(), password, avatar, bio, followers: 0, following: 0, likes: 0, createdAt: Date.now() };
    await sset("user:" + user.username, user, true);
    await sset("session", { uid, username: user.username }, false);
    onLogin(user);
    setLoading(false);
  };

  const inp = (placeholder, value, onChange, type="text", emoji="") => (
    <div style={{position:"relative", marginBottom:12}}>
      {emoji && <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:16}}>{emoji}</span>}
      <input type={type} placeholder={placeholder} value={value} onChange={e=>onChange(e.target.value)}
        style={{width:"100%",background:"#1a1a1a",border:"1px solid #2a2a2a",borderRadius:12,color:"white",padding:`12px ${emoji?"40px":"14px"} 12px ${emoji?"40px":"14px"}`,fontSize:15,outline:"none",boxSizing:"border-box",fontFamily:"inherit"}}/>
    </div>
  );

  if (mode === "welcome") return (
    <div style={{height:"100vh",background:"#000",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"0 28px"}}>
      <div style={{fontSize:72,marginBottom:16}}>🎬</div>
      <h1 style={{color:"white",fontSize:28,fontWeight:800,letterSpacing:-1,marginBottom:6}}>VideoApp</h1>
      <p style={{color:"#666",fontSize:14,marginBottom:40,textAlign:"center"}}>ভিডিও শেয়ার করুন, বন্ধু বানান</p>
      <button onClick={()=>setMode("signup")} style={{width:"100%",background:"linear-gradient(135deg,#fe2c55,#ff6b6b)",color:"white",fontWeight:700,fontSize:16,padding:"14px",borderRadius:14,border:"none",cursor:"pointer",marginBottom:12}}>নতুন অ্যাকাউন্ট তৈরি করুন</button>
      <button onClick={()=>setMode("login")} style={{width:"100%",background:"#1a1a1a",color:"white",fontWeight:600,fontSize:16,padding:"14px",borderRadius:14,border:"1px solid #333",cursor:"pointer"}}>লগইন করুন</button>
    </div>
  );

  if (mode === "login") return (
    <div style={{height:"100vh",background:"#000",display:"flex",flexDirection:"column",padding:"60px 24px 0"}}>
      <button onClick={()=>{setMode("welcome");setError("");}} style={{background:"none",border:"none",cursor:"pointer",alignSelf:"flex-start",marginBottom:24}}><IC.Back/></button>
      <h2 style={{color:"white",fontSize:24,fontWeight:800,marginBottom:4}}>স্বাগতম 👋</h2>
      <p style={{color:"#666",fontSize:14,marginBottom:28}}>আপনার অ্যাকাউন্টে লগইন করুন</p>
      {inp("ইউজারনেম", username, setUsername, "text", "👤")}
      {inp("পাসওয়ার্ড", password, setPassword, "password", "🔒")}
      {error && <p style={{color:"#fe2c55",fontSize:13,marginBottom:12}}>{error}</p>}
      <button onClick={doLogin} disabled={loading} style={{width:"100%",background:"linear-gradient(135deg,#fe2c55,#ff6b6b)",color:"white",fontWeight:700,fontSize:16,padding:"14px",borderRadius:14,border:"none",cursor:"pointer",marginTop:8,opacity:loading?0.7:1}}>
        {loading ? "লোড হচ্ছে..." : "লগইন করুন"}
      </button>
      <p style={{color:"#666",fontSize:13,textAlign:"center",marginTop:20}}>অ্যাকাউন্ট নেই? <button onClick={()=>{setMode("signup");setError("");}} style={{background:"none",border:"none",color:"#fe2c55",cursor:"pointer",fontSize:13,fontWeight:600}}>সাইনআপ করুন</button></p>
    </div>
  );

  return (
    <div style={{height:"100vh",background:"#000",overflowY:"auto",padding:"50px 24px 40px"}}>
      <button onClick={()=>{setMode("welcome");setError("");}} style={{background:"none",border:"none",cursor:"pointer",marginBottom:20}}><IC.Back/></button>
      <h2 style={{color:"white",fontSize:24,fontWeight:800,marginBottom:4}}>প্রোফাইল তৈরি করুন</h2>
      <p style={{color:"#666",fontSize:14,marginBottom:24}}>আপনার তথ্য দিন</p>
      <p style={{color:"#aaa",fontSize:13,marginBottom:10}}>আপনার আইকন বেছে নিন</p>
      <div style={{display:"flex",flexWrap:"wrap",gap:10,marginBottom:20}}>
        {AVATARS.map(a=>(
          <button key={a} onClick={()=>setAvatar(a)} style={{width:44,height:44,borderRadius:12,background:avatar===a?"#222":"#111",border:avatar===a?"2px solid #fe2c55":"2px solid transparent",fontSize:22,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.15s"}}>
            {a}
          </button>
        ))}
      </div>
      {inp("ডিসপ্লে নেম (যেমন: Mahedi)", displayName, setDisplayName, "text", "✨")}
      {inp("ইউজারনেম (যেমন: mahedi_123)", username, setUsername, "text", "@")}
      {inp("পাসওয়ার্ড (কমপক্ষে ৪ অক্ষর)", password, setPassword, "password", "🔒")}
      <div style={{position:"relative",marginBottom:12}}>
        <textarea placeholder="বায়ো লিখুন (ঐচ্ছিক)..." value={bio} onChange={e=>setBio(e.target.value)} rows={2}
          style={{width:"100%",background:"#1a1a1a",border:"1px solid #2a2a2a",borderRadius:12,color:"white",padding:"12px 14px",fontSize:15,outline:"none",resize:"none",boxSizing:"border-box",fontFamily:"inherit"}}/>
      </div>
      {error && <p style={{color:"#fe2c55",fontSize:13,marginBottom:12}}>{error}</p>}
      <button onClick={doSignup} disabled={loading} style={{width:"100%",background:"linear-gradient(135deg,#fe2c55,#ff6b6b)",color:"white",fontWeight:700,fontSize:16,padding:"14px",borderRadius:14,border:"none",cursor:"pointer",opacity:loading?0.7:1}}>
        {loading ? "তৈরি হচ্ছে..." : "অ্যাকাউন্ট তৈরি করুন ✓"}
      </button>
      <p style={{color:"#666",fontSize:13,textAlign:"center",marginTop:16}}>আগেই অ্যাকাউন্ট আছে? <button onClick={()=>{setMode("login");setError("");}} style={{background:"none",border:"none",color:"#fe2c55",cursor:"pointer",fontSize:13,fontWeight:600}}>লগইন করুন</button></p>
    </div>
  );
}

// ─── UPLOAD MODAL ─────────────────────────────────────────────
function UploadModal({ currentUser, onClose, onUploaded }) {
  const [caption, setCaption] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState(VID_EMOJIS[0]);
  const [selectedBg, setSelectedBg] = useState(BG_GRADIENTS[0]);
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [step, setStep] = useState("pick"); // pick | details
  const fileRef = useRef();

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (!f.type.startsWith("video/")) { alert("শুধু ভিডিও ফাইল সাপোর্টেড"); return; }
    if (f.size > 50 * 1024 * 1024) { alert("ভিডিও সাইজ সর্বোচ্চ ৫০MB"); return; }
    setVideoFile(f);
    const url = URL.createObjectURL(f);
    setVideoPreview(url);
    setStep("details");
  };

  const doUpload = async () => {
    if (!caption.trim()) { alert("ক্যাপশন দিন"); return; }
    setUploading(true);
    try {
      const vid = {
        id: "video:" + Date.now() + "_" + Math.random().toString(36).slice(2,7),
        uid: currentUser.uid,
        username: currentUser.username,
        displayName: currentUser.displayName,
        avatar: currentUser.avatar,
        caption: caption.trim(),
        emoji: selectedEmoji,
        bg: selectedBg,
        likes: 0,
        comments: 0,
        hasVideo: !!videoFile,
        createdAt: Date.now(),
      };
      // Store video as base64 if provided
      if (videoFile) {
        const base64 = await new Promise((res, rej) => {
          const reader = new FileReader();
          reader.onload = () => res(reader.result);
          reader.onerror = rej;
          reader.readAsDataURL(videoFile);
        });
        vid.videoData = base64;
      }
      await sset(vid.id, vid, true);
      onUploaded();
      onClose();
    } catch(e) {
      alert("আপলোড ব্যর্থ হয়েছে");
    }
    setUploading(false);
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.92)",zIndex:200,display:"flex",flexDirection:"column",overflowY:"auto"}}>
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 18px",borderBottom:"1px solid #1f1f1f",position:"sticky",top:0,background:"#0a0a0a",zIndex:10}}>
        <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",padding:4}}><IC.Close/></button>
        <span style={{color:"white",fontWeight:700,fontSize:16}}>নতুন ভিডিও</span>
        <div style={{width:30}}/>
      </div>

      {step === "pick" ? (
        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"0 24px",gap:20}}>
          <div style={{width:110,height:110,borderRadius:"50%",background:"#1a1a1a",border:"2px dashed #333",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}} onClick={()=>fileRef.current?.click()}>
            <IC.Upload/>
          </div>
          <div style={{textAlign:"center"}}>
            <p style={{color:"white",fontWeight:600,fontSize:17,marginBottom:6}}>গ্যালারি থেকে ভিডিও বেছে নিন</p>
            <p style={{color:"#555",fontSize:13}}>MP4, MOV সাপোর্টেড • সর্বোচ্চ ৫০MB</p>
          </div>
          <button onClick={()=>fileRef.current?.click()} style={{background:"linear-gradient(135deg,#fe2c55,#ff6b6b)",color:"white",fontWeight:700,fontSize:15,padding:"13px 32px",borderRadius:12,border:"none",cursor:"pointer"}}>
            📁 ফাইল বেছে নিন
          </button>
          <input ref={fileRef} type="file" accept="video/*" onChange={handleFile} style={{display:"none"}}/>
          {/* Skip to emoji post */}
          <button onClick={()=>setStep("details")} style={{background:"none",border:"none",color:"#555",fontSize:13,cursor:"pointer",marginTop:8}}>
            বা শুধু ইমোজি পোস্ট করুন →
          </button>
        </div>
      ) : (
        <div style={{padding:"20px 18px 40px",display:"flex",flexDirection:"column",gap:16}}>
          {/* Preview */}
          <div style={{borderRadius:14,overflow:"hidden",background:"#111",aspectRatio:"9/16",maxHeight:260,display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
            {videoPreview ? (
              <video src={videoPreview} style={{width:"100%",height:"100%",objectFit:"cover"}} controls muted autoPlay loop playsInline/>
            ) : (
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
                <span style={{fontSize:56}}>{selectedEmoji}</span>
                <p style={{color:"#555",fontSize:12}}>ইমোজি প্রিভিউ</p>
                </div>
            )}
            {!videoPreview && (
              <button onClick={()=>fileRef.current?.click()} style={{position:"absolute",top:8,right:8,background:"rgba(0,0,0,0.6)",border:"1px solid #333",borderRadius:8,color:"#aaa",fontSize:11,padding:"5px 10px",cursor:"pointer"}}>
                📁 ভিডিও যোগ করুন
              </button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="video/*" onChange={handleFile} style={{display:"none"}}/>

          {/* Caption */}
          <div>
            <p style={{color:"#aaa",fontSize:13,marginBottom:8}}>ক্যাপশন *</p>
            <textarea value={caption} onChange={e=>setCaption(e.target.value)} placeholder="আপনার ভিডিও সম্পর্কে লিখুন..." rows={3}
              style={{width:"100%",background:"#1a1a1a",border:"1px solid #2a2a2a",borderRadius:12,color:"white",padding:"12px",fontSize:14,outline:"none",resize:"none",boxSizing:"border-box",fontFamily:"inherit"}}/>
          </div>

          {/* Emoji picker */}
          {!videoPreview && (
            <div>
              <p style={{color:"#aaa",fontSize:13,marginBottom:8}}>ইমোজি থিম</p>
              <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                {VID_EMOJIS.map(e=>(
                  <button key={e} onClick={()=>setSelectedEmoji(e)}
                    style={{width:40,height:40,borderRadius:10,background:selectedEmoji===e?"#2a1a2a":"#111",border:selectedEmoji===e?"2px solid #fe2c55":"2px solid #222",fontSize:20,cursor:"pointer"}}>
                    {e}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Background picker */}
          {!videoPreview && (
            <div>
              <p style={{color:"#aaa",fontSize:13,marginBottom:8}}>ব্যাকগ্রাউন্ড</p>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {BG_GRADIENTS.map((bg,i)=>{
                  const colors = [["#6d28d9","#312e81"],["#881337","#831843"],["#14532d","#064e3b"],["#713f12","#451a03"],["#1e3a5f","#164e63"],["#7f1d1d","#7c2d12"]];
                  const [c1,c2] = colors[i]||["#333","#111"];
                  return (
                    <button key={bg} onClick={()=>setSelectedBg(bg)}
                      style={{width:40,height:40,borderRadius:10,background:`linear-gradient(135deg,${c1},${c2})`,border:selectedBg===bg?"3px solid white":"3px solid transparent",cursor:"pointer",flexShrink:0}}/>
                  );
                })}
              </div>
            </div>
          )}

          <button onClick={doUpload} disabled={uploading}
            style={{background:"linear-gradient(135deg,#fe2c55,#ff6b6b)",color:"white",fontWeight:700,fontSize:16,padding:"14px",borderRadius:14,border:"none",cursor:"pointer",marginTop:4,opacity:uploading?0.7:1}}>
            {uploading ? "আপলোড হচ্ছে..." : "🚀 পোস্ট করুন"}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── VIDEO CARD ────────────────────────────────────────────────
function VideoCard({ video, liked, onLike }) {
  return (
    <div style={{position:"relative",width:"100%",height:"100vh",flexShrink:0,overflow:"hidden",background:"#000",scrollSnapAlign:"start"}}>
      {video.videoData ? (
        <video src={video.videoData} style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover"}} autoPlay loop muted playsInline/>
      ) : (
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom, #1a0030, #000)",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <span style={{fontSize:90}}>{video.emoji||"🎬"}</span>
        </div>
      )}
      <div style={{position:"absolute",inset:0,background:"linear-gradient(to top, rgba(0,0,0,0.9) 28%, transparent 60%)"}}/>
      {/* Right actions */}
      <div style={{position:"absolute",right:12,bottom:100,display:"flex",flexDirection:"column",alignItems:"center",gap:18,zIndex:10}}>
        <div style={{marginBottom:4}}>
          <div style={{width:46,height:46,borderRadius:"50%",border:"2px solid white",background:"#111",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>{video.avatar||"🎬"}</div>
        </div>
        <button onClick={()=>onLike(video.id)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,background:"none",border:"none",cursor:"pointer"}}>
          <IC.Heart f={liked}/>
          <span style={{color:"white",fontSize:11}}>{liked ? (video.likes||0)+1 : (video.likes||0)}</span>
        </button>
        <button style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,background:"none",border:"none",cursor:"pointer"}}>
          <IC.Comment/>
          <span style={{color:"white",fontSize:11}}>{video.comments||0}</span>
        </button>
        <button style={{background:"none",border:"none",cursor:"pointer"}}><IC.Share/></button>
      </div>
      {/* Info */}
      <div style={{position:"absolute",bottom:90,left:14,right:72,zIndex:10}}>
        <p style={{color:"white",fontWeight:700,fontSize:15}}>{video.displayName||"User"} <span style={{color:"#aaa",fontWeight:400,fontSize:12}}>@{video.username}</span></p>
        <p style={{color:"#ddd",fontSize:13,marginTop:4,lineHeight:1.5}}>{video.caption}</p>
        <p style={{color:"#666",fontSize:11,marginTop:4}}>{fmtTime(video.createdAt)}</p>
      </div>
    </div>
  );
}

// ─── SEARCH TAB ───────────────────────────────────────────────
function SearchTab({ currentUser }) {
  const [query, setQuery] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [allVideos, setAllVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchMode, setSearchMode] = useState("users"); // users | videos
  const inputRef = useRef();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const ukeys = await slist("user:", true);
      const users = (await Promise.all(ukeys.map(k=>sget(k,true)))).filter(Boolean);
      setAllUsers(users);
      const vkeys = await slist("video:", true);
      const videos = (await Promise.all(vkeys.map(k=>sget(k,true)))).filter(Boolean);
      videos.sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));
      setAllVideos(videos);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = query.trim() === ""
    ? (searchMode === "users" ? allUsers : allVideos)
    : searchMode === "users"
      ? allUsers.filter(u =>
          u.username?.toLowerCase().includes(query.toLowerCase()) ||
          u.displayName?.toLowerCase().includes(query.toLowerCase())
        )
      : allVideos.filter(v =>
          v.username?.toLowerCase().includes(query.toLowerCase()) ||
          v.displayName?.toLowerCase().includes(query.toLowerCase()) ||
          v.caption?.toLowerCase().includes(query.toLowerCase())
        );

  return (
    <div style={{background:"#000",minHeight:"100%",paddingBottom:20}}>
      {/* Search bar */}
      <div style={{padding:"12px 14px 0",position:"sticky",top:0,background:"#000",zIndex:10}}>
        <div style={{display:"flex",alignItems:"center",background:"#1a1a1a",borderRadius:12,padding:"10px 14px",gap:10,border:"1px solid #2a2a2a"}}>
          <IC.Search a={false}/>
          <input
            ref={inputRef}
            value={query}
            onChange={e=>setQuery(e.target.value)}
            placeholder="ইউজারনেম বা নাম খুঁজুন..."
            style={{flex:1,background:"none",border:"none",color:"white",fontSize:15,outline:"none",fontFamily:"inherit"}}
          />
          {query && (
            <button onClick={()=>setQuery("")} style={{background:"none",border:"none",cursor:"pointer",color:"#555",fontSize:18,lineHeight:1}}>×</button>
          )}
        </div>
        {/* Mode toggle */}
        <div style={{display:"flex",gap:12,marginTop:10,marginBottom:4}}>
          {[["users","👤 ইউজার"],["videos","🎬 ভিডিও"]].map(([m,l])=>(
            <button key={m} onClick={()=>setSearchMode(m)}
              style={{flex:1,padding:"8px",borderRadius:10,background:searchMode===m?"#fe2c55":"#1a1a1a",color:"white",fontWeight:searchMode===m?700:400,fontSize:13,border:"none",cursor:"pointer",transition:"all 0.15s"}}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div style={{padding:"4px 14px"}}>
        {loading ? (
          <div style={{textAlign:"center",padding:"60px 0",color:"#555"}}>
            <p style={{fontSize:32,marginBottom:8}}>🔍</p>
            <p>লোড হচ্ছে...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{textAlign:"center",padding:"60px 0",color:"#555"}}>
            <p style={{fontSize:40,marginBottom:10}}>😕</p>
            <p style={{fontSize:15}}>{query ? "কোনো ফলাফল পাওয়া যায়নি" : "কোনো ডেটা নেই"}</p>
            {query && <p style={{fontSize:12,color:"#444",marginTop:4}}>অন্য কিওয়ার্ড দিয়ে খোঁজ করুন</p>}
          </div>
        ) : searchMode === "users" ? (
          <div style={{display:"flex",flexDirection:"column",gap:2,paddingTop:4}}>
            {filtered.map(u=>(
              <div key={u.uid} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 10px",borderRadius:14,background:"#0d0d0d",marginBottom:6,border:"1px solid #1a1a1a"}}>
                <div style={{width:52,height:52,borderRadius:"50%",background:"#1a1a1a",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,flexShrink:0,border:"2px solid #2a2a2a"}}>
                  {u.avatar||"👤"}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <p style={{color:"white",fontWeight:700,fontSize:15,marginBottom:1}}>{u.displayName}</p>
                  <p style={{color:"#666",fontSize:13}}>@{u.username}</p>
                  {u.bio && <p style={{color:"#555",fontSize:12,marginTop:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{u.bio}</p>}
                </div>
                {u.uid === currentUser.uid && (
                  <span style={{background:"#1a1a1a",color:"#fe2c55",fontSize:11,fontWeight:600,padding:"3px 8px",borderRadius:6,border:"1px solid #2a1a1a"}}>আপনি</span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,paddingTop:8}}>
            {filtered.map(v=>(
              <div key={v.id} style={{borderRadius:12,overflow:"hidden",background:"#111",aspectRatio:"9/16",position:"relative",border:"1px solid #1a1a1a"}}>
                {v.videoData ? (
                  <video src={v.videoData} style={{width:"100%",height:"100%",objectFit:"cover"}} muted playsInline/>
                ) : (
                  <div style={{width:"100%",height:"100%",background:"linear-gradient(135deg,#1a0030,#000)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <span style={{fontSize:36}}>{v.emoji||"🎬"}</span>
                  </div>
                )}
                <div style={{position:"absolute",bottom:0,left:0,right:0,background:"linear-gradient(transparent,rgba(0,0,0,0.85))",padding:"20px 8px 8px"}}>
                  <p style={{color:"white",fontSize:11,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>@{v.username}</p>
                  <p style={{color:"#bbb",fontSize:10,marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{v.caption}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── HOME TAB ──────────────────────────────────────────────────
function HomeTab({ currentUser, onUpload }) {
  const [tab, setTab] = useState("foryou");
  const [videos, setVideos] = useState([]);
  const [myVideos, setMyVideos] = useState([]);
  const [liked, setLiked] = useState({});
  const [loading, setLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);

  const loadVideos = useCallback(async () => {
    setLoading(true);
    try {
      const keys = await slist("video:", true);
      const all = (await Promise.all(keys.map(k => sget(k, true)))).filter(Boolean);
      all.sort((a,b) => (b.createdAt||0)-(a.createdAt||0));
      setVideos(all);
      setMyVideos(all.filter(v => v.uid === currentUser.uid));
    } finally { setLoading(false); }
  }, [currentUser]);

  useEffect(() => { loadVideos(); const t = setInterval(loadVideos, 8000); return ()=>clearInterval(t); }, [loadVideos]);

  const toggleLike = async (id) => setLiked(p => ({...p, [id]: !p[id]}));

  const feed = tab === "foryou" ? videos : myVideos;

  if (showSearch) return (
    <div style={{width:"100%",height:"100%",background:"#000",display:"flex",flexDirection:"column"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,padding:"14px 14px 8px",borderBottom:"1px solid #1a1a1a"}}>
        <button onClick={()=>setShowSearch(false)} style={{background:"none",border:"none",cursor:"pointer"}}><IC.Back/></button>
        <span style={{color:"white",fontWeight:700,fontSize:16}}>সার্চ</span>
      </div>
      <div style={{flex:1,overflowY:"auto"}}>
        <SearchTab currentUser={currentUser}/>
                  </div>
    </div>
  );

  return (
    <div style={{width:"100%",height:"100%",background:"#000"}}>
      {/* Top bar */}
      <div style={{position:"fixed",top:0,left:0,right:0,zIndex:50,display:"flex",justifyContent:"center",alignItems:"center",paddingTop:10,paddingBottom:6,background:"linear-gradient(to bottom,rgba(0,0,0,0.7),transparent)"}}>
        <div style={{display:"flex",gap:24}}>
          {[["foryou","For You"],["following","নিজের"]].map(([t,l])=>(
            <button key={t} onClick={()=>setTab(t)} style={{color:t===tab?"white":"#aaa",fontWeight:t===tab?700:400,fontSize:16,background:"none",border:"none",cursor:"pointer",paddingBottom:3,borderBottom:t===tab?"2px solid white":"2px solid transparent"}}>{l}</button>
          ))}
        </div>
        {/* Search icon top right */}
        <button onClick={()=>setShowSearch(true)} style={{position:"absolute",right:14,top:8,background:"none",border:"none",cursor:"pointer",padding:4}}>
          <IC.Search a={false}/>
        </button>
      </div>

      <div style={{overflowY:"scroll",scrollSnapType:"y mandatory",height:"100%",scrollbarWidth:"none"}}>
        {loading ? (
          <div style={{height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",color:"#555"}}>
            <div style={{textAlign:"center"}}><div style={{fontSize:40,marginBottom:12}}>🎬</div><p>লোড হচ্ছে...</p></div>
          </div>
        ) : feed.length === 0 ? (
          <div style={{height:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",color:"#555",gap:10}}>
            <span style={{fontSize:48}}>📭</span>
            <p style={{fontSize:15,color:"#777"}}>{tab==="following"?"আপনি কোনো ভিডিও পোস্ট করেননি":"এখনো কোনো ভিডিও নেই"}</p>
            <p style={{fontSize:12,color:"#444"}}>+ বাটন থেকে ভিডিও আপলোড করুন</p>
          </div>
        ) : feed.map(v => <VideoCard key={v.id} video={v} liked={!!liked[v.id]} onLike={toggleLike}/>)}
      </div>
    </div>
  );
}

// ─── FRIENDS TAB ──────────────────────────────────────────────
function FriendsTab({ currentUser }) {
  const [videos, setVideos] = useState([]);
  const [users, setUsers] = useState([]);
  const [liked, setLiked] = useState({});
  const [subTab, setSubTab] = useState("feed");

  useEffect(() => {
    const load = async () => {
      const vkeys = await slist("video:", true);
      const all = (await Promise.all(vkeys.map(k=>sget(k,true)))).filter(Boolean);
      all.sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));
      setVideos(all.filter(v=>v.uid!==currentUser.uid));
      const ukeys = await slist("user:", true);
      const allu = (await Promise.all(ukeys.map(k=>sget(k,true)))).filter(Boolean);
      setUsers(allu.filter(u=>u.uid!==currentUser.uid));
    };
    load(); const t=setInterval(load,8000); return()=>clearInterval(t);
  }, [currentUser]);

  return (
    <div style={{background:"#000",minHeight:"100%"}}>
      <div style={{position:"sticky",top:0,background:"#0a0a0a",borderBottom:"1px solid #1a1a1a",zIndex:10}}>
        <div style={{display:"flex",justifyContent:"center",gap:24,padding:"12px 0 8px"}}>
          {[["feed","ভিডিও"],["people","মানুষ"]].map(([t,l])=>(
            <button key={t} onClick={()=>setSubTab(t)} style={{color:t===subTab?"white":"#777",fontWeight:t===subTab?700:400,fontSize:15,background:"none",border:"none",cursor:"pointer",paddingBottom:3,borderBottom:t===subTab?"2px solid #fe2c55":"2px solid transparent"}}>{l}</button>
          ))}
        </div>
      </div>
      {subTab==="feed" ? (
        <div style={{overflowY:"scroll",scrollSnapType:"y mandatory",height:"calc(100vh - 110px)",scrollbarWidth:"none"}}>
          {videos.length===0 ? (
            <div style={{height:"60vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",color:"#555",gap:8}}>
              <span style={{fontSize:40}}>👥</span><p>অন্যদের ভিডিও এখানে দেখাবে</p>
            </div>
          ) : videos.map(v=>(
            <div key={v.id} style={{scrollSnapAlign:"start",height:"calc(100vh - 110px)",position:"relative",overflow:"hidden"}}>
              {v.videoData ? (
                <video src={v.videoData} style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover"}} autoPlay loop muted playsInline/>
              ) : (
                <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,#1a0030,#000)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <span style={{fontSize:72}}>{v.emoji||"🎬"}</span>
                </div>
              )}
              <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(0,0,0,0.85) 28%,transparent 60%)"}}/>
              <div style={{position:"absolute",right:12,bottom:16,display:"flex",flexDirection:"column",alignItems:"center",gap:14,zIndex:10}}>
                <button onClick={()=>setLiked(p=>({...p,[v.id]:!p[v.id]}))} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,background:"none",border:"none",cursor:"pointer"}}>
                  <IC.Heart f={!!liked[v.id]}/><span style={{color:"white",fontSize:11}}>{liked[v.id]?(v.likes||0)+1:(v.likes||0)}</span>
                </button>
              </div>
              <div style={{position:"absolute",bottom:12,left:12,right:60,zIndex:10}}>
                <p style={{color:"white",fontWeight:700,fontSize:14}}>{v.displayName} <span style={{color:"#888",fontWeight:400,fontSize:12}}>@{v.username}</span></p>
                <p style={{color:"#ccc",fontSize:12,marginTop:3}}>{v.caption}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{padding:"12px 14px",display:"flex",flexDirection:"column",gap:8}}>
          {users.length===0 ? (
            <div style={{textAlign:"center",padding:"60px 0",color:"#555"}}>
              <span style={{fontSize:40}}>👤</span>
              <p style={{marginTop:10}}>কোনো ইউজার নেই</p>
            </div>
          ) : users.map(u=>(
            <div key={u.uid} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 10px",borderRadius:14,background:"#0d0d0d",border:"1px solid #1a1a1a"}}>
              <div style={{width:50,height:50,borderRadius:"50%",background:"#1a1a1a",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,border:"2px solid #2a2a2a"}}>
                {u.avatar||"👤"}
              </div>
              <div style={{flex:1}}>
                <p style={{color:"white",fontWeight:700,fontSize:14}}>{u.displayName}</p>
                <p style={{color:"#555",fontSize:12}}>@{u.username}</p>
                {u.bio && <p style={{color:"#444",fontSize:11,marginTop:2}}>{u.bio}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── PROFILE TAB ──────────────────────────────────────────────
function ProfileTab({ currentUser, onLogout }) {
  const [myVideos, setMyVideos] = useState([]);

  useEffect(() => {
    const load = async () => {
      const keys = await slist("video:", true);
      const all = (await Promise.all(keys.map(k=>sget(k,true)))).filter(Boolean);
      setMyVideos(all.filter(v=>v.uid===currentUser.uid).sort((a,b)=>(b.createdAt||0)-(a.createdAt||0)));
    };
    load();
  }, [currentUser]);

  return (
    <div style={{background:"#000",minHeight:"100%",paddingBottom:20}}>
      <div style={{padding:"20px 18px 16px",borderBottom:"1px solid #1a1a1a"}}>
        <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:16}}>
          <div style={{width:72,height:72,borderRadius:"50%",background:"#1a1a1a",display:"flex",alignItems:"center",justifyContent:"center",fontSize:36,border:"2px solid #2a2a2a"}}>
            {currentUser.avatar||"👤"}
          </div>
          <div>
            <p style={{color:"white",fontWeight:800,fontSize:18}}>{currentUser.displayName}</p>
            <p style={{color:"#555",fontSize:13,marginTop:2}}>@{currentUser.username}</p>
            {currentUser.bio && <p style={{color:"#777",fontSize:12,marginTop:4}}>{currentUser.bio}</p>}
          </div>
        </div>
        <div style={{display:"flex",gap:20}}>
          {[["ভিডিও",myVideos.length],["ফলোয়ার",currentUser.followers||0],["ফলোইং",currentUser.following||0]].map(([l,v])=>(
            <div key={l} style={{textAlign:"center"}}>
              <p style={{color:"white",fontWeight:800,fontSize:18}}>{v}</p>
              <p style={{color:"#666",fontSize:12}}>{l}</p>
            </div>
          ))}
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:2,padding:"2px"}}>
        {myVideos.length===0 ? (
          <div style={{gridColumn:"1/-1",textAlign:"center",padding:"50px 0",color:"#555"}}>
            <span style={{fontSize:36}}>🎬</span>
            <p style={{marginTop:8,fontSize:14}}>কোনো ভিডিও নেই</p>
          </div>
        ) : myVideos.map(v=>(
          <div key={v.id} style={{aspectRatio:"9/16",background:"#111",position:"relative",overflow:"hidden"}}>
            {v.videoData ? (
              <video src={v.videoData} style={{width:"100%",height:"100%",objectFit:"cover"}} muted playsInline/>
            ) : (
              <div style={{width:"100%",height:"100%",background:"linear-gradient(135deg,#1a0030,#000)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <span style={{fontSize:28}}>{v.emoji||"🎬"}</span>
              </div>
            )}
          </div>
        ))}
      </div>
      <div style={{padding:"20px 18px 0"}}>
        <button onClick={onLogout} style={{width:"100%",background:"#1a1a1a",color:"#fe2c55",fontWeight:700,fontSize:15,padding:"12px",borderRadius:12,border:"1px solid #2a1a1a",cursor:"pointer"}}>
          লগআউট করুন
        </button>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────
export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [tab, setTab] = useState("home");
  const [showUpload, setShowUpload] = useState(false);
  const [uploadRefresh, setUploadRefresh] = useState(0);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const restore = async () => {
      const session = await sget("session", false);
      if (session?.username) {
        const user = await sget("user:" + session.username, true);
        if (user) setCurrentUser(user);
      }
      setBooting(false);
    };
    restore();
  }, []);

  const handleLogout = async () => {
    await sset("session", null, false);
    setCurrentUser(null);
    setTab("home");
  };

  if (booting) return (
    <div style={{height:"100vh",background:"#000",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:12}}>
      <span style={{fontSize:48}}>🎬</span>
      <p style={{color:"#444",fontSize:14}}>লোড হচ্ছে...</p>
    </div>
  );

  if (!currentUser) return <AuthScreen onLogin={setCurrentUser}/>;

  const tabs = [
    { id:"home", label:"হোম", icon:<IC.Home a={tab==="home"}/> },
    { id:"friends", label:"বন্ধু", icon:<IC.Friends a={tab==="friends"}/> },
    { id:"search", label:"সার্চ", icon:<IC.Search a={tab==="search"}/> },
    { id:"profile", label:"প্রোফাইল", icon:<IC.Profile a={tab==="profile"}/> },
  ];

  return (
    <div style={{width:"100%",height:"100vh",background:"#000",display:"flex",flexDirection:"column",overflow:"hidden",position:"relative"}}>
      {/* Content */}
      <div style={{flex:1,overflowY:"auto",overflowX:"hidden"}}>
        {tab==="home" && <HomeTab key={uploadRefresh} currentUser={currentUser} onUpload={()=>setShowUpload(true)}/>}
        {tab==="friends" && <FriendsTab currentUser={currentUser}/>}
        {tab==="search" && <SearchTab currentUser={currentUser}/>}
        {tab==="profile" && <ProfileTab currentUser={currentUser} onLogout={handleLogout}/>}
      </div>

      {/* Bottom nav */}
      <div style={{display:"flex",alignItems:"center",background:"#0a0a0a",borderTop:"1px solid #1a1a1a",paddingBottom:"env(safe-area-inset-bottom)",zIndex:100,flexShrink:0}}>
        {tabs.map((t,i) => (
          <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"10px 0 8px",background:"none",border:"none",cursor:"pointer",gap:3}}>
            {t.icon}
            <span style={{color:tab===t.id?"white":"#555",fontSize:10}}>{t.label}</span>
          </button>
        ))}
        {/* Upload button in center */}
        <button onClick={()=>setShowUpload(true)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"10px 0 8px",background:"none",border:"none",cursor:"pointer",gap:3,order:-1}}>
          <div style={{width:42,height:28,borderRadius:8,background:"linear-gradient(135deg,#fe2c55,#ff6b6b)",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <IC.Plus/>
          </div>
          <span style={{color:"#555",fontSize:10}}>আপলোড</span>
        </button>
      </div>

      {/* Upload modal */}
      {showUpload && (
        <UploadModal
          currentUser={currentUser}
          onClose={()=>setShowUpload(false)}
          onUploaded={()=>{ setUploadRefresh(r=>r+1); setTab("home"); }}
        />
      )}
    </div>
  );
                                                            }
