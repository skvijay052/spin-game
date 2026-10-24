"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, Bell, ChevronDown, CircleHelp, Crown, Flame, Gamepad2, History, Home, LogOut, Menu, Plus, ShieldCheck, Sparkles, Swords, Trophy, Wallet, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Player = { name: string; initials: string; color: string; score: number };
const players: Player[] = [
  { name: "You", initials: "YO", color: "violet", score: 0 },
  { name: "ShadowFox", initials: "SF", color: "orange", score: 0 },
];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<number | null>(null);
  const [turn, setTurn] = useState(0);
  const [user, setUser] = useState<{ email?: string; user_metadata?: { full_name?: string; avatar_url?: string } } | null>(null);
  const [notice, setNotice] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [recent, setRecent] = useState<{ id: number; result: string; time: string }[]>([
    { id: 1, result: "Victory", time: "2 min ago" },
    { id: 2, result: "Defeat", time: "18 min ago" },
    { id: 3, result: "Victory", time: "Yesterday" },
  ]);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    return () => listener.subscription.unsubscribe();
  }, []);

  async function signIn() {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setNotice("Google login is ready to connect. Add the Supabase environment variables and enable Google OAuth.");
      return;
    }
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin + "/auth/callback" } });
    if (error) setNotice(error.message);
  }

  async function signOut() {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) await createClient().auth.signOut();
    setUser(null);
  }

  async function spin() {
    if (spinning) return;
    setSpinning(true);
    setWinner(null);
    setNotice("");
    setTurn((v) => v + 1);
    // UI-only demonstration: no payment, wallet, or redeemable prize is involved.
    await new Promise((resolve) => setTimeout(resolve, 2200));
    const result = Math.floor(Math.random() * 2);
    setWinner(result);
    setRecent((items) => [{ id: Date.now(), result: result === 0 ? "Victory" : "Defeat", time: "Just now" }, ...items].slice(0, 4));
    setSpinning(false);
  }

  const navItems = [
    { label: "Overview", icon: Home },
    { label: "Play arena", icon: Gamepad2 },
    { label: "Match history", icon: History },
    { label: "Leaderboard", icon: Trophy },
  ];

  return (
    <main className="app-shell">
      <aside className={`sidebar ${mobileMenu ? "sidebar-open" : ""}`}>
        <a className="brand" href="#"><span className="brand-mark"><Swords size={21} strokeWidth={2.5}/></span><span>spin<span className="brand-light">duel</span><small>PLAY ARENA</small></span></a>
        <div className="side-label">MENU</div>
        <nav>{navItems.map(({label, icon: Icon}) => <button key={label} className={`nav-item ${activeTab === label ? "nav-active" : ""}`} onClick={() => {setActiveTab(label); setMobileMenu(false);}}><Icon size={18}/><span>{label}</span>{label === "Play arena" && <span className="live-dot"/>}</button>)}</nav>
        <div className="side-label side-label-spaced">YOUR ACCOUNT</div>
        <button className="nav-item" onClick={() => setNotice("Virtual points only. No deposits, transfers, or withdrawals are available in this demo.")}><Wallet size={18}/><span>Points wallet</span></button>
        <button className="nav-item" onClick={() => setNotice("Spin Duel demo uses no real-money transactions.")}><ShieldCheck size={18}/><span>Fair play & safety</span></button>
        <div className="sidebar-bottom">
          <div className="help-card"><div className="help-icon"><CircleHelp size={17}/></div><strong>Need a hand?</strong><p>Visit our help centre for game tips and answers.</p><button onClick={() => setNotice("Help centre: spin once per round. Results shown here are demo-only.")}>Get support <ArrowUpRight size={14}/></button></div>
          <div className="profile-row">{user?.user_metadata?.avatar_url ? <img className="avatar avatar-img" src={user.user_metadata.avatar_url} alt="Profile"/> : <div className="avatar avatar-user">{user?.email?.slice(0,2).toUpperCase() ?? "GU"}</div>}<div className="profile-info"><strong>{user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? "Guest Player"}</strong><span>{user ? "Signed in" : "Demo account"}</span></div><button className="icon-button profile-more" aria-label="Account options" onClick={user ? signOut : signIn}>{user ? <LogOut size={17}/> : <ChevronDown size={17}/>}</button></div>
        </div>
      </aside>

      <section className="main-area">
        <header className="topbar">
          <button className="icon-button mobile-toggle" aria-label="Open menu" onClick={() => setMobileMenu(!mobileMenu)}><Menu size={20}/></button>
          <div className="breadcrumb">Arena <span>/</span> <b>{activeTab}</b></div>
          <div className="top-actions"><div className="status-pill"><span/> Demo mode</div><button className="icon-button notification-button" aria-label="Notifications" onClick={() => setNotice("You're all caught up. No new notifications.")}><Bell size={18}/><i/></button><button className="google-button" onClick={user ? signOut : signIn}>{user ? "Sign out" : <><span className="google-g">G</span> Continue with Google</>}</button></div>
        </header>

        <div className="content">
          <div className="welcome-row"><div><div className="eyebrow"><Sparkles size={14}/> THE NEXT ROUND IS YOURS</div><h1>Ready to <span>duel?</span></h1><p className="subtitle">One spin. One opponent. Make it count.</p></div><div className="date-chip"><span className="date-sun"/><span>Season 01</span><b>·</b><span>Open arena</span></div></div>

          {notice && <div className="notice"><ShieldCheck size={17}/><span>{notice}</span><button onClick={() => setNotice("")}>×</button></div>}

          <section className="hero-card">
            <div className="hero-noise"/>
            <div className="hero-copy"><div className="hero-tag"><Flame size={13} fill="currentColor"/> LIVE ARENA <span>•</span> DEMO</div><h2>Think you have<br/>the <em>luck?</em></h2><p>Challenge the spin. Beat the odds.<br/>Claim your place on the leaderboard.</p><button className="hero-button" onClick={() => document.getElementById("spin-arena")?.scrollIntoView({behavior:"smooth"})}>Enter the arena <ArrowUpRight size={17}/></button><div className="hero-meta"><span><span className="mini-green"/> 1,284 players online</span><span className="meta-divider"/> <span><Zap size={13}/> Quick rounds</span></div></div>
            <div className="hero-art" aria-hidden="true"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="orbit orbit-three"/><div className="hero-disc"><div className="disc-inner"><Swords size={49} strokeWidth={1.4}/><span>VS</span></div><div className="disc-dot dot-a"/><div className="disc-dot dot-b"/><div className="disc-dot dot-c"/><div className="disc-dot dot-d"/></div><div className="floating-chip chip-top"><Flame size={15}/> HOT STREAK</div><div className="floating-chip chip-bottom"><Trophy size={16}/> TOP 10%</div></div>
            <div className="hero-index">01 <span>—</span> 03</div>
          </section>

          <div className="section-heading"><div><h3>Quick overview</h3><p>Your arena at a glance</p></div><button className="text-button" onClick={() => setActiveTab("Match history")}>View history <ArrowUpRight size={15}/></button></div>
          <div className="stats-grid"><StatCard icon={<Gamepad2 size={18}/>} label="Rounds played" value={String(24 + turn)} change="+3 today" tone="violet"/><StatCard icon={<Trophy size={18}/>} label="Win rate" value={winner === 0 ? "67%" : "62%"} change="Demo stats" tone="gold"/><StatCard icon={<Zap size={18}/>} label="Current streak" value={winner === 0 ? "4 wins" : "3 wins"} change="Keep it going" tone="green"/><StatCard icon={<Wallet size={18}/>} label="Virtual points" value="1,240" change="Not redeemable" tone="blue"/></div>

          <div className="play-layout" id="spin-arena">
            <section className="arena-card"><div className="card-heading"><div><div className="eyebrow">HEAD-TO-HEAD</div><h3>Spin showdown</h3></div><span className="round-badge">ROUND #{String(101 + turn).padStart(3,"0")}</span></div><p className="arena-desc">Two players. One spin. The demo picks a winner for this round.</p>
              <div className="versus-row"><PlayerCard player={players[0]} winner={winner === 0} loser={winner === 1} spinning={spinning}/><div className="versus-mark"><span>VS</span><i/></div><PlayerCard player={players[1]} winner={winner === 1} loser={winner === 0} spinning={spinning}/></div>
              <div className={`spin-stage ${spinning ? "is-spinning" : ""}`}><div className="spin-glow"/><motion.div className="spin-token" animate={spinning ? {rotate: 1080 + turn * 23, scale:[1,1.08,1]} : {rotate:0, scale:1}} transition={{duration:2.1,ease:"easeOut"}}><div className="token-ring"><Swords size={34}/><span>SPIN</span></div></motion.div><div className="spin-rays"/></div>
              <AnimatePresence mode="wait">{winner !== null && !spinning ? <motion.div key={winner} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className={`result-banner ${winner === 0 ? "result-win" : "result-loss"}`}><Crown size={17}/><div><strong>{winner === 0 ? "You won this round!" : "ShadowFox wins this round"}</strong><span>Demo result · no cash or prize awarded</span></div><span className="result-pill">{winner === 0 ? "VICTORY" : "DEFEAT"}</span></motion.div> : <div className="spin-hint">{spinning ? <><span className="loader-dot"/> The wheel is spinning…</> : "Ready when you are. Take your shot."}</div>}</AnimatePresence>
              <button className="spin-button" onClick={spin} disabled={spinning}>{spinning ? <><span className="button-loader"/> Spinning…</> : <><Zap size={18} fill="currentColor"/> {winner === null ? "SPIN TO PLAY" : "SPIN AGAIN"} <ArrowUpRight size={17}/></>}</button>
              <div className="demo-disclaimer"><ShieldCheck size={14}/> Demo only · No entry fee · No real-money rewards</div>
            </section>
            <aside className="right-column"><section className="side-card points-card"><div className="side-card-title"><span className="side-icon points-icon"><Wallet size={17}/></span><span>Points overview</span><button className="icon-button" onClick={() => setNotice("Virtual points have no cash value and cannot be withdrawn.")}><ArrowUpRight size={16}/></button></div><div className="points-value">1,240 <span>PTS</span></div><div className="points-caption">Your demo balance <span className="neutral-change">+0 today</span></div><div className="points-divider"/><div className="points-row"><span>Practice bonus</span><b>+120 pts</b></div><div className="points-row"><span>Rounds completed</span><b>24</b></div><button className="outline-button" onClick={() => setNotice("Virtual points are for demonstration only; they have no monetary value.")}>Points activity <ArrowUpRight size={15}/></button></section>
              <section className="side-card history-card"><div className="side-card-title"><span className="side-icon history-icon"><History size={17}/></span><span>Recent rounds</span><button className="text-button tiny" onClick={() => setActiveTab("Match history")}>See all</button></div><div className="recent-list">{recent.slice(0,3).map((item) => <div className="recent-item" key={item.id}><span className={`history-result ${item.result === "Victory" ? "history-win" : "history-loss"}`}>{item.result === "Victory" ? <ArrowUpRight size={15}/> : <ArrowDownRight size={15}/>}</span><div className="recent-info"><strong>{item.result}</strong><span>{item.time}</span></div><span className={`recent-outcome ${item.result === "Victory" ? "outcome-win" : "outcome-loss"}`}>{item.result === "Victory" ? "+20 pts" : "−10 pts"}</span></div>)}</div></section>
              <section className="fair-card"><span className="fair-icon"><ShieldCheck size={18}/></span><div><strong>Fair play, always.</strong><p>This prototype uses simulated results and points. Nothing can be deposited or withdrawn.</p><button onClick={() => setNotice("Fair play: this is a non-monetary prototype. Real-money play and UPI are intentionally disabled.")}>Learn about safety <ArrowUpRight size={13}/></button></div></section></aside>
          </div>
          <footer className="footer"><span>© 2026 Spin Duel</span><span>Built for the thrill. <b>Not for real-money play.</b></span><div><button onClick={() => setNotice("Privacy policy placeholder — add your policy before public launch.")}>Privacy</button><button onClick={() => setNotice("Terms placeholder — add your terms before public launch.")}>Terms</button></div></footer>
        </div>
      </section>
    </main>
  );
}

function StatCard({icon,label,value,change,tone}:{icon:React.ReactNode;label:string;value:string;change:string;tone:string}) {
  return <div className="stat-card"><div className={`stat-icon ${tone}`}>{icon}</div><span className="stat-label">{label}</span><strong className="stat-value">{value}</strong><span className="stat-change">{change}</span></div>;
}
function PlayerCard({player,winner,loser,spinning}:{player:Player;winner:boolean;loser:boolean;spinning:boolean}) {
  return <div className={`player-card ${winner ? "player-winner" : ""} ${loser ? "player-loser" : ""}`}><div className={`player-avatar ${player.color} ${spinning ? "avatar-pulse" : ""}`}>{player.initials}{winner && <span className="winner-crown"><Crown size={12} fill="currentColor"/></span>}</div><strong>{player.name}</strong><span className="player-status">{winner ? "WINNER" : loser ? "DEFEATED" : player.name === "You" ? "YOUR PROFILE" : "CHALLENGER"}</span></div>;
}
