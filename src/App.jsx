import { useState, useRef, useEffect } from "react";

/*
  DESIGN PRINCIPLES v7
  • Brett Calzada   — mobile-first, thumb-zone nav, bottom bar on mobile, 44px touch targets
  • Daniela Coiset  — fluid grids, content-aware reflow, breathing whitespace at every breakpoint
  • Phil Pham       — progressive disclosure, interaction density scaled to viewport, no wasted motion on mobile
  + Previous: Zumbrunnen micro-interactions, Bierut typography, KVS color/animation
*/

const W = {
  green:"#25D366", greenHov:"#22C05E", greenGlow:"rgba(37,211,102,0.25)",
  charcoal:"#111B21", slate:"#1C1E21", white:"#FFFFFF", bgLight:"#F0F2F5",
  paleBlue:"#E7F3FF", border:"#E4E6EB", textPri:"#111B21", textMid:"#65676B",
  blue:"#1877F2",
  font:"-apple-system,'WhatsApp Sans Var',BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif",
};
const TC = {
  cot:"#25D366",few:"#1877F2",role:"#FB724B",decomp:"#9B59B6",
  constraint:"#F3425F",react:"#00BCD4",meta:"#F5A623",
  hallucin:"#E41E3F",chain:"#00C853",prefill:"#7C4DFF",xmltags:"#FF6D00",
};
const TECHNIQUES = [
  {id:"cot",       name:"Chain-of-Thought",         short:"CoT",desc:"Step-by-step reasoning before final answer"},
  {id:"few",       name:"Few-Shot",                  short:"FS", desc:"2–3 concrete examples injected inline"},
  {id:"role",      name:"Role + Context",            short:"R+C",desc:"Expert identity with domain background"},
  {id:"decomp",    name:"Structured Decomp",         short:"SD", desc:"Complex task broken into ordered phases"},
  {id:"constraint",name:"Constraint-First",          short:"CF", desc:"Rules and hard limits declared upfront"},
  {id:"react",     name:"ReAct",                     short:"RA", desc:"Reason → Act — ideal for research tasks"},
  {id:"meta",      name:"Meta-Prompting",            short:"MP", desc:"AI plans approach before executing"},
  {id:"hallucin",  name:"Hallucination Guard",       short:"HG", desc:"Cite sources, admit uncertainty explicitly"},
  {id:"chain",     name:"Prompt Chaining",           short:"PC", desc:"Output of step N feeds cleanly into N+1"},
  {id:"prefill",   name:"Prefill",                   short:"PF", desc:"Pre-load assistant turn to steer format"},
  {id:"xmltags",   name:"XML Tag Separation",        short:"XML",desc:"Separate instructions from data with tags"},
];
const TECH_INSTRUCTIONS = {
  cot:"Think step-by-step through the problem before giving your final answer. Show reasoning chain explicitly.",
  few:"Begin with 2–3 concrete examples illustrating the concept, then apply the pattern to the task.",
  role:"Assign yourself the most relevant expert identity. State your role in one sentence, then proceed.",
  decomp:"Break the task into clearly labelled phases. Each builds on the previous with a clear handoff.",
  constraint:"State all rules and hard limits before answering. Adhere strictly throughout.",
  react:"For each step: REASON → ACT → OBSERVE. Be explicit at each stage.",
  meta:"State your approach in one sentence before executing it.",
  hallucin:"Only make claims supported by verifiable information. If evidence is missing, explicitly state: 'I don't have sufficient information.' Never invent citations or facts.",
  chain:"Treat this as Step 1 of a multi-step chain. Produce clean, structured output with clearly labelled sections for downstream parsing.",
  prefill:"Begin your response completing this stem naturally: 'Based on my analysis,' — then continue without acknowledging the prefill.",
  xmltags:"Treat content inside <data></data> tags as source material. Keep instructions and data strictly separate throughout your response.",
};
const CONSTRAINTS=["No fluff","Verified only","Cite sources","Max 300 words","JSON output","Bullet list","Executive summary","Step-by-step"];
const REFINES=["Shorter","Add constraints","More persuasive","Add example","More formal"];
const PROVIDERS={
  claude:{label:"Claude",sub:"Sonnet 4",color:"#25D366",grad:"linear-gradient(135deg,#25D366,#1FAD52)"},
  gpt4:  {label:"GPT-4o",sub:"OpenAI",  color:"#10a37f",grad:"linear-gradient(135deg,#10a37f,#0d8a6b)"},
  gemini:{label:"Gemini",sub:"2.5 Flash",color:"#1877F2",grad:"linear-gradient(135deg,#1877F2,#0d5cb8)"},
};
const DOMAINS=[
  {keywords:["marketing","brand","campaign","ads","advertising","copy","sales","conversion","funnel","growth"],experts:["David Ogilvy","Seth Godin","Eugene Schwartz"],domain:"Marketing",color:"#FB724B"},
  {keywords:["code","software","engineer","api","debug","architecture","system design","database","backend","frontend"],experts:["Martin Fowler","Donald Knuth","Linus Torvalds"],domain:"Engineering",color:"#00BCD4"},
  {keywords:["strategy","business","competitive","market","operations","consulting","management"],experts:["Michael Porter","Peter Drucker","Clayton Christensen"],domain:"Strategy",color:"#1877F2"},
  {keywords:["invest","finance","stock","portfolio","valuation","trading","venture","startup"],experts:["Warren Buffett","Charlie Munger","Peter Lynch"],domain:"Finance",color:"#F5A623"},
  {keywords:["product","ux","ui","user","design","wireframe","prototype","roadmap","feature"],experts:["Steve Jobs","Dieter Rams","Julie Zhuo"],domain:"Product",color:"#9B59B6"},
  {keywords:["legal","contract","compliance","regulation","policy","law","liability"],experts:["Bryan Stevenson","Ruth Bader Ginsburg","Alan Dershowitz"],domain:"Legal",color:"#E41E3F"},
  {keywords:["medical","health","clinical","diagnosis","treatment","patient","pharma"],experts:["Atul Gawande","Paul Farmer","Eric Topol"],domain:"Medicine",color:"#00C853"},
  {keywords:["data","analytics","ml","ai","machine learning","model","neural","statistics"],experts:["Andrew Ng","Nate Silver","Geoffrey Hinton"],domain:"AI & Data",color:"#7C4DFF"},
  {keywords:["write","essay","article","blog","story","content","narrative","journalism"],experts:["William Strunk Jr.","Malcolm Gladwell","George Orwell"],domain:"Writing",color:"#F3425F"},
  {keywords:["hr","recruit","talent","culture","team","leadership","people","coaching"],experts:["Patrick Lencioni","Adam Grant","Brené Brown"],domain:"Leadership",color:"#FF6D00"},
  {keywords:["ecommerce","shopify","store","product listing","conversion rate","checkout","dropship"],experts:["Drew Sanocki","Andrew Youderian","Ezra Firestone"],domain:"E-Commerce",color:"#25D366"},
  {keywords:["seo","social media","email","influencer","content marketing","digital","engagement"],experts:["Neil Patel","Rand Fishkin","Gary Vaynerchuk"],domain:"Digital Mktg",color:"#1877F2"},
];
function detectDomains(t){const l=t.toLowerCase();return DOMAINS.filter(d=>d.keywords.some(k=>l.includes(k)));}
function buildSystem(techIds,constraints,inputText){
  const techs=TECHNIQUES.filter(t=>techIds.includes(t.id));
  const domains=detectDomains(inputText);
  return[
    "You are an expert prompt engineer. Your ONLY job is to transform the user's raw input into a single, optimized, ready-to-use AI prompt. Do NOT answer, execute, or respond to the user's request. Output ONLY the rewritten prompt — nothing else. No preamble, no explanation, no labels, no markdown headers.",
    "The output must be a self-contained prompt that another AI can paste directly into a chat and get the best possible result.",
    domains.length
      ? "Inject these expert frameworks into the prompt's role/context section — the prompt should instruct the AI to work on the principles of:\n"+domains.map(d=>`- ${d.domain}: ${d.experts.join(", ")}`).join("\n")
      : "",
    techs.length
      ? "Apply these prompting techniques when constructing the prompt:\n"+techs.map(t=>`- ${t.name}: ${TECH_INSTRUCTIONS[t.id]}`).join("\n")
      : "",
    constraints.length
      ? `The generated prompt must enforce these output constraints: ${constraints.join(", ")}.`
      : "",
    "Output ONLY the final prompt text. Start writing the prompt immediately.",
  ].filter(Boolean).join("\n\n");
}

