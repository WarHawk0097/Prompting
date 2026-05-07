import { useState, useRef, useEffect } from "react";
import { supabase, supabaseEnabled } from "./supabase.js";
import {
  TC, TECHNIQUES, CONSTRAINTS_GROUPED, REFINES,
  TEMPLATES, detectDomains, extractVariables, fillVariables, buildSystem,
} from "./data.js";
import "./styles.css";

const LS_LIBRARY = "pe_library_v3";
const LS_THEME = "pe_theme";
const LS_VISITED = "pe_visited";

function loadLocalLibrary(){try{const raw=localStorage.getItem(LS_LIBRARY);return raw?JSON.parse(raw):[];}catch{return[];}}
function saveLocalLibrary(items){try{localStorage.setItem(LS_LIBRARY,JSON.stringify(items));}catch{}}

function useBreakpoint(){
  const [w,setW]=useState(()=>typeof window!=="undefined"?window.innerWidth:1024);
  useEffect(()=>{const fn=()=>setW(window.innerWidth);window.addEventListener("resize",fn);return()=>window.removeEventListener("resize",fn);},[]);
  return{isMobile:w<640,isTablet:w>=640&&w<1024,isDesktop:w>=1024,w};
}

function TypingDots(){
  return(
    <span style={{display:"inline-flex",gap:4,alignItems:"center",marginLeft:6}}>
      {[0,1,2].map(i=>(<span key={i} style={{width:5,height:5,borderRadius:"50%",background:"var(--accent)",animation:`blink 1.2s ${i*0.18}s infinite`,display:"inline-block"}}/>))}
    </span>
  );
}

