"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Code2, ArrowRight, AlertCircle, RefreshCw, ShieldCheck, Users, Lock, Sparkles } from "lucide-react";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@devlens.ai");
  const [password, setPassword] = useState("Admin@123");
  const [selectedRole, setSelectedRole] = useState<"ADMIN" | "RECRUITER">("ADMIN");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelectRole = (role: "ADMIN" | "RECRUITER") => {
    setSelectedRole(role);
    if (role === "ADMIN") {
      setEmail("admin@devlens.ai");
      setPassword("Admin@123");
    } else {
      setEmail("demo@devlens.ai");
      setPassword("Demo@123");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Authentication failed");

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-6 bg-dot-pattern">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-violet-600/10 border border-violet-500/30 flex items-center justify-center text-violet-500 mx-auto shadow-sm">
            <Code2 className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">
            DevLens <span className="text-violet-600 dark:text-violet-400 font-mono text-lg">AI</span>
          </h1>
          <p className="text-xs text-muted-foreground">Sign in to your candidate intelligence workspace</p>
        </div>

        <Card className="border-border/80 dark:border-white/10 bg-card/90 dark:bg-zinc-950/90 shadow-xl backdrop-blur-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Select Account Role</CardTitle>
            <CardDescription className="text-xs">
              Choose an administrative or standard evaluation profile.
            </CardDescription>

            {/* Role Select Quick Tabs */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleSelectRole("ADMIN")}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  selectedRole === "ADMIN"
                    ? "border-amber-500/50 bg-amber-500/10 ring-1 ring-amber-500/30"
                    : "border-border/70 hover:border-border dark:border-white/10 dark:hover:border-white/20"
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                  Admin
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  Full Add & Delete Control
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectRole("RECRUITER")}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  selectedRole === "RECRUITER"
                    ? "border-violet-500/50 bg-violet-500/10 ring-1 ring-violet-500/30"
                    : "border-border/70 hover:border-border dark:border-white/10 dark:hover:border-white/20"
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                  <Users className="w-3.5 h-3.5 text-violet-500" />
                  Recruiter
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  Standard Evaluation
                </div>
              </button>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Email Address</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="text-xs font-mono"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full text-xs h-10 gap-2 font-semibold shimmer-button text-white shadow-md"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
                Sign In as {selectedRole === "ADMIN" ? "Administrator" : "Recruiter"}
                <ArrowRight className="w-4 h-4 ml-auto" />
              </Button>
            </form>
          </CardContent>

          <CardFooter className="pt-2 border-t border-border/60 justify-center text-xs text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/sign-up" className="text-primary font-semibold hover:underline ml-1">
              Create Account
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