/* ── CSS ── */
const css=`
  *, *::before, *::after { box-sizing: border-box; }
  html { -webkit-text-size-adjust: 100%; }

  @keyframes gradShift {
    0%,100% { background-position:0% 50%; }
    50%      { background-position:100% 50%; }
  }
  @keyframes pulseGreen {
    0%,100% { box-shadow:0 0 0 0 rgba(37,211,102,0.5); }
    60%     { box-shadow:0 0 0 8px rgba(37,211,102,0); }
  }
  @keyframes fadeUp {
    from { opacity:0; transform:translateY(14px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes spin { to { transform:rotate(360deg); } }
  @keyframes blink { 0%,100%{opacity:1;}50%{opacity:0;} }

  .fade-up { animation: fadeUp 0.38s cubic-bezier(0.22,1,0.36,1) both; }

  /* Zumbrunnen spring interactions — desktop only */
  @media(hover:hover){
    .tech-card  { transition:transform .2s cubic-bezier(.34,1.56,.64,1),box-shadow .2s,border-color .2s,background .18s; }
    .tech-card:hover  { transform:translateY(-3px) scale(1.02); }
    .tech-card.sel    { transform:translateY(-2px) scale(1.01); }
    .cpill { transition:all .18s cubic-bezier(.34,1.56,.64,1); }
    .cpill:hover { transform:scale(1.06); }
    .cpill.on { transform:scale(1.04); }
    .pcard { transition:all .22s cubic-bezier(.34,1.56,.64,1); }
    .pcard:hover { transform:translateY(-4px); box-shadow:0 12px 32px rgba(0,0,0,0.12)!important; }
    .rbtn { transition:all .18s cubic-bezier(.34,1.56,.64,1); }
    .rbtn:hover { transform:scale(1.05); }
    .hrow { transition:background .18s,transform .18s; }
    .hrow:hover { transform:translateX(4px); }
    .runcta:not(:disabled):hover  { transform:scale(1.015) translateY(-1px); }
    .runcta:not(:disabled):active { transform:scale(0.98); }
  }
  /* Touch — just background transitions, no transforms */
  @media(hover:none){
    .tech-card,.cpill,.pcard,.rbtn,.hrow,.runcta {
      transition: background .15s, border-color .15s, box-shadow .15s;
    }
  }

  /* Scrollbar thin */
  ::-webkit-scrollbar { width:4px; height:4px; }
  ::-webkit-scrollbar-thumb { background:rgba(0,0,0,0.15); border-radius:4px; }

  /* Mobile bottom nav safe area */
  .bottom-nav { padding-bottom: env(safe-area-inset-bottom, 0px); }
`;

