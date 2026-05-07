/* ════════════════════════════════════════════════════════════
   PROMPT ENGINEER — DESIGN SYSTEM
   Refined enterprise: deep slate + emerald + serif accent
   Inspired by Linear / Vercel / Stripe
   ════════════════════════════════════════════════════════════ */

@import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&display=swap');

:root {
  /* Light theme — refined neutral with emerald accent */
  --bg-base: #FAFAF9;
  --bg-elevated: #FFFFFF;
  --bg-subtle: #F5F5F4;
  --bg-muted: rgba(0,0,0,0.03);
  --border: rgba(0,0,0,0.08);
  --border-strong: rgba(0,0,0,0.14);
  --text-pri: #0C0A09;
  --text-sec: #57534E;
  --text-tert: #A8A29E;

  --accent: #059669;
  --accent-hov: #047857;
  --accent-soft: rgba(5,150,105,0.08);
  --accent-glow: rgba(5,150,105,0.15);

  --shadow-sm: 0 1px 2px rgba(0,0,0,0.04), 0 1px 1px rgba(0,0,0,0.02);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.03);
  --shadow-lg: 0 16px 40px rgba(0,0,0,0.10), 0 4px 12px rgba(0,0,0,0.06);
  --shadow-glow: 0 0 0 1px rgba(5,150,105,0.3), 0 8px 32px rgba(5,150,105,0.18);

  --font-sans: 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-serif: 'Instrument Serif', Georgia, serif;
  --font-mono: 'Geist Mono', ui-monospace, 'SF Mono', monospace;

  --radius-sm: 8px;
  --radius: 12px;
  --radius-lg: 18px;
  --radius-xl: 24px;
  --radius-pill: 999px;
}

[data-theme="dark"] {
  --bg-base: #0A0A0A;
  --bg-elevated: #141414;
  --bg-subtle: #1C1917;
  --bg-muted: rgba(255,255,255,0.04);
  --border: rgba(255,255,255,0.08);
  --border-strong: rgba(255,255,255,0.16);
  --text-pri: #FAFAF9;
  --text-sec: #A8A29E;
  --text-tert: #57534E;

  --accent: #10B981;
  --accent-hov: #34D399;
  --accent-soft: rgba(16,185,129,0.10);
  --accent-glow: rgba(16,185,129,0.20);

  --shadow-sm: 0 1px 2px rgba(0,0,0,0.4);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.2);
  --shadow-lg: 0 16px 40px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.3);
  --shadow-glow: 0 0 0 1px rgba(16,185,129,0.4), 0 8px 32px rgba(16,185,129,0.25);
}

