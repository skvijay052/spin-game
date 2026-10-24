"use client";
import { useEffect, useState } from "react";
import { ArrowLeft, ShieldCheck, Users, Gamepad2, Activity, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function AdminPage() {
  const [status, setStatus] = useState("Checking admin access…");
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) { setStatus("Supabase is not configured yet. Admin data is unavailable."); return; }
    createClient().auth.getUser().then(({ data, error }) => {
      if (error || !data.user) setStatus("Sign in with your approved administrator Google account first.");
      else setStatus("Signed in as " + (data.user.email ?? "user") + ". Database admin role must be granted by an owner.");
    });
  }, []);
  return <main className="admin-page"><Link href="/" className="back-link"><ArrowLeft size={16}/> Back to arena</Link><div className="admin-heading"><div className="admin-shield"><ShieldCheck size={28}/></div><div><span className="eyebrow">RESTRICTED AREA</span><h1>Admin console</h1><p>Monitor demo matches and platform health.</p></div></div><div className="admin-warning"><LockKeyhole size={18}/><div><strong>Access-controlled dashboard</strong><p>{status}</p><p>Do not grant admin privileges from client-side UI. Assign roles only through a trusted database migration or owner-controlled SQL.</p></div></div><div className="admin-stats"><div><Users/><span>Registered users</span><strong>—</strong><small>Connect Supabase to load</small></div><div><Gamepad2/><span>Demo matches</span><strong>—</strong><small>Connect Supabase to load</small></div><div><Activity/><span>Platform status</span><strong>Demo</strong><small>Payments disabled</small></div></div></main>;
}