/* ═══ Public Share View ═══ */
function PublicShareView({slug, theme}){
  const [item,setItem]=useState(null);
  const [error,setError]=useState("");
  const [copied,setCopied]=useState(false);

  useEffect(()=>{
    if(!supabaseEnabled){setError("Supabase not configured.");return;}
    (async()=>{
      const {data,error}=await supabase.from("prompts").select("name,input,output,tech_ids,constraints,created_at").eq("share_slug",slug).eq("is_public",true).single();
      if(error){setError("This prompt is not public or no longer exists.");return;}
      setItem(data);
    })();
  },[slug]);

  return(
    <div data-theme={theme} className="app-shell">
      <div className="bg-atmosphere"/>
      <div className="bg-grain"/>

      <nav className="nav">
        <div className="nav-inner">
          <div className="brand">
            <div className="brand-mark">P</div>
            <div className="col" style={{gap:0}}>
              <div className="brand-name">Prompt Engineer</div>
              <div className="brand-sub">Shared prompt</div>
            </div>
          </div>
          <a href="/" className="btn btn-accent">Build your own →</a>
        </div>
      </nav>

      <main className="container-narrow" style={{padding:"clamp(40px,8vw,80px) 0 80px"}}>
        {error && (
          <div className="surface fade-up" style={{padding:"56px 32px",textAlign:"center"}}>
            <div style={{fontSize:42,marginBottom:14,opacity:0.5}}>🔗</div>
            <div className="h2" style={{marginBottom:8}}>Not available</div>
            <div className="muted">{error}</div>
          </div>
        )}

        {item && (
          <div className="col fade-up" style={{gap:36}}>
            <div>
              <div className="section-label" style={{color:"var(--accent)",marginBottom:8}}>Shared prompt</div>
              <h1 className="h2" style={{fontSize:"clamp(28px,5vw,42px)"}}>{item.name}</h1>
              <div className="tert" style={{fontSize:13,marginTop:8}}>Shared {new Date(item.created_at).toLocaleDateString()}</div>
            </div>

            <div>
              <div className="section-label" style={{marginBottom:10}}>Original goal</div>
              <div className="surface" style={{padding:"16px 20px",fontSize:14,lineHeight:1.6,whiteSpace:"pre-wrap",color:"var(--text-sec)"}}>
                {item.input}
              </div>
            </div>

            <div>
              <div className="row-between" style={{marginBottom:10}}>
                <div className="section-label">Generated prompt</div>
                <button className={copied?"btn btn-accent":"btn btn-ghost"} onClick={()=>{
                  navigator.clipboard.writeText(item.output);setCopied(true);setTimeout(()=>setCopied(false),2000);
                }}>{copied?"✓ Copied":"📋 Copy"}</button>
              </div>
              <div className="output-bubble">{item.output}</div>
            </div>

            <div className="center tert" style={{fontSize:13,padding:"24px 0"}}>
              <a href="/" style={{color:"var(--accent)",textDecoration:"none",fontWeight:500}}>Build your own precision prompt →</a>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

/* ═══ Auth Modal ═══ */
function AuthModal({onClose}){
  const [email,setEmail]=useState("");
  const [status,setStatus]=useState("");
  const [errMsg,setErrMsg]=useState("");

  const send=async()=>{
    if(!email.trim())return;
    setStatus("sending");
    const {error}=await supabase.auth.signInWithOtp({email:email.trim(),options:{emailRedirectTo:window.location.origin}});
    if(error){setStatus("error");setErrMsg(error.message);return;}
    setStatus("sent");
  };

  return(
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div style={{fontSize:22,fontWeight:600,letterSpacing:"-0.02em",marginBottom:6}}>Sign in</div>
        <div className="muted" style={{fontSize:14,marginBottom:24,lineHeight:1.55}}>
          Get a magic link sent to your email — no password required. Your library will sync across all devices.
        </div>

        {status!=="sent" && (
          <>
            <input type="email" className="input" value={email} onChange={e=>setEmail(e.target.value)}
              placeholder="you@example.com" onKeyDown={e=>e.key==="Enter"&&send()}
              style={{marginBottom:14}}/>
            <button className="btn-cta" onClick={send} disabled={!email.trim()||status==="sending"}>
              {status==="sending"?"Sending…":"Send magic link"}
            </button>
          </>
        )}

        {status==="sent" && (
          <div style={{padding:"24px",borderRadius:"var(--radius)",background:"var(--accent-soft)",border:"1px solid color-mix(in srgb, var(--accent) 30%, transparent)"}}>
            <div style={{fontSize:28,marginBottom:10}}>📧</div>
            <div style={{fontSize:15,fontWeight:600,marginBottom:6}}>Check your email</div>
            <div className="muted" style={{fontSize:13,lineHeight:1.55}}>
              We sent a magic link to <b style={{color:"var(--text-pri)"}}>{email}</b>. Click it to sign in.
            </div>
          </div>
        )}

        {status==="error" && <div style={{marginTop:12,fontSize:12,color:"#EF4444"}}>Error: {errMsg}</div>}

        <button onClick={onClose} className="btn btn-ghost" style={{width:"100%",marginTop:14}}>Cancel</button>
      </div>
    </div>
  );
}

/* ═══ Landing Page ═══ */
function Landing({onEnter, onSignIn, theme, toggleTheme, user, onSignOut}){
  return(
    <div data-theme={theme} className="app-shell">
      <div className="bg-atmosphere"/>
      <div className="bg-grain"/>

      <nav className="nav">
        <div className="nav-inner">
          <div className="brand">
            <div className="brand-mark">P</div>
            <div className="col" style={{gap:0}}>
              <div className="brand-name">Prompt Engineer</div>
              <div className="brand-sub">Enterprise AI · Sonnet 4</div>
            </div>
          </div>
          <div className="nav-actions">
            <button className="btn-icon btn btn-ghost" onClick={toggleTheme} title="Toggle theme">{theme==="dark"?"☀":"☾"}</button>
            {supabaseEnabled && (
              user ? (
                <button className="btn btn-ghost" onClick={onSignOut}>Sign out</button>
              ) : (
                <button className="btn btn-ghost" onClick={onSignIn}>Sign in</button>
              )
            )}
            <button className="btn btn-accent" onClick={onEnter}>Open app →</button>
          </div>
        </div>
      </nav>

      <main className="container">
        <section className="landing-hero fade-up">
          <div style={{display:"inline-flex",alignItems:"center",gap:8,padding:"6px 14px",borderRadius:"var(--radius-pill)",background:"var(--accent-soft)",color:"var(--accent)",border:"1px solid color-mix(in srgb,var(--accent) 25%, transparent)",fontSize:12,fontWeight:500,marginBottom:32}}>
            <span style={{width:6,height:6,borderRadius:"50%",background:"var(--accent)",animation:"pulse-ring 1.8s infinite"}}/>
            Powered by Claude Sonnet 4
          </div>

          <h1 className="landing-headline">
            Write prompts<br/>that actually <em>work.</em>
          </h1>
          <p className="landing-sub">
            Turn vague ideas into precision-engineered AI prompts. 11 techniques, 30 templates, expert principles applied automatically — built for marketers, founders, and anyone who lives in AI tools.
          </p>

          <div className="landing-cta-row">
            <button className="btn-cta" onClick={onEnter} style={{width:"auto",minWidth:200}}>
              Start building free
            </button>
            <button className="btn btn-ghost btn-lg" onClick={()=>document.getElementById("how").scrollIntoView({behavior:"smooth"})}>
              See how it works
            </button>
          </div>

          <div style={{marginTop:36,fontSize:13,color:"var(--text-tert)"}}>
            No credit card · Free forever · Sign in to sync across devices
          </div>
        </section>

        <hr className="divider"/>

        <section id="how" className="fade-up">
          <div style={{textAlign:"center",marginBottom:48}}>
            <div className="section-label" style={{marginBottom:12}}>How it works</div>
            <h2 className="h2">Three steps. <em>Zero guesswork.</em></h2>
          </div>

          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon">✦</div>
              <h3 className="feature-title">1. Describe your goal</h3>
              <p className="feature-desc">Plain language. "Write a Black Friday email for a shoe store." We auto-detect the domain and inject expert principles from Ogilvy, Schwartz, and Godin.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3 className="feature-title">2. Pick techniques</h3>
              <p className="feature-desc">Chain-of-Thought, Few-Shot, Negative Prompting, Self-Consistency. 11 battle-tested methods. We explain each one so you never pick blind.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">◎</div>
              <h3 className="feature-title">3. Get a precision prompt</h3>
              <p className="feature-desc">A self-contained, ready-to-paste prompt for ChatGPT, Claude, Gemini — anywhere. Refine with one tap. Save to your library. Share with a link.</p>
            </div>
          </div>
        </section>

        <hr className="divider"/>

        <section className="fade-up">
          <div style={{textAlign:"center",marginBottom:48}}>
            <div className="section-label" style={{marginBottom:12}}>Built for</div>
            <h2 className="h2">Anyone who ships <em>with AI.</em></h2>
          </div>

          <div className="feature-grid">
            {[
              {icon:"📣",t:"Marketing teams",d:"Email campaigns, ad copy, landing pages — apply Ogilvy and Schwartz principles in one click."},
              {icon:"🛒",t:"E-commerce",d:"Product descriptions, abandoned cart emails, Amazon listings. Built-in conversion frameworks."},
              {icon:"🎨",t:"Image generation",d:"Crafted prompts for Midjourney, DALL-E, Stable Diffusion. Style references, negative prompts, mood guidance."},
              {icon:"🔬",t:"Research",d:"Literature reviews, claim verification, comparative analysis with hallucination guards built in."},
              {icon:"📞",t:"Sales & outreach",d:"Cold emails that don't sound cold. LinkedIn DMs, follow-up sequences, with proven hooks."},
              {icon:"💻",t:"Engineering",d:"Code reviews, debugging prompts, architecture decisions. Structured decomposition for complex problems."},
            ].map(f=>(
              <div key={f.t} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <h3 className="feature-title">{f.t}</h3>
                <p className="feature-desc">{f.d}</p>
              </div>
            ))}
          </div>
        </section>

        <hr className="divider"/>

        <section className="center fade-up subtle-card" style={{padding:"clamp(40px,6vw,72px) clamp(24px,4vw,48px)",margin:"0 0 80px"}}>
          <h2 className="h2" style={{marginBottom:14}}>Ready to write <em>better prompts?</em></h2>
          <p className="muted" style={{fontSize:17,maxWidth:520,margin:"0 auto 28px",lineHeight:1.55}}>
            Free forever. No setup. Open the app and you're three clicks from your first precision prompt.
          </p>
          <button className="btn-cta" onClick={onEnter} style={{width:"auto",minWidth:220}}>
            Open app →
          </button>
        </section>
      </main>
    </div>
  );
}

/* ═══ Workspace (the app itself) ═══ */
function Workspace({theme, toggleTheme, user, setAuthOpen, signOut, onBackToLanding}){
  const [view,setView]=useState("build");
  const [techIds,setTechIds]=useState([]);
  const [constraints,setConstraints]=useState([]);
  const [input,setInput]=useState("");
  const [output,setOutput]=useState("");
  const [loading,setLoading]=useState(false);
  const [history,setHistory]=useState([]);
  const [outMeta,setOutMeta]=useState({techs:[],domains:[]});
  const [copied,setCopied]=useState(false);

  const [library,setLibrary]=useState(()=>loadLocalLibrary());
  const [librarySearch,setLibrarySearch]=useState("");
  const [libLoading,setLibLoading]=useState(false);

  const [templateCat,setTemplateCat]=useState("All");
  const [varValues,setVarValues]=useState({});
  const lastInput=useRef("");
  const {isMobile,isTablet}=useBreakpoint();

  useEffect(()=>{
    if(user && supabaseEnabled){
      setLibLoading(true);
      supabase.from("prompts").select("*").eq("user_id",user.id).order("created_at",{ascending:false}).then(({data,error})=>{
        if(!error && data){
          setLibrary(data.map(r=>({
            id:r.id,name:r.name,input:r.input,output:r.output,
            techIds:r.tech_ids||[],constraints:r.constraints||[],
            ts:r.created_at,is_public:r.is_public,share_slug:r.share_slug,
          })));
        }
        setLibLoading(false);
      });
    } else {
      setLibrary(loadLocalLibrary());
    }
  },[user]);

  useEffect(()=>{ if(!user) saveLocalLibrary(library); },[library,user]);

  const toggleTech=id=>setTechIds(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);
  const toggleC=c=>setConstraints(p=>p.includes(c)?p.filter(x=>x!==c):[...p,c]);
  const detDomains=detectDomains(input);
  const variables=extractVariables(input);

  const applyTemplate=(t)=>{setInput(t.seed);setTechIds(t.techIds||[]);setConstraints(t.constraints||[]);setVarValues({});setView("build");};

  const saveToLibrary=async(name)=>{
    if(!output.trim())return;
    if(user && supabaseEnabled){
      const {data,error}=await supabase.from("prompts").insert({
        user_id:user.id,name,input,output,tech_ids:techIds,constraints,
      }).select().single();
      if(error){alert("Save failed: "+error.message);return;}
      setLibrary(prev=>[{id:data.id,name:data.name,input:data.input,output:data.output,techIds:data.tech_ids,constraints:data.constraints,ts:data.created_at,is_public:data.is_public,share_slug:data.share_slug},...prev]);
    } else {
      const item={id:Date.now(),name,input,output,techIds:[...techIds],constraints:[...constraints],ts:new Date().toISOString()};
      setLibrary(prev=>[item,...prev]);
    }
  };

  const deleteFromLibrary=async(id)=>{
    if(!confirm("Delete this saved prompt?"))return;
    if(user && supabaseEnabled){
      const {error}=await supabase.from("prompts").delete().eq("id",id);
      if(error){alert("Delete failed: "+error.message);return;}
    }
    setLibrary(prev=>prev.filter(x=>x.id!==id));
  };

  const togglePublic=async(item)=>{
    if(!user || !supabaseEnabled){alert("Sign in to share prompts publicly.");return;}
    const next=!item.is_public;
    const {data,error}=await supabase.from("prompts").update({is_public:next}).eq("id",item.id).select().single();
    if(error){alert("Update failed: "+error.message);return;}
    setLibrary(prev=>prev.map(x=>x.id===item.id?{...x,is_public:data.is_public,share_slug:data.share_slug}:x));
    if(next && data.share_slug){
      const url=`${window.location.origin}/p/${data.share_slug}`;
      navigator.clipboard.writeText(url);
      alert("Public link copied:\n"+url);
    }
  };

  const loadFromLibrary=(item)=>{
    setInput(item.input);setOutput(item.output);
    setTechIds(item.techIds||[]);setConstraints(item.constraints||[]);
    setView("output");
  };

  const run=async(override)=>{
    let raw=(override||input).trim();
    if(variables.length && Object.keys(varValues).length){raw=fillVariables(raw,varValues);}
    if(!raw)return;
    setLoading(true);setView("output");setOutput("");
    const aT=TECHNIQUES.filter(t=>techIds.includes(t.id));
    const aD=detectDomains(raw);
    setOutMeta({techs:aT.map(t=>({short:t.short,color:TC[t.id]})),domains:aD});
    lastInput.current=raw;
    try{
      const res=await fetch("/api/chat",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1500,
          system:buildSystem(techIds,constraints,raw),messages:[{role:"user",content:raw}]}),
      });
      const data=await res.json();
      if(data.error){setOutput("Error: "+(typeof data.error==="string"?data.error:JSON.stringify(data.error)));setLoading(false);return;}
      const text=data.content?.map(b=>b.text||"").join("")||"No response.";
      setOutput(text);
      setHistory(prev=>[{
        id:Date.now(),input:raw.slice(0,55)+(raw.length>55?"…":""),
        techs:aT.map(t=>t.short).join(", ")||"None",
        domains:aD.map(d=>d.domain).join(", ")||"—",
        output:text,ts:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),
      },...prev].slice(0,20));
    }catch(e){setOutput("Error: "+e.message);}
    setLoading(false);
  };

  const refine=type=>{
    const map={"Shorter":"Rewrite in half the words. Same facts, tighter.","Add constraints":"Add strict compliance rules and edge-case handling.","More persuasive":"Rewrite using compelling, action-driving language.","Add example":"Add a concrete real-world example to illustrate the key point.","More formal":"Rewrite in formal executive/legal register."};
    run(lastInput.current+"\n\n[REFINE: "+(map[type]||type)+"]");
  };

  const NAV_ITEMS=[
    {v:"build",icon:"✦",label:"Build"},
    {v:"templates",icon:"⚡",label:"Templates"},
    {v:"output",icon:"◎",label:"Output"},
    {v:"library",icon:"★",label:"Library"},
    {v:"history",icon:"☰",label:"History"},
  ];
  const filteredLibrary=library.filter(x=>!librarySearch||x.name.toLowerCase().includes(librarySearch.toLowerCase())||x.input.toLowerCase().includes(librarySearch.toLowerCase()));
  const templateCats=["All",...new Set(TEMPLATES.map(t=>t.cat))];
  const visibleTemplates=templateCat==="All"?TEMPLATES:TEMPLATES.filter(t=>t.cat===templateCat);

  return(
    <div data-theme={theme} className="app-shell" style={{paddingBottom:isMobile?70:0}}>
      <div className="bg-atmosphere"/>
      <div className="bg-grain"/>

      {/* TOP NAV */}
      <nav className="nav">
        <div className="nav-inner">
          <button onClick={onBackToLanding} className="brand" style={{background:"none",border:"none",cursor:"pointer",padding:0,color:"inherit"}}>
            <div className={loading?"brand-mark processing":"brand-mark"}>P</div>
            <div className="col" style={{gap:0,alignItems:"flex-start"}}>
              <div className="brand-name">{isMobile?"Prompt Eng.":"Prompt Engineer"}</div>
              <div className="brand-sub">Enterprise AI · Sonnet 4</div>
            </div>
          </button>

          <div className="tabs">
            {NAV_ITEMS.map(({v,label})=>(
              <button key={v} className={view===v?"tab active":"tab"} onClick={()=>setView(v)}>{label}</button>
            ))}
          </div>

          <div className="nav-actions">
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span className={loading?"status-dot processing":"status-dot"}/>
              <span className="status-text">{loading?"Processing":"Ready"}</span>
            </div>
            {supabaseEnabled && (
              user ? (
                <button className="btn btn-soft" onClick={signOut} title={user.email}>
                  ✓ {isMobile?"":user.email.split("@")[0]}
                </button>
              ) : (
                <button className="btn btn-accent" onClick={()=>setAuthOpen(true)}>Sign in</button>
              )
            )}
            <button className="btn-icon btn btn-ghost" onClick={toggleTheme} title="Toggle theme">{theme==="dark"?"☀":"☾"}</button>
          </div>
        </div>
      </nav>

      <main className="container" style={{padding:`clamp(28px,5vw,56px) clamp(16px,4vw,56px) 80px`}}>

        {view==="build" && (
          <div className="fade-up col" style={{gap:"clamp(28px,5vw,48px)"}}>
            <div>
              <h1 className="hero-headline">Build a <em>precision</em> prompt.</h1>
              <p className="hero-sub">
                Describe your goal in plain language. We engineer it into an optimized, ready-to-paste prompt — using domain-expert principles and proven techniques.
              </p>
              <button className="btn btn-soft" onClick={()=>setView("templates")} style={{marginTop:18,minHeight:42,padding:"10px 18px",fontSize:14}}>
                ⚡ Browse {TEMPLATES.length} templates
              </button>
            </div>

            {/* INPUT */}
            <section>
              <div className="section-label" style={{marginBottom:10}}>Your goal</div>
              <div style={{position:"relative"}}>
                <textarea className="textarea" value={input} onChange={e=>setInput(e.target.value)}
                  placeholder={isMobile?"What do you want an AI to do?":"Describe what you want an AI to do. Use {variables} for fillable slots, e.g. 'Write an email for {audience}'."}
                />
                {input.length>0 && (<div style={{position:"absolute",bottom:10,right:14,fontSize:11,color:"var(--text-tert)",pointerEvents:"none"}}>{input.length}</div>)}
              </div>

              {variables.length>0 && (
                <div className="slide-down" style={{marginTop:12,padding:"14px 18px",borderRadius:"var(--radius)",background:"color-mix(in srgb, #8B5CF6 8%, transparent)",border:"1px solid color-mix(in srgb, #8B5CF6 25%, transparent)"}}>
                  <div className="section-label" style={{color:"#8B5CF6",marginBottom:10}}>
                    Fill in {variables.length} variable{variables.length>1?"s":""}
                  </div>
                  <div className="var-grid">
                    {variables.map(v=>(
                      <div key={v}>
                        <div className="var-label">{`{${v}}`}</div>
                        <input className="input" value={varValues[v]||""} onChange={e=>setVarValues(p=>({...p,[v]:e.target.value}))}
                          placeholder={v.replace(/_/g," ")} style={{fontSize:13,padding:"8px 12px"}}/>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {detDomains.length>0 && (
                <div className="slide-down domain-banner" style={{marginTop:12}}>
                  <div className="section-label" style={{color:"var(--accent)",marginBottom:8}}>Domains detected</div>
                  <div className="gap-xs" style={{marginBottom:isMobile?0:8}}>
                    {detDomains.map(d=>(
                      <span key={d.domain} style={{fontSize:11,fontWeight:600,padding:"3px 10px",borderRadius:"var(--radius-pill)",color:"#fff",background:`linear-gradient(135deg,${d.color},color-mix(in srgb,${d.color} 75%,#000))`}}>{d.domain}</span>
                    ))}
                  </div>
                  {!isMobile && (
                    <div style={{fontSize:13,color:"var(--text-sec)",lineHeight:1.6}}>
                      {detDomains.map(d=>(
                        <div key={d.domain}><span style={{color:d.color,fontWeight:600}}>Principles of {d.domain}:</span> {d.experts.join(" · ")}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* TECHNIQUES */}
            <section>
              <div className="row-between" style={{marginBottom:12}}>
                <div className="section-label">Techniques</div>
                {techIds.length>0 && (
                  <span style={{fontSize:11,fontWeight:600,padding:"3px 10px",borderRadius:"var(--radius-pill)",background:"var(--accent-soft)",color:"var(--accent)"}}>{techIds.length} active</span>
                )}
              </div>
              <div style={{display:"grid",gridTemplateColumns:isMobile?"repeat(2,1fr)":isTablet?"repeat(3,1fr)":"repeat(4,1fr)",gap:isMobile?8:12}}>
                {TECHNIQUES.map(t=>{
                  const sel=techIds.includes(t.id);
                  return(
                    <div key={t.id} className="tt-wrap">
                      <button className={sel?"tech-card sel":"tech-card"} onClick={()=>toggleTech(t.id)} style={{"--tech-color":TC[t.id],width:"100%"}}>
                        <div className="indicator"/>
                        {sel && <div className="tech-check">✓</div>}
                        <span className="tech-tag">{t.short}</span>
                        <div className="tech-name">{t.name}</div>
                        <div className="tech-desc">{t.desc}</div>
                      </button>
                      {!isMobile && <span className="tt">{t.desc}</span>}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* CONSTRAINTS */}
            <section>
              <div className="section-label" style={{marginBottom:12}}>Output constraints</div>
              <div className="col" style={{gap:14}}>
                {Object.entries(CONSTRAINTS_GROUPED).map(([group,list])=>(
                  <div key={group}>
                    <div style={{fontSize:11,fontWeight:500,color:"var(--text-tert)",letterSpacing:"0.05em",textTransform:"uppercase",marginBottom:8,fontFamily:"var(--font-mono)"}}>{group}</div>
                    <div className="gap-sm">
                      {list.map(c=>{
                        const on=constraints.includes(c);
                        return(<button key={c} className={on?"cpill on":"cpill"} onClick={()=>toggleC(c)}>{on?"✓ ":""}{c}</button>);
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <button className="btn-cta" onClick={()=>run()} disabled={loading||!input.trim()}>
              {loading ? (
                <span style={{display:"flex",alignItems:"center",gap:10}}>
                  <span style={{width:14,height:14,border:"2px solid rgba(255,255,255,0.3)",borderTopColor:"#fff",borderRadius:"50%",display:"inline-block",animation:"spin .8s linear infinite"}}/>
                  Engineering your prompt…
                </span>
              ) : "Generate prompt →"}
            </button>
          </div>
        )}

        {view==="templates" && (
          <div className="fade-up col" style={{gap:"clamp(20px,3vw,32px)"}}>
            <div>
              <h1 className="h2">Templates</h1>
              <p className="muted" style={{fontSize:15,marginTop:6}}>{TEMPLATES.length} ready-to-use starting points. Tap to load.</p>
            </div>
            <div className="gap-sm">
              {templateCats.map(c=>(
                <button key={c} className={templateCat===c?"cpill on":"cpill"} onClick={()=>setTemplateCat(c)}>{c}</button>
              ))}
            </div>
            <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":isTablet?"repeat(2,1fr)":"repeat(3,1fr)",gap:14}}>
              {visibleTemplates.map((t,i)=>(
                <button key={i} className="tpl-card" onClick={()=>applyTemplate(t)}>
                  <div className="tpl-header">
                    <span className="tpl-icon">{t.icon}</span>
                    <span className="tpl-cat">{t.cat}</span>
                  </div>
                  <div className="tpl-title">{t.title}</div>
                  <div className="tpl-seed">{t.seed}</div>
                  <div className="tpl-tags">
                    {(t.techIds||[]).slice(0,3).map(tid=>{
                      const tech=TECHNIQUES.find(x=>x.id===tid);
                      return tech ? (<span key={tid} style={{fontFamily:"var(--font-mono)",fontSize:9,fontWeight:500,padding:"2px 6px",borderRadius:4,color:TC[tid],border:`1px solid ${TC[tid]}40`,background:`${TC[tid]}10`}}>{tech.short}</span>) : null;
                    })}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {view==="output" && (
          <div className="fade-up col" style={{gap:"clamp(20px,3vw,32px)"}}>
            <div>
              <h1 className="h2">Generated prompt</h1>
              <div className="gap-xs" style={{marginTop:10}}>
                {outMeta.techs?.map(t=>(<span key={t.short} style={{fontSize:11,fontWeight:600,padding:"3px 10px",borderRadius:"var(--radius-pill)",color:t.color,border:`1px solid ${t.color}40`,background:`${t.color}10`}}>{t.short}</span>))}
                {outMeta.domains?.map(d=>(<span key={d.domain} style={{fontSize:11,fontWeight:600,padding:"3px 10px",borderRadius:"var(--radius-pill)",color:"#fff",background:`linear-gradient(135deg,${d.color},color-mix(in srgb,${d.color} 75%,#000))`}}>{d.domain}</span>))}
              </div>
            </div>

            <div style={{position:"relative"}}>
              <div style={{position:"absolute",top:14,right:14,zIndex:10,display:"flex",gap:6}}>
                <button className={copied?"btn btn-accent":"btn btn-ghost"} onClick={()=>{if(output){navigator.clipboard.writeText(output).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000);});}}} disabled={!output}>
                  {copied?"✓ Copied":"📋 Copy"}
                </button>
                <button className="btn btn-soft" onClick={()=>{
                  if(!output)return;
                  const name=prompt("Name this prompt for your library:",input.slice(0,40));
                  if(name) saveToLibrary(name);
                }} disabled={!output}>★ Save</button>
              </div>
              <div className="output-bubble">
                {loading ? (<span className="muted">Generating<TypingDots/></span>) : (output ? output : <span className="output-empty">No output yet. Build a prompt and run it.</span>)}
              </div>
            </div>

            {output && (
              <div className="fade-in">
                <div className="section-label" style={{marginBottom:10}}>Refine</div>
                <div className="gap-sm">
                  {REFINES.map(r=>(<button key={r} className="cpill" onClick={()=>refine(r)} disabled={loading}>{r}</button>))}
                </div>
              </div>
            )}

            <button onClick={()=>setView("build")} className="btn btn-ghost" style={{alignSelf:"flex-start"}}>← Build new</button>
          </div>
        )}

        {view==="library" && (
          <div className="fade-up col" style={{gap:18}}>
            <div>
              <h1 className="h2">Library</h1>
              <p className="muted" style={{fontSize:14,marginTop:6}}>
                {library.length} saved prompt{library.length===1?"":"s"} {user ? <span style={{color:"var(--accent)"}}>· ☁ synced to cloud</span> : <>· local only — <button onClick={()=>setAuthOpen(true)} style={{background:"none",border:"none",color:"var(--accent)",cursor:"pointer",padding:0,fontSize:14,fontFamily:"inherit",fontWeight:500,textDecoration:"underline"}}>sign in to sync</button></>}
              </p>
            </div>

            <input className="input" value={librarySearch} onChange={e=>setLibrarySearch(e.target.value)} placeholder="Search saved prompts…" style={{borderRadius:"var(--radius-pill)"}}/>

            {libLoading ? (
              <div className="center muted" style={{padding:32}}>Loading…</div>
            ) : filteredLibrary.length===0 ? (
              <div className="surface center" style={{padding:"56px 32px"}}>
                <div style={{fontSize:36,marginBottom:10,opacity:0.4}}>★</div>
                <div style={{fontSize:16}}>{library.length===0?"No saved prompts yet":"No matches"}</div>
                <div className="tert" style={{fontSize:13,marginTop:6}}>{library.length===0?"Save a generated prompt with the ★ button.":"Try a different search."}</div>
              </div>
            ) : (
              <div className="col" style={{gap:10}}>
                {filteredLibrary.map(item=>(
                  <div key={item.id} className="lib-item">
                    <div className="row-between">
                      <div style={{fontSize:15,fontWeight:600,lineHeight:1.3,flex:1,minWidth:200}}>
                        {item.name}
                        {item.is_public && <span style={{marginLeft:8,fontFamily:"var(--font-mono)",fontSize:10,fontWeight:500,padding:"2px 8px",borderRadius:4,background:"color-mix(in srgb, #3B82F6 12%, transparent)",color:"#3B82F6",border:"1px solid color-mix(in srgb, #3B82F6 35%, transparent)"}}>🌐 PUBLIC</span>}
                      </div>
                      <div className="gap-xs">
                        <button className="btn btn-soft" onClick={()=>loadFromLibrary(item)}>Open</button>
                        {user && supabaseEnabled && (
                          <button className={item.is_public?"btn btn-ghost":"btn btn-ghost"} onClick={()=>togglePublic(item)} style={item.is_public?{color:"#3B82F6",borderColor:"color-mix(in srgb,#3B82F6 35%, transparent)",background:"color-mix(in srgb,#3B82F6 8%, transparent)"}:{}}>
                            {item.is_public?"🔗 Copy link":"Share"}
                          </button>
                        )}
                        <button className="btn btn-ghost" onClick={()=>deleteFromLibrary(item.id)} style={{color:"#EF4444"}}>✕</button>
                      </div>
                    </div>
                    <div className="muted" style={{fontSize:12.5,lineHeight:1.5,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{item.input}</div>
                    <div className="tert" style={{fontSize:11}}>{new Date(item.ts).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {view==="history" && (
          <div className="fade-up col" style={{gap:12}}>
            <h1 className="h2">History</h1>
            {history.length===0 ? (
              <div className="surface center" style={{padding:"56px 32px"}}>
                <div style={{fontSize:36,marginBottom:10,opacity:0.4}}>✦</div>
                <div style={{fontSize:16}}>No runs yet</div>
                <div className="tert" style={{fontSize:13,marginTop:6}}>Build a prompt and hit Generate.</div>
              </div>
            ) : (
              history.map((h,i)=>(
                <button key={h.id} className="hrow" onClick={()=>{setOutput(h.output);setOutMeta({techs:[],domains:[]});setView("output");}} style={{animation:`fadeUp 0.3s ${i*0.04}s both`}}>
                  <div style={{fontSize:14.5,fontWeight:500,lineHeight:1.4}}>{h.input}</div>
                  <div className="row-between">
                    <div className="gap-xs">
                      {h.techs!=="None" && (<span className="mono" style={{fontSize:10,padding:"2px 8px",borderRadius:4,background:"var(--bg-muted)",color:"var(--text-sec)",border:"1px solid var(--border)"}}>{h.techs}</span>)}
                    </div>
                    <span className="tert" style={{fontSize:11}}>{h.ts}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </main>

      {isMobile && (
        <nav className="bottom-nav">
          {NAV_ITEMS.map(({v,icon,label})=>(
            <button key={v} className={view===v?"bottom-nav-btn active":"bottom-nav-btn"} onClick={()=>setView(v)}>
              <span className="bottom-nav-icon">{icon}</span>
              <span className="bottom-nav-label">{label}</span>
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}

/* ═══════ MAIN ═══════ */
export default function App(){
  // Public share route
  const path = typeof window!=="undefined" ? window.location.pathname : "/";
  const shareMatch = path.match(/^\/p\/([a-z0-9]{6,16})$/i);

  // Theme
  const [theme,setTheme]=useState(()=>{
    if(typeof window==="undefined")return "light";
    const saved=localStorage.getItem(LS_THEME);
    if(saved==="light"||saved==="dark")return saved;
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });
  useEffect(()=>{localStorage.setItem(LS_THEME,theme);},[theme]);
  const toggleTheme=()=>setTheme(t=>t==="dark"?"light":"dark");

  // Auth
  const [user,setUser]=useState(null);
  const [authOpen,setAuthOpen]=useState(false);

  useEffect(()=>{
    if(!supabaseEnabled)return;
    supabase.auth.getSession().then(({data})=>{setUser(data.session?.user||null);});
    const {data:sub}=supabase.auth.onAuthStateChange((_e,session)=>{setUser(session?.user||null);});
    return()=>{sub.subscription.unsubscribe();};
  },[]);

  const signOut=async()=>{await supabase.auth.signOut();setUser(null);};

  // Page mode: landing vs workspace
  // First-time visitors see landing. Returning visitors go straight to workspace.
  const [mode,setMode]=useState(()=>{
    if(typeof window==="undefined")return "landing";
    return localStorage.getItem(LS_VISITED)==="1" ? "workspace" : "landing";
  });
  const enterApp=()=>{localStorage.setItem(LS_VISITED,"1");setMode("workspace");};
  const backToLanding=()=>setMode("landing");

  if(shareMatch) return <PublicShareView slug={shareMatch[1]} theme={theme}/>;

  return(
    <>
      {authOpen && <AuthModal onClose={()=>setAuthOpen(false)}/>}
      {mode==="landing" ? (
        <Landing onEnter={enterApp} onSignIn={()=>setAuthOpen(true)} theme={theme} toggleTheme={toggleTheme} user={user} onSignOut={signOut}/>
      ) : (
        <Workspace theme={theme} toggleTheme={toggleTheme} user={user} setAuthOpen={setAuthOpen} signOut={signOut} onBackToLanding={backToLanding}/>
      )}
    </>
  );
}