/* Reset */
*, *::before, *::after { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
body { margin: 0; padding: 0; font-family: var(--font-sans); background: var(--bg-base); color: var(--text-pri); transition: background .25s ease, color .25s ease; }
button { font-family: inherit; }

/* ═══ Animations ═══ */
@keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
@keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
@keyframes slideDown { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
@keyframes spin { to { transform:rotate(360deg); } }
@keyframes blink { 0%,100%{opacity:1;}50%{opacity:0;} }
@keyframes pulse-ring { 0% { box-shadow:0 0 0 0 var(--accent-glow); } 70% { box-shadow:0 0 0 10px transparent; } 100% { box-shadow:0 0 0 0 transparent; } }
@keyframes shimmer { 0% { background-position:-200% 0; } 100% { background-position:200% 0; } }
@keyframes orb1 { 0%,100% { transform:translate(0,0); } 50% { transform:translate(40px,-30px); } }
@keyframes orb2 { 0%,100% { transform:translate(0,0); } 50% { transform:translate(-30px,40px); } }

.fade-up { animation: fadeUp .5s cubic-bezier(0.22,1,0.36,1) both; }
.fade-in { animation: fadeIn .4s ease both; }
.slide-down { animation: slideDown .3s cubic-bezier(0.22,1,0.36,1) both; }

/* ═══ Atmospheric background ═══ */
.bg-atmosphere {
  position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden;
  background: var(--bg-base);
}
.bg-atmosphere::before, .bg-atmosphere::after {
  content: ""; position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.4;
}
.bg-atmosphere::before {
  top: -10%; left: -5%; width: 50%; height: 50%;
  background: radial-gradient(circle, var(--accent) 0%, transparent 70%);
  animation: orb1 18s ease-in-out infinite;
}
.bg-atmosphere::after {
  bottom: -10%; right: -5%; width: 45%; height: 45%;
  background: radial-gradient(circle, #6366F1 0%, transparent 70%);
  opacity: 0.25;
  animation: orb2 22s ease-in-out infinite;
}
[data-theme="dark"] .bg-atmosphere::before { opacity: 0.25; }
[data-theme="dark"] .bg-atmosphere::after { opacity: 0.15; }

/* Grain overlay for texture */
.bg-grain {
  position: fixed; inset: 0; z-index: 1; pointer-events: none; opacity: 0.4;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.04 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

/* ═══ Layout ═══ */
.app-shell { position: relative; z-index: 2; min-height: 100vh; }
.container { max-width: 1180px; margin: 0 auto; padding: 0 clamp(16px, 4vw, 56px); }
.container-narrow { max-width: 880px; margin: 0 auto; padding: 0 clamp(16px, 4vw, 32px); }

/* ═══ Top Nav ═══ */
.nav {
  position: sticky; top: 0; z-index: 100;
  background: color-mix(in srgb, var(--bg-base) 80%, transparent);
  backdrop-filter: blur(24px) saturate(1.8);
  -webkit-backdrop-filter: blur(24px) saturate(1.8);
  border-bottom: 1px solid var(--border);
}
.nav-inner {
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
  height: 64px; padding: 0 clamp(16px, 4vw, 56px);
}
@media (max-width: 640px) { .nav-inner { height: 56px; } }

.brand { display: flex; align-items: center; gap: 10px; min-width: 0; }
.brand-mark {
  width: 32px; height: 32px; border-radius: 8px; flex-shrink: 0;
  background: linear-gradient(135deg, var(--accent), var(--accent-hov));
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-serif); font-style: italic; font-size: 18px; color: #fff; font-weight: 600;
  box-shadow: 0 2px 12px var(--accent-glow);
  position: relative;
}
.brand-mark.processing { animation: pulse-ring 1.5s infinite; }
.brand-name { font-size: 16px; font-weight: 600; letter-spacing: -0.02em; color: var(--text-pri); white-space: nowrap; }
.brand-sub { font-size: 11px; color: var(--text-tert); letter-spacing: 0.02em; line-height: 1; }
@media (max-width: 640px) { .brand-sub { display: none; } }

.tabs { display: flex; gap: 2px; background: var(--bg-muted); border-radius: var(--radius-pill); padding: 4px; border: 1px solid var(--border); }
.tab {
  background: transparent; border: none; cursor: pointer;
  font-family: inherit; font-size: 13px; font-weight: 500;
  color: var(--text-sec); padding: 8px 16px; border-radius: var(--radius-pill);
  transition: all .18s cubic-bezier(0.4,0,0.2,1);
  min-height: 36px; white-space: nowrap;
}
.tab:hover { color: var(--text-pri); }
.tab.active {
  background: var(--bg-elevated); color: var(--text-pri); font-weight: 600;
  box-shadow: var(--shadow-sm);
}
@media (max-width: 1023px) { .tabs { display: none; } }

.nav-actions { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
.status-dot {
  width: 7px; height: 7px; border-radius: 50%; background: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}
.status-dot.processing { background: #F59E0B; box-shadow: 0 0 0 3px rgba(245,158,11,0.2); animation: pulse-ring 1.2s infinite; }
.status-text { font-size: 12px; color: var(--text-sec); }
@media (max-width: 640px) { .status-text { display: none; } }

/* ═══ Buttons ═══ */
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  font-family: inherit; font-size: 13px; font-weight: 500;
  padding: 8px 14px; min-height: 36px; border-radius: var(--radius-pill);
  border: 1px solid transparent; cursor: pointer;
  transition: all .18s cubic-bezier(0.4,0,0.2,1);
  white-space: nowrap;
}
.btn:disabled { cursor: not-allowed; opacity: 0.5; }

.btn-primary {
  background: var(--text-pri); color: var(--bg-base); border-color: var(--text-pri);
  box-shadow: var(--shadow-sm);
}
.btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: var(--shadow-md); }

.btn-accent {
  background: var(--accent); color: #fff; border-color: var(--accent);
  box-shadow: 0 1px 3px var(--accent-glow);
}
.btn-accent:hover:not(:disabled) { background: var(--accent-hov); transform: translateY(-1px); box-shadow: 0 4px 16px var(--accent-glow); }

.btn-ghost {
  background: var(--bg-muted); color: var(--text-pri); border-color: var(--border);
}
.btn-ghost:hover:not(:disabled) { background: var(--bg-subtle); border-color: var(--border-strong); }

.btn-soft {
  background: var(--accent-soft); color: var(--accent); border-color: var(--accent-soft);
}
.btn-soft:hover:not(:disabled) { background: var(--accent-glow); }

.btn-icon {
  width: 36px; padding: 0; min-height: 36px; flex-shrink: 0;
}

.btn-lg {
  padding: 14px 28px; min-height: 52px; font-size: 15px; font-weight: 600;
  border-radius: var(--radius-pill);
}

.btn-cta {
  background: linear-gradient(135deg, var(--accent), var(--accent-hov));
  color: #fff; border: none;
  padding: 16px 32px; min-height: 56px;
  font-size: 15px; font-weight: 600; letter-spacing: -0.01em;
  border-radius: var(--radius-pill); cursor: pointer;
  box-shadow: 0 4px 20px var(--accent-glow), inset 0 1px 0 rgba(255,255,255,0.15);
  width: 100%;
  transition: all .18s cubic-bezier(0.4,0,0.2,1);
}
.btn-cta:not(:disabled):hover { transform: translateY(-1px); box-shadow: 0 8px 28px var(--accent-glow), inset 0 1px 0 rgba(255,255,255,0.15); }
.btn-cta:not(:disabled):active { transform: translateY(0); }
.btn-cta:disabled { background: var(--bg-muted); color: var(--text-tert); cursor: not-allowed; box-shadow: none; }

/* ═══ Hero / typography ═══ */
.hero-headline {
  font-family: var(--font-sans);
  font-size: clamp(28px, 5.5vw, 48px);
  font-weight: 600;
  line-height: 1.05;
  letter-spacing: -0.025em;
  color: var(--text-pri);
  margin: 0;
}
.hero-headline em {
  font-family: var(--font-serif); font-style: italic; font-weight: 400;
  color: var(--accent); letter-spacing: -0.01em;
}
.hero-sub {
  font-size: clamp(15px, 2vw, 19px);
  font-weight: 400;
  line-height: 1.55;
  color: var(--text-sec);
  margin: 12px 0 0; max-width: 640px;
}

.section-label {
  font-family: var(--font-mono); font-size: 11px; font-weight: 500;
  letter-spacing: 0.08em; text-transform: uppercase;
  color: var(--text-tert);
}

.h2 {
  font-size: clamp(24px, 3.5vw, 36px); font-weight: 600;
  letter-spacing: -0.02em; color: var(--text-pri); margin: 0;
}
.h2 em { font-family: var(--font-serif); font-style: italic; font-weight: 400; }

/* ═══ Surfaces ═══ */
.surface {
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.surface-glass {
  background: color-mix(in srgb, var(--bg-elevated) 85%, transparent);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
}

/* ═══ Form controls ═══ */
.input, .textarea {
  width: 100%; font-family: inherit;
  background: var(--bg-elevated); color: var(--text-pri);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius);
  padding: 12px 16px;
  font-size: 15px; line-height: 1.5;
  outline: none;
  transition: border-color .18s, box-shadow .18s;
}
.input:focus, .textarea:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}
.textarea { resize: vertical; min-height: 130px; line-height: 1.6; }
@media (max-width: 640px) { .textarea { min-height: 110px; font-size: 16px; } /* prevent iOS zoom */ }

/* ═══ Tech card ═══ */
.tech-card {
  position: relative; text-align: left; padding: 14px 16px;
  background: var(--bg-elevated); border: 1px solid var(--border);
  border-radius: var(--radius); cursor: pointer;
  transition: all .2s cubic-bezier(0.4,0,0.2,1);
  overflow: hidden;
}
.tech-card:hover { border-color: var(--border-strong); transform: translateY(-2px); box-shadow: var(--shadow-md); }
.tech-card.sel { border-color: var(--tech-color); background: color-mix(in srgb, var(--tech-color) 6%, var(--bg-elevated)); box-shadow: 0 4px 16px color-mix(in srgb, var(--tech-color) 18%, transparent); }
.tech-card .indicator { position: absolute; top: 0; left: 0; right: 0; height: 2px; background: var(--tech-color); transform: scaleX(0); transform-origin: left; transition: transform .25s; }
.tech-card.sel .indicator { transform: scaleX(1); }

.tech-tag {
  display: inline-block; font-family: var(--font-mono);
  font-size: 10px; font-weight: 500; letter-spacing: 0.04em;
  padding: 2px 7px; border-radius: 4px;
  background: var(--bg-muted); color: var(--text-sec);
  border: 1px solid var(--border);
}
.tech-card.sel .tech-tag { background: color-mix(in srgb, var(--tech-color) 12%, transparent); color: var(--tech-color); border-color: color-mix(in srgb, var(--tech-color) 30%, transparent); }

.tech-name { font-size: 13px; font-weight: 500; color: var(--text-pri); margin: 6px 0 4px; }
.tech-card.sel .tech-name { color: var(--tech-color); font-weight: 600; }
.tech-desc { font-size: 11.5px; color: var(--text-sec); line-height: 1.45; }
@media (max-width: 640px) { .tech-desc { display: none; } }

.tech-check {
  position: absolute; top: 10px; right: 10px;
  width: 16px; height: 16px; border-radius: 50%;
  background: var(--tech-color); color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 9px; font-weight: 700;
  box-shadow: 0 2px 6px color-mix(in srgb, var(--tech-color) 50%, transparent);
}

/* ═══ Constraint pill ═══ */
.cpill {
  font-size: 13px; font-weight: 500;
  padding: 8px 14px; min-height: 36px;
  background: var(--bg-elevated); color: var(--text-sec);
  border: 1px solid var(--border);
  border-radius: var(--radius-pill); cursor: pointer;
  transition: all .15s cubic-bezier(0.4,0,0.2,1);
  white-space: nowrap;
}
.cpill:hover { border-color: var(--border-strong); color: var(--text-pri); }
.cpill.on {
  background: var(--accent-soft); color: var(--accent);
  border-color: color-mix(in srgb, var(--accent) 35%, transparent);
}

/* ═══ Template card ═══ */
.tpl-card {
  text-align: left; padding: 18px 20px;
  background: var(--bg-elevated); border: 1px solid var(--border);
  border-radius: var(--radius-lg); cursor: pointer;
  transition: all .2s cubic-bezier(0.4,0,0.2,1);
  display: flex; flex-direction: column; gap: 8px;
}
.tpl-card:hover { transform: translateY(-3px); border-color: var(--border-strong); box-shadow: var(--shadow-md); }

.tpl-header { display: flex; align-items: center; gap: 8px; }
.tpl-icon { font-size: 22px; line-height: 1; }
.tpl-cat {
  font-family: var(--font-mono); font-size: 10px; font-weight: 500;
  padding: 2px 8px; border-radius: 4px;
  background: var(--bg-muted); color: var(--text-sec);
  letter-spacing: 0.04em; text-transform: uppercase;
}
.tpl-title { font-size: 15px; font-weight: 600; color: var(--text-pri); line-height: 1.3; }
.tpl-seed {
  font-size: 12.5px; color: var(--text-sec); line-height: 1.5;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.tpl-tags { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px; }

/* ═══ Output bubble ═══ */
.output-bubble {
  position: relative;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 24px 28px;
  font-size: 16px; line-height: 1.65;
  color: var(--text-pri);
  white-space: pre-wrap;
  min-height: 200px;
  box-shadow: var(--shadow-md);
}
@media (max-width: 640px) { .output-bubble { padding: 20px 18px; font-size: 15px; line-height: 1.6; } }

.output-empty { color: var(--text-tert); font-style: italic; }

/* ═══ History row ═══ */
.hrow {
  text-align: left; padding: 16px 20px;
  background: var(--bg-elevated); border: 1px solid var(--border);
  border-left: 3px solid var(--accent);
  border-radius: var(--radius);
  cursor: pointer;
  transition: all .18s;
  display: flex; flex-direction: column; gap: 8px;
}
.hrow:hover { border-color: var(--border-strong); transform: translateX(3px); box-shadow: var(--shadow-sm); }

/* ═══ Library item ═══ */
.lib-item {
  padding: 18px 20px;
  background: var(--bg-elevated); border: 1px solid var(--border);
  border-left: 3px solid #8B5CF6;
  border-radius: var(--radius);
  display: flex; flex-direction: column; gap: 10px;
}

/* ═══ Mobile bottom nav ═══ */
.bottom-nav {
  position: fixed; bottom: 0; left: 0; right: 0; z-index: 200;
  background: color-mix(in srgb, var(--bg-base) 92%, transparent);
  backdrop-filter: blur(24px) saturate(1.8);
  -webkit-backdrop-filter: blur(24px) saturate(1.8);
  border-top: 1px solid var(--border);
  display: flex;
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
@media (min-width: 1024px) { .bottom-nav { display: none; } }
.bottom-nav-btn {
  flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 3px; padding: 10px 0; min-height: 60px;
  background: none; border: none; cursor: pointer;
  color: var(--text-tert); font-family: inherit;
  transition: color .18s;
}
.bottom-nav-btn.active { color: var(--accent); }
.bottom-nav-icon { font-size: 18px; line-height: 1; }
.bottom-nav-label { font-size: 10px; font-weight: 500; letter-spacing: 0.02em; }

/* ═══ Tooltip ═══ */
.tt-wrap { position: relative; }
.tt {
  position: absolute; bottom: calc(100% + 8px); left: 50%; transform: translateX(-50%);
  background: var(--text-pri); color: var(--bg-base);
  font-size: 11px; padding: 6px 10px; border-radius: 6px;
  opacity: 0; pointer-events: none; transition: opacity .15s;
  z-index: 50; max-width: 240px; white-space: normal;
  text-align: center; line-height: 1.4;
  box-shadow: var(--shadow-md);
}
@media (hover: hover) { .tt-wrap:hover .tt { opacity: 1; } }

/* ═══ Modal ═══ */
.modal-backdrop {
  position: fixed; inset: 0; z-index: 300;
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center; padding: 20px;
  animation: fadeIn .2s ease;
}
.modal {
  width: 100%; max-width: 420px;
  background: var(--bg-elevated);
  border-radius: var(--radius-xl);
  border: 1px solid var(--border);
  padding: 32px 28px;
  box-shadow: var(--shadow-lg);
  animation: fadeUp .3s cubic-bezier(0.22,1,0.36,1);
}

/* ═══ Scrollbar ═══ */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border-strong); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: var(--text-tert); }

/* ═══ Landing page specific ═══ */
.landing-hero {
  padding: clamp(60px, 10vw, 120px) 0 clamp(40px, 6vw, 80px);
  text-align: center;
}
.landing-headline {
  font-family: var(--font-sans);
  font-size: clamp(36px, 7vw, 72px);
  font-weight: 600; line-height: 1.02;
  letter-spacing: -0.035em;
  color: var(--text-pri);
  margin: 0;
}
.landing-headline em {
  font-family: var(--font-serif); font-style: italic; font-weight: 400;
  color: var(--accent); letter-spacing: -0.015em;
}
.landing-sub {
  font-size: clamp(16px, 2.2vw, 21px);
  color: var(--text-sec); line-height: 1.55;
  max-width: 620px; margin: 24px auto 0;
}
.landing-cta-row {
  display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;
  margin-top: 36px;
}

.feature-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}
.feature-card {
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 28px 26px;
  transition: all .25s;
}
.feature-card:hover { transform: translateY(-3px); border-color: var(--border-strong); box-shadow: var(--shadow-md); }
.feature-icon {
  width: 44px; height: 44px;
  background: var(--accent-soft); color: var(--accent);
  border-radius: var(--radius);
  display: flex; align-items: center; justify-content: center;
  font-size: 22px;
  margin-bottom: 16px;
}
.feature-title { font-size: 17px; font-weight: 600; margin: 0 0 8px; color: var(--text-pri); letter-spacing: -0.01em; }
.feature-desc { font-size: 14.5px; color: var(--text-sec); line-height: 1.55; margin: 0; }

.divider { height: 1px; background: var(--border); margin: clamp(40px, 8vw, 96px) 0; border: none; }

.subtle-card {
  background: linear-gradient(135deg, var(--accent-soft), transparent);
  border: 1px solid color-mix(in srgb, var(--accent) 20%, transparent);
  border-radius: var(--radius-lg);
  padding: 24px 28px;
}

/* Domain banner */
.domain-banner {
  background: var(--accent-soft);
  border: 1px solid color-mix(in srgb, var(--accent) 25%, transparent);
  border-radius: var(--radius);
  padding: 14px 18px;
}

/* Variable input grid */
.var-grid {
  display: grid; gap: 10px;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}
.var-label {
  font-family: var(--font-mono); font-size: 11px; color: var(--text-sec);
  margin-bottom: 4px;
}

/* Helpers */
.gap-xs { display: flex; gap: 6px; flex-wrap: wrap; }
.gap-sm { display: flex; gap: 8px; flex-wrap: wrap; }
.gap-md { display: flex; gap: 12px; flex-wrap: wrap; }
.col { display: flex; flex-direction: column; }
.row { display: flex; flex-wrap: wrap; }
.row-between { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
.center { text-align: center; }
.muted { color: var(--text-sec); }
.tert { color: var(--text-tert); }
.mono { font-family: var(--font-mono); }
.serif { font-family: var(--font-serif); font-style: italic; }