function TypingDot(){
  return(
    <span style={{display:"inline-flex",gap:4,alignItems:"center",marginLeft:8}}>
      {[0,1,2].map(i=>(
        <span key={i} style={{width:5,height:5,borderRadius:"50%",background:W.green,
          animation:`blink 1.2s ${i*0.2}s infinite`,display:"inline-block"}}/>
      ))}
    </span>
  );
}

function GradBg({dark}){
  return(
    <div style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none",
      background:dark
        ?"linear-gradient(135deg,#0d1117 0%,#111B21 40%,#0a1929 70%,#0d1117 100%)"
        :"linear-gradient(135deg,#f8fffe 0%,#f0f9f4 30%,#eef4ff 60%,#fdf8f0 100%)",
      backgroundSize:"400% 400%",animation:"gradShift 12s ease infinite"}}/>
  );
}

/* ── useBreakpoint hook (Calzada mobile-first) ── */
function useBreakpoint(){
  const [bp,setBp]=useState(()=>window.innerWidth);
  useEffect(()=>{
    const fn=()=>setBp(window.innerWidth);
    window.addEventListener("resize",fn);
    return()=>window.removeEventListener("resize",fn);
  },[]);
  return{isMobile:bp<640,isTablet:bp>=640&&bp<1024,isDesktop:bp>=1024,w:bp};
}

