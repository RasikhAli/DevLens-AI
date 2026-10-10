"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import { Search, Plus, ShieldCheck, Users, LogOut, ArrowRight, UserCheck } from "lucide-react";
import { Input } from "@/components/ui/input";

export function AppHeader({ title = "Dashboard" }: { title?: string }) {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; email: string; name: string | null; role: string } | null>(null);

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/me", { method: "POST" });
    setUser(null);
    router.push("/sign-in");
    router.refresh();
  };

  const handleSwitchToAdmin = async () => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "admin@devlens.ai", password: "Admin@123" }),
      });
      if (res.ok) {
        await fetchUser();
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to switch to admin:", err);
    }
  };

  const isAdmin = user?.role === "ADMIN";

  return (
    <header className="h-16 border-b border-border/80 dark:border-white/10 bg-card/60 dark:bg-zinc-950/70 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold text-foreground tracking-tight">{title}</h1>
        {isAdmin ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400">
            <ShieldCheck className="w-3 h-3" /> ADMIN
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-muted/60 border border-border text-muted-foreground">
            <Users className="w-3 h-3" /> {user?.role || "RECRUITER"}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Quick Search */}
        <div className="relative w-64 hidden md:block">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
          <Input
            placeholder="Search skills, evidence..."
            className="pl-9 h-9 text-xs bg-background/50 border-border/70 dark:border-white/10"
          />
        </div>

        {/* Action Button */}
        <Link href="/profiles/new">
          <Button size="sm" className="gap-1.5 h-9 text-xs font-semibold shimmer-button text-white shadow-sm">
            <Plus className="w-3.5 h-3.5" />
            Ingest Candidate
          </Button>
        </Link>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User indicator & Account Switcher */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-border/70 dark:border-white/10">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
              isAdmin
                ? "bg-amber-500/15 border border-amber-500/40 text-amber-500 shadow-sm"
                : "bg-violet-600/15 border border-violet-500/30 text-violet-500"
            }`}
          >
            {isAdmin ? "AD" : "RC"}
          </div>

          <div className="hidden lg:block text-left text-xs leading-tight">
            <div className="font-semibold text-foreground flex items-center gap-1.5">
              {user?.name || (isAdmin ? "Administrator" : "Lead Recruiter")}
            </div>
            <div className="text-[10px] text-muted-foreground font-mono">
              {user?.email || (isAdmin ? "admin@devlens.ai" : "demo@devlens.ai")}
            </div>
          </div>

          {!isAdmin ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSwitchToAdmin}
              className="text-[11px] h-7 px-2.5 gap-1 border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
              title="Switch to Admin Account"
            >
              <ShieldCheck className="w-3 h-3" /> Switch to Admin
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="h-8 w-8 text-muted-foreground hover:text-rose-500"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
