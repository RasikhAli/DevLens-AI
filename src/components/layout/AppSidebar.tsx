"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  GitCompare,
  Briefcase,
  FileBarChart2,
  Settings,
  ShieldCheck,
  ChevronRight,
  Code2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Developer Profiles", href: "/profiles", icon: Users },
  { name: "Compare Developers", href: "/compare", icon: GitCompare },
  { name: "Jobs & Matching", href: "/jobs", icon: Briefcase },
  { name: "Reports & Exports", href: "/reports", icon: FileBarChart2 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-border bg-card/60 backdrop-blur-xl flex flex-col h-screen sticky top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-border gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm">
          <Code2 className="w-5 h-5" />
        </div>
        <div>
          <div className="font-bold text-base tracking-tight flex items-center gap-1.5 text-foreground">
            DevLens <span className="text-primary font-mono text-xs px-1.5 py-0.5 rounded bg-primary/10">AI</span>
          </div>
          <p className="text-[10px] text-muted-foreground tracking-wider uppercase font-medium">Evidence-Based Match</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 mb-2 text-[11px] font-semibold tracking-wider uppercase text-muted-foreground">
          Platform
        </div>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all group",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className={cn("w-4 h-4 transition-transform group-hover:scale-110", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                <span>{item.name}</span>
              </div>
              {isActive && <ChevronRight className="w-4 h-4 opacity-75" />}
            </Link>
          );
        })}
      </nav>

      {/* Integrity Badge in Footer */}
      <div className="p-4 border-t border-border bg-card/40">
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <div className="leading-tight">
            <span className="font-semibold block">Deterministic Engine</span>
            <span className="text-[10px] text-muted-foreground">Traceable, verifiable evidence</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