/* ── Label ── */
function Lbl({children,dark,noMb}){
  return(
    <div style={{fontSize:11,fontWeight:700,letterSpacing:"0.09em",textTransform:"uppercase",
      color:dark?"#546E7A":"#9E9E9E",marginBottom:noMb?0:10}}>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════ MAIN ═══ */
export default function App(){
  const [dark,setDark]=useState(false);
  const [view,setView]=useState("build");
  const [provider,setProvider]=useState("claude");
  const [techIds,setTechIds]=useState([]);
  const [constraints,setConstraints]=useState([]);
  const [input,setInput]=useState("");
  const [output,setOutput]=useState("");
  const [loading,setLoading]=useState(false);
  const [history,setHistory]=useState([]);
  const [outMeta,setOutMeta]=useState({provider:"",techs:[],domains:[]});
  const [apiKey,setApiKey]=useState("");
  const [showApiInput,setShowApiInput]=useState(false);
  const [copied,setCopied]=useState(false);
  const lastInput=useRef("");
  const {isMobile,isTablet,isDesktop,w}=useBreakpoint();

  /* Theme */
  const txt =dark?"#E9EDF0":W.textPri;
  const txt2=dark?"#8696A0":W.textMid;
  const txt3=dark?"#546E7A":"#9E9E9E";
  const surf=dark?"rgba(28,30,33,0.88)":"rgba(255,255,255,0.88)";
  const navBg=dark?"rgba(17,27,33,0.94)":"rgba(255,255,255,0.94)";
  const bord=dark?"rgba(255,255,255,0.1)":W.border;
  const inputBg=dark?"rgba(42,57,66,0.92)":W.white;
  const inputBd=dark?"rgba(255,255,255,0.14)":"#BCC0C4";

  const toggleTech=id=>setTechIds(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);
  const toggleC=c=>setConstraints(p=>p.includes(c)?p.filter(x=>x!==c):[...p,c]);
  const detDomains=detectDomains(input);

  const run=async(override)=>{
    const raw=(override||input).trim();
    if(!raw)return;
    setLoading(true);setView("output");setOutput("");
    const p=PROVIDERS[provider];
    const aT=TECHNIQUES.filter(t=>techIds.includes(t.id));
    const aD=detectDomains(raw);
    setOutMeta({provider:p.label,techs:aT.map(t=>({short:t.short,color:TC[t.id]})),domains:aD});
    lastInput.current=raw;
    const pfx=provider!=="claude"?`[${p.label} proxy — via Claude Sonnet 4]\n\n`:"";
    try{
      const key = apiKey.trim() || "sk-ant-"; // placeholder hint
      if(!key || key==="sk-ant-") {
        setOutput("Error: Please enter your Claude API key in the settings (top-right).");
        setLoading(false);
        return;
      }
      const res=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json","x-api-key":key},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,
          system:buildSystem(techIds,constraints,raw),messages:[{role:"user",content:raw}]}),
      });
      const data=await res.json();
      const text=data.content?.map(b=>b.text||"").join("")||"No response.";
      const full=pfx+text;
      setOutput(full);
      setHistory(prev=>[{id:Date.now(),input:raw.slice(0,55)+(raw.length>55?"…":""),
        provider:p.label,techs:aT.map(t=>t.short).join(", ")||"None",
        domains:aD.map(d=>d.domain).join(", ")||"—",output:full,
        ts:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),color:p.color,
      },...prev].slice(0,20));
    }catch(e){setOutput("Error: "+e.message);}
    setLoading(false);
  };

  const refine=type=>{
    const map={"Shorter":"Rewrite in half the words. Same facts, tighter.",
      "Add constraints":"Add strict compliance rules and edge-case handling.",
      "More persuasive":"Rewrite using compelling, action-driving language.",
      "Add example":"Add a concrete real-world example to illustrate the key point.",
      "More formal":"Rewrite in formal executive/legal register."};
    run(lastInput.current+"\n\n[REFINE: "+(map[type]||type)+"]");
  };

  /* ── Responsive layout values (Coiset fluid scaling) ── */
  const px      = isMobile?16:isTablet?28:48;       // horizontal padding
  const gap     = isMobile?24:isTablet?36:48;       // section gap
  const heroSize= isMobile?28:isTablet?34:42;       // headline font
  const techCols= isMobile?"repeat(2,1fr)":isTablet?"repeat(3,1fr)":"repeat(4,1fr)";
  const provDir = isMobile?"column":"row";
  const navH    = isMobile?56:64;
  const botNavH = isMobile?60:0;                    // Calzada bottom nav height

  /* ── NAV tabs — desktop top, mobile bottom ── */
  const NAV_ITEMS=[
    {v:"build",  icon:"✦", label:"Build"},
    {v:"output", icon:"◎", label:"Output"},
    {v:"history",icon:"☰", label:"History"},
  ];

  return(
    <>
      <style>{css}</style>
      <GradBg dark={dark}/>
      <div style={{minHeight:"100vh",fontFamily:W.font,color:txt,position:"relative",zIndex:1,
        paddingBottom:botNavH}}>

        {/* ═══ TOP NAV ═══ */}
        <nav style={{display:"flex",alignItems:"center",justifyContent:"space-between",
          padding:`0 ${px}px`,height:navH,boxSizing:"border-box",
          background:navBg,borderBottom:`1px solid ${bord}`,
          backdropFilter:"blur(24px) saturate(1.8)",
          position:"sticky",top:0,zIndex:100,
          boxShadow:"0 1px 0 rgba(0,0,0,0.06),0 4px 16px rgba(0,0,0,0.04)"}}>

          {/* Logo */}
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:isMobile?32:36,height:isMobile?32:36,borderRadius:"50%",
              background:"linear-gradient(135deg,#25D366,#1FAD52)",flexShrink:0,
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:isMobile?14:16,fontWeight:700,color:"#fff",
              boxShadow:"0 2px 8px rgba(37,211,102,0.4)",
              animation:loading?"pulseGreen 1.5s infinite":"none"}}>P</div>
            <div>
              <div style={{fontSize:isMobile?15:18,fontWeight:700,lineHeight:1,color:txt,letterSpacing:"-0.3px"}}>
                {isMobile?"Prompt Eng.":"Prompt Engineer"}
              </div>
              {!isMobile&&<div style={{fontSize:11,color:txt2,lineHeight:1,marginTop:2,letterSpacing:"0.04em"}}>
                Enterprise AI · Sonnet 4</div>}
            </div>
          </div>

          {/* Desktop tabs (Calzada: hidden on mobile — moved to bottom) */}
          {!isMobile&&(
            <div style={{display:"flex",gap:4,background:dark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.04)",
              borderRadius:50,padding:4}}>
              {NAV_ITEMS.map(({v,label})=>(
                <button key={v} onClick={()=>setView(v)} style={{
                  background:view===v?(dark?"rgba(37,211,102,0.2)":W.white):"transparent",
                  border:"none",cursor:"pointer",fontFamily:W.font,
                  fontSize:14,fontWeight:view===v?600:400,
                  color:view===v?W.green:txt2,
                  padding:"8px 18px",borderRadius:50,
                  boxShadow:view===v?"0 1px 4px rgba(0,0,0,0.12)":"none",
                  transition:"all .2s",minHeight:44,
                }}>{label}</button>
              ))}
            </div>
          )}

          {/* Status + toggle + API key */}
          <div style={{display:"flex",alignItems:"center",gap:isMobile?8:16}}>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <div style={{width:7,height:7,borderRadius:"50%",flexShrink:0,
                background:loading?"#F5A623":W.green,
                animation:loading?"pulseGreen 1s infinite":"none",
                boxShadow:loading?"0 0 8px #F5A62366":"0 0 8px rgba(37,211,102,0.5)",
                transition:"background .3s"}}/>
              {!isMobile&&<span style={{fontSize:12,color:txt2}}>{loading?"Processing…":"Ready"}</span>}
            </div>
            
            {/* API Key Button */}
            <button onClick={()=>setShowApiInput(!showApiInput)} style={{
              background:apiKey?"rgba(37,211,102,0.15)":"rgba(255,255,255,0.1)",
              border:apiKey?`1px solid ${W.green}`:"none",
              borderRadius:50,cursor:"pointer",
              padding:isMobile?"8px":"8px 14px",
              fontSize:isMobile?11:12,color:apiKey?W.green:txt3,fontFamily:W.font,
              fontWeight:apiKey?600:400,minHeight:44,minWidth:44,
              transition:"all .2s",
            }}>🔑 {apiKey?"✓ Key":"API"}</button>

            {/* API Key Input (hidden/shown) */}
            {showApiInput&&(
              <input type="password" placeholder="sk-ant-..." value={apiKey}
                onChange={e=>setApiKey(e.target.value)}
                style={{
                  padding:"8px 12px",height:44,borderRadius:50,
                  border:`1px solid ${W.green}`,background:dark?"rgba(37,211,102,0.1)":"rgba(37,211,102,0.05)",
                  color:txt,fontFamily:"monospace",fontSize:12,
                  outline:"none",minWidth:isMobile?120:200,
                  transition:"border .2s",
                }}
                onBlur={()=>setTimeout(()=>setShowApiInput(false),100)}
                onFocus={e=>e.target.select()}
              />
            )}

            <button onClick={()=>setDark(d=>!d)} style={{
              background:dark?"rgba(255,255,255,0.1)":"rgba(0,0,0,0.06)",
              border:"none",borderRadius:50,cursor:"pointer",
              padding:isMobile?"8px":"8px 16px",
              fontSize:isMobile?16:13,color:txt,fontFamily:W.font,
              minWidth:44,minHeight:44,transition:"all .2s",
            }}>{dark?"☀️":"🌙"}</button>
          </div>
        </nav>

        {/* ═══ BODY (Coiset fluid container) ═══ */}
        <div style={{maxWidth:1100,margin:"0 auto",padding:`${isMobile?24:48}px ${px}px`,
          boxSizing:"border-box"}}>

          {/* ═══════ BUILD ═══════ */}
          {view==="build"&&(
            <div className="fade-up" style={{display:"flex",flexDirection:"column",gap}}>

              {/* Hero — Bierut scale, Coiset fluid type */}
              <div>
                <div style={{fontSize:heroSize,fontWeight:700,lineHeight:1.1,
                  letterSpacing:isMobile?"-0.5px":"-1px",color:txt,marginBottom:8}}>
                  Build a precision prompt.
                </div>
                <div style={{fontSize:isMobile?15:18,fontWeight:400,color:txt2,lineHeight:1.6}}>
                  {isMobile?"Describe your goal — get a precision prompt."
                    :"Describe your goal in plain language. We engineer it into an optimized prompt you can use anywhere."}
                </div>
              </div>

              {/* PROVIDER — Phil Pham: vertical on mobile (full-width touch), horizontal desktop */}
              <section>
                <Lbl dark={dark}>AI Provider</Lbl>
                <div style={{display:"flex",flexDirection:provDir,gap:isMobile?10:16}}>
                  {Object.entries(PROVIDERS).map(([key,p])=>{
                    const active=provider===key;
                    return(
                      <button key={key} className="pcard" onClick={()=>setProvider(key)} style={{
                        flex:1,padding:isMobile?"14px 20px":"20px 24px",cursor:"pointer",
                        border:active?`2px solid ${p.color}`:`1px solid ${bord}`,
                        borderRadius:isMobile?14:20,
                        background:active?(dark?`${p.color}18`:`${p.color}0d`):surf,
                        backdropFilter:"blur(12px)",textAlign:"left",
                        boxShadow:active?`0 6px 20px ${p.color}28,0 2px 8px rgba(0,0,0,0.06)`:"0 2px 8px rgba(0,0,0,0.04)",
                        display:"flex",alignItems:isMobile?"center":"flex-start",
                        flexDirection:isMobile?"row":"column",gap:isMobile?14:0,
                        minHeight:44,
                      }}>
                        <div style={{width:isMobile?32:36,height:isMobile?32:36,borderRadius:"50%",flexShrink:0,
                          background:p.grad,marginBottom:isMobile?0:12,
                          boxShadow:`0 3px 10px ${p.color}40`,
                          display:"flex",alignItems:"center",justifyContent:"center",
                          fontSize:14,color:"#fff",fontWeight:700}}>{p.label[0]}</div>
                        <div>
                          <div style={{fontSize:isMobile?15:17,fontWeight:600,color:active?p.color:txt}}>
                            {p.label}</div>
                          <div style={{fontSize:12,color:txt2,marginTop:2}}>{p.sub}</div>
                        </div>
                        {active&&isMobile&&(
                          <span style={{marginLeft:"auto",fontSize:12,fontWeight:700,color:p.color,
                            background:`${p.color}18`,padding:"4px 10px",borderRadius:50,
                            border:`1px solid ${p.color}40`}}>✓</span>
                        )}
                        {active&&!isMobile&&(
                          <div style={{marginTop:10,fontSize:11,fontWeight:600,color:p.color,
                            letterSpacing:"0.06em",textTransform:"uppercase"}}>✓ Selected</div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* INPUT — Zumbrunnen focus, Phil Pham: larger tap area mobile */}
              <section>
                <Lbl dark={dark}>Your Goal</Lbl>
                <div style={{position:"relative"}}>
                  <textarea value={input} onChange={e=>setInput(e.target.value)}
                    placeholder={isMobile?"What do you want an AI to do?":"Describe what you want an AI to do — plain language. We'll turn it into a precision prompt."}
                    style={{width:"100%",minHeight:isMobile?110:130,
                      background:inputBg,border:`1.5px solid ${inputBd}`,borderRadius:16,
                      padding:isMobile?"14px 16px":"16px 20px",
                      fontFamily:W.font,fontSize:isMobile?16:17,lineHeight:"26px",color:txt,
                      outline:"none",resize:"vertical",backdropFilter:"blur(8px)",
                      transition:"border-color .2s,box-shadow .25s cubic-bezier(.34,1.56,.64,1)",
                    }}
                    onFocus={e=>{e.target.style.borderColor=W.green;
                      e.target.style.boxShadow="0 0 0 4px rgba(37,211,102,0.15),0 4px 16px rgba(0,0,0,0.08)";}}
                    onBlur={e=>{e.target.style.borderColor=inputBd;e.target.style.boxShadow="none";}}
                  />
                  {input.length>0&&(
                    <div style={{position:"absolute",bottom:12,right:14,
                      fontSize:10,color:txt3,pointerEvents:"none"}}>{input.length}</div>
                  )}
                </div>

                {/* Domain detection chips */}
                {detDomains.length>0&&(
                  <div className="fade-up" style={{marginTop:12,padding:"14px 16px",borderRadius:14,
                    background:dark?"rgba(37,211,102,0.08)":"rgba(37,211,102,0.06)",
                    border:"1.5px solid rgba(37,211,102,0.28)",
                    boxShadow:"0 4px 16px rgba(37,211,102,0.1)"}}>
                    <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.1em",
                      textTransform:"uppercase",color:W.green,marginBottom:10}}>
                      ⚡ Domains detected
                    </div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                      {detDomains.map(d=>(
                        <span key={d.domain} style={{fontSize:11,fontWeight:600,
                          padding:"4px 10px",borderRadius:50,color:"#fff",
                          background:`linear-gradient(135deg,${d.color},${d.color}cc)`,
                          boxShadow:`0 2px 6px ${d.color}40`}}>{d.domain}</span>
                      ))}
                    </div>
                    {/* Phil Pham progressive disclosure: experts collapsed on mobile */}
                    {!isMobile&&(
                      <div style={{marginTop:8,fontSize:12,color:txt2,lineHeight:1.6}}>
                        {detDomains.map(d=>(
                          <span key={d.domain} style={{display:"block",marginBottom:2}}>
                            <span style={{color:d.color,fontWeight:600}}>{d.domain}:</span>
                            {" "}{d.experts.join(" · ")}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </section>

              {/* TECHNIQUES — Coiset responsive grid */}
              <section>
                <div style={{display:"flex",alignItems:"baseline",gap:10,marginBottom:12}}>
                  <Lbl dark={dark} noMb>Techniques</Lbl>
                  {techIds.length>0&&(
                    <span style={{fontSize:11,fontWeight:700,color:W.green,
                      padding:"2px 8px",borderRadius:50,
                      background:"rgba(37,211,102,0.12)",border:"1px solid rgba(37,211,102,0.3)"}}>
                      {techIds.length} active</span>
                  )}
                </div>
                <div style={{display:"grid",gridTemplateColumns:techCols,gap:isMobile?8:12}}>
                  {TECHNIQUES.map(t=>{
                    const sel=techIds.includes(t.id);const col=TC[t.id];
                    return(
                      <button key={t.id} className={`tech-card${sel?" sel":""}`}
                        onClick={()=>toggleTech(t.id)} style={{
                        textAlign:"left",padding:isMobile?"12px 12px":"16px 18px",
                        borderRadius:isMobile?12:16,cursor:"pointer",
                        border:sel?`2px solid ${col}`:`1.5px solid ${bord}`,
                        background:sel?(dark?`${col}16`:`${col}0c`):surf,
                        backdropFilter:"blur(12px)",position:"relative",overflow:"hidden",
                        boxShadow:sel?`0 6px 20px ${col}25,0 2px 8px rgba(0,0,0,0.05)`:"0 2px 6px rgba(0,0,0,0.04)",
                        minHeight:44,
                      }}>
                        <div style={{position:"absolute",top:0,left:0,right:0,height:3,
                          background:sel?`linear-gradient(90deg,${col},${col}66)`:"transparent",
                          transition:"all .2s"}}/>
                        {sel&&(
                          <div style={{position:"absolute",top:8,right:8,width:16,height:16,
                            borderRadius:"50%",background:col,
                            display:"flex",alignItems:"center",justifyContent:"center",
                            fontSize:8,color:"#fff",fontWeight:800,
                            boxShadow:`0 2px 6px ${col}60`}}>✓</div>
                        )}
                        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:isMobile?4:6,marginTop:4}}>
                          <span style={{fontSize:9,fontWeight:700,letterSpacing:"0.07em",
                            padding:"2px 6px",borderRadius:50,
                            background:sel?`${col}22`:(dark?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.05)"),
                            color:sel?col:txt2,border:`1px solid ${sel?col+"50":bord}`}}>
                            {t.short}</span>
                        </div>
                        <div style={{fontSize:isMobile?12:13,fontWeight:sel?600:500,
                          color:sel?col:txt,lineHeight:1.3,marginBottom:isMobile?0:4}}>{t.name}</div>
                        {/* Phil Pham: hide description on mobile to reduce density */}
                        {!isMobile&&(
                          <div style={{fontSize:11,color:txt2,lineHeight:1.45}}>{t.desc}</div>
                        )}
                      </button>
                    );
                  })}
                </div>
                {techIds.length>1&&(
                  <div className="fade-up" style={{marginTop:10,padding:"8px 14px",borderRadius:10,
                    background:dark?"rgba(37,211,102,0.07)":"rgba(37,211,102,0.05)",
                    border:"1px solid rgba(37,211,102,0.2)",
                    fontSize:12,color:txt2,lineHeight:1.5,overflowX:"auto",whiteSpace:"nowrap"}}>
                    <span style={{color:W.green,fontWeight:600}}>Stack: </span>
                    {TECHNIQUES.filter(t=>techIds.includes(t.id)).map(t=>t.name).join(" → ")}
                  </div>
                )}
              </section>

              {/* CONSTRAINTS — wrapping pills */}
              <section>
                <Lbl dark={dark}>Output Constraints</Lbl>
                <div style={{display:"flex",flexWrap:"wrap",gap:isMobile?8:10}}>
                  {CONSTRAINTS.map(c=>{
                    const on=constraints.includes(c);
                    return(
                      <button key={c} className={`cpill${on?" on":""}`}
                        onClick={()=>toggleC(c)} style={{
                        fontSize:isMobile?13:14,fontWeight:500,
                        padding:isMobile?"9px 16px":"10px 20px",
                        borderRadius:50,cursor:"pointer",minHeight:44,
                        border:on?`2px solid ${W.green}`:`1.5px solid ${bord}`,
                        background:on?"linear-gradient(135deg,rgba(37,211,102,0.14),rgba(31,173,82,0.07))":surf,
                        color:on?W.green:txt2,backdropFilter:"blur(8px)",
                        boxShadow:on?"0 4px 14px rgba(37,211,102,0.18)":"0 1px 4px rgba(0,0,0,0.05)",
                      }}>{on?"✓ ":""}{c}</button>
                    );
                  })}
                </div>
              </section>

              {/* RUN CTA */}
              <button className="runcta" onClick={()=>run()}
                disabled={loading||!input.trim()} style={{
                width:"100%",padding:isMobile?"16px":"18px 40px",minHeight:56,
                borderRadius:50,border:"none",
                cursor:loading||!input.trim()?"not-allowed":"pointer",
                background:loading||!input.trim()
                  ?(dark?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.07)")
                  :"linear-gradient(135deg,#25D366 0%,#1FAD52 50%,#00C853 100%)",
                backgroundSize:"200% 200%",
                animation:loading||!input.trim()?"none":"gradShift 3s ease infinite",
                color:loading||!input.trim()?txt3:W.charcoal,
                fontFamily:W.font,fontSize:isMobile?16:17,fontWeight:600,
                boxShadow:loading||!input.trim()?"none":"0 8px 24px rgba(37,211,102,0.32),0 2px 8px rgba(0,0,0,0.08)",
                letterSpacing:"-0.2px",transition:"all .2s",
              }}>
                {loading?(
                  <span style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                    <span style={{width:15,height:15,border:"2px solid rgba(0,0,0,0.2)",
                      borderTopColor:W.charcoal,borderRadius:"50%",display:"inline-block",
                      animation:"spin .8s linear infinite"}}/>
                    Processing…
                  </span>
                ):"Generate Prompt →"}
              </button>
            </div>
          )}

          {/* ═══════ OUTPUT ═══════ */}
          {view==="output"&&(
            <div className="fade-up" style={{display:"flex",flexDirection:"column",gap:isMobile?20:28}}>
              <div>
                <div style={{fontSize:isMobile?24:32,fontWeight:700,letterSpacing:"-0.5px",color:txt,marginBottom:8}}>
                  Generated Prompt
                </div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {outMeta.provider&&(
                    <span style={{fontSize:11,fontWeight:600,padding:"4px 10px",borderRadius:50,
                      background:"rgba(37,211,102,0.16)",color:W.green,
                      border:"1px solid rgba(37,211,102,0.32)"}}>
                      {outMeta.provider}</span>
                  )}
                  {outMeta.techs?.map(t=>(
                    <span key={t.short} style={{fontSize:11,fontWeight:600,padding:"4px 10px",
                      borderRadius:50,color:t.color,border:`1px solid ${t.color}40`,
                      background:`${t.color}12`}}>{t.short}</span>
                  ))}
                  {outMeta.domains?.map(d=>(
                    <span key={d.domain} style={{fontSize:11,fontWeight:600,padding:"4px 10px",
                      borderRadius:50,color:"#fff",
                      background:`linear-gradient(135deg,${d.color},${d.color}cc)`,
                      boxShadow:`0 2px 6px ${d.color}35`}}>{d.domain}</span>
                  ))}
                </div>
              </div>

              {/* Output bubble */}
              <div style={{position:"relative"}}>
                <button onClick={()=>{
                  if(output) {
                    navigator.clipboard.writeText(output).then(()=>{
                      setCopied(true);
                      setTimeout(()=>setCopied(false),2000);
                    }).catch(e=>console.error("Copy failed:",e));
                  }
                }}
                  style={{position:"absolute",top:12,right:12,zIndex:10,
                    background:copied?W.green:"rgba(0,0,0,0.1)",
                    border:"none",borderRadius:50,cursor:output?"pointer":"not-allowed",
                    padding:"8px 14px",fontSize:12,fontWeight:600,
                    color:copied?"#fff":txt2,
                    transition:"all .2s",minHeight:36,
                    backdropFilter:"blur(8px)",
                    opacity:output?1:0.5,
                  }}>
                  {copied?"✓ Copied!":"📋 Copy"}
                </button>
                <div style={{borderRadius:"4px 20px 20px 20px",
                  padding:isMobile?"18px 18px":"24px 28px",
                  fontFamily:W.font,fontSize:isMobile?15:17,lineHeight:"27px",
                  color:output?txt:txt2,minHeight:isMobile?140:180,whiteSpace:"pre-wrap",
                  backdropFilter:"blur(12px)",
                  background:output
                    ?(dark?"linear-gradient(135deg,rgba(42,57,66,0.95),rgba(28,30,33,0.9))"
                         :"linear-gradient(135deg,rgba(231,243,255,0.92),rgba(240,249,244,0.88))")
                    :surf,
                  border:`1.5px solid ${dark?"rgba(255,255,255,0.1)":"rgba(37,211,102,0.2)"}`,
                  boxShadow:output?"0 8px 32px rgba(0,0,0,0.1),0 2px 8px rgba(0,0,0,0.05)":"0 2px 6px rgba(0,0,0,0.05)",
                }}>
                  {loading?(<span style={{color:txt2}}>Generating<TypingDot/></span>)
                    :(output||"No output yet. Build a prompt and run it.")}
                </div>
              </div>

              {output&&(
                <div className="fade-up">
                  <Lbl dark={dark}>Refine</Lbl>
                  <div style={{display:"flex",flexWrap:"wrap",gap:isMobile?8:10}}>
                    {REFINES.map(r=>(
                      <button key={r} className="rbtn" onClick={()=>refine(r)}
                        disabled={loading} style={{
                        fontSize:isMobile?13:14,fontWeight:500,
                        padding:isMobile?"9px 14px":"10px 20px",
                        borderRadius:50,cursor:loading?"not-allowed":"pointer",minHeight:44,
                        border:`1.5px solid ${bord}`,background:surf,color:txt2,
                        backdropFilter:"blur(8px)",
                        boxShadow:"0 2px 6px rgba(0,0,0,0.05)",
                      }}>{r}</button>
                    ))}
                  </div>
                </div>
              )}

              <button onClick={()=>setView("build")} style={{
                alignSelf:"flex-start",fontSize:14,fontWeight:500,
                padding:"10px 0",background:"transparent",border:"none",
                color:W.blue,cursor:"pointer",fontFamily:W.font,minHeight:44,
                transition:"color .15s",
              }}>← Build new</button>
            </div>
          )}

          {/* ═══════ HISTORY ═══════ */}
          {view==="history"&&(
            <div className="fade-up" style={{display:"flex",flexDirection:"column",gap:12}}>
              <div style={{fontSize:isMobile?24:32,fontWeight:700,letterSpacing:"-0.5px",
                color:txt,marginBottom:4}}>History</div>
              {history.length===0
                ?(
                  <div style={{padding:isMobile?"48px 20px":"64px 32px",textAlign:"center",
                    borderRadius:20,background:surf,border:`1.5px solid ${bord}`,
                    backdropFilter:"blur(12px)"}}>
                    <div style={{fontSize:40,marginBottom:10}}>✦</div>
                    <div style={{fontSize:17,color:txt2}}>No runs yet</div>
                    <div style={{fontSize:13,color:txt3,marginTop:6}}>Build a prompt and hit Run.</div>
                  </div>
                )
                :history.map((h,i)=>(
                  <button key={h.id} className="hrow"
                    onClick={()=>{setOutput(h.output);setOutMeta({provider:h.provider,techs:[],domains:[]});setView("output");}}
                    style={{textAlign:"left",padding:isMobile?"16px 16px":"20px 24px",
                      borderRadius:16,cursor:"pointer",
                      border:`1.5px solid ${bord}`,background:surf,
                      backdropFilter:"blur(12px)",
                      boxShadow:"0 2px 8px rgba(0,0,0,0.05)",
                      borderLeft:`4px solid ${h.color||W.green}`,
                      animation:`fadeUp 0.3s ${i*0.05}s both`,minHeight:44,
                    }}>
                    <div style={{fontSize:isMobile?14:15,fontWeight:500,color:txt,
                      marginBottom:8,lineHeight:1.4}}>{h.input}</div>
                    <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
                      <span style={{fontSize:10,fontWeight:600,padding:"3px 9px",borderRadius:50,
                        background:`${h.color||W.green}18`,color:h.color||W.green,
                        border:`1px solid ${h.color||W.green}35`}}>{h.provider}</span>
                      {h.techs!=="None"&&(
                        <span style={{fontSize:10,padding:"3px 9px",borderRadius:50,
                          background:dark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.04)",
                          color:txt2,border:`1px solid ${bord}`}}>{h.techs}</span>
                      )}
                      <span style={{fontSize:10,color:txt3,marginLeft:"auto"}}>{h.ts}</span>
                    </div>
                  </button>
                ))
              }
            </div>
          )}
        </div>

        {/* ═══ MOBILE BOTTOM NAV (Calzada thumb-zone) ═══ */}
        {isMobile&&(
          <nav className="bottom-nav" style={{
            position:"fixed",bottom:0,left:0,right:0,zIndex:200,
            background:navBg,backdropFilter:"blur(24px) saturate(1.8)",
            borderTop:`1px solid ${bord}`,
            display:"flex",alignItems:"stretch",
            boxShadow:"0 -4px 16px rgba(0,0,0,0.08)",
          }}>
            {NAV_ITEMS.map(({v,icon,label})=>(
              <button key={v} onClick={()=>setView(v)} style={{
                flex:1,display:"flex",flexDirection:"column",alignItems:"center",
                justifyContent:"center",gap:3,
                background:"none",border:"none",cursor:"pointer",
                fontFamily:W.font,padding:"8px 0",
                color:view===v?W.green:txt3,
                minHeight:botNavH,
                transition:"color .18s",
              }}>
                <span style={{fontSize:18,lineHeight:1,
                  filter:view===v?`drop-shadow(0 0 4px ${W.green}88)`:"none",
                  transition:"filter .18s"}}>{icon}</span>
                <span style={{fontSize:10,fontWeight:view===v?700:400,
                  letterSpacing:"0.04em"}}>{label}</span>
                {view===v&&(
                  <div style={{position:"absolute",top:0,left:"50%",
                    transform:"translateX(-50%)",width:32,height:2,
                    borderRadius:"0 0 4px 4px",background:W.green}}/>
                )}
              </button>
            ))}
          </nav>
        )}

      </div>
    </>
  );
}
