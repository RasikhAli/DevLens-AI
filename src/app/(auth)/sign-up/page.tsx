"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Code2, ArrowRight, AlertCircle, CheckCircle2, RefreshCw, UserCheck, Shield } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"RECRUITER" | "ADMIN" | "VIEWER">("RECRUITER");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password, role }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");

      setSuccess("Account registered successfully! Redirecting to platform...");
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 1000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-6 bg-dot-pattern relative">
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-violet-600/10 border border-violet-500/30 flex items-center justify-center text-violet-500 mx-auto shadow-sm">
            <Code2 className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">
            DevLens <span className="text-violet-600 dark:text-violet-400 font-mono text-lg">AI</span>
          </h1>
          <p className="text-xs text-muted-foreground">Create your candidate evaluation account</p>
        </div>

        <Card className="border-border/80 dark:border-white/10 bg-card/90 dark:bg-zinc-950/90 shadow-xl backdrop-blur-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Sign Up</CardTitle>
            <CardDescription className="text-xs">
              Begin evaluating candidates, comparing code evidence, and matching talent.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Full Name</label>
                <Input
                  type="text"
                  placeholder="e.g. Alex Morgan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="text-xs font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Work Email</label>
                <Input
                  type="email"
                  placeholder="alex@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Password (min 8 characters)</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Account Role</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["RECRUITER", "ADMIN", "VIEWER"] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`text-[11px] font-semibold py-2 px-2.5 rounded-lg border transition-all text-center ${
                        role === r
                          ? "border-violet-500 bg-violet-500/15 text-violet-600 dark:text-violet-400 shadow-sm"
                          : "border-border/60 hover:border-border bg-muted/40 text-muted-foreground"
                      }`}
                    >
                      {r === "ADMIN" ? "Admin" : r === "RECRUITER" ? "Recruiter" : "Viewer"}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full text-xs h-10 gap-2 font-semibold shimmer-button text-white shadow-md"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
                Create Account & Access Platform
                <ArrowRight className="w-4 h-4 ml-auto" />
              </Button>
            </form>
          </CardContent>
          <CardFooter className="pt-2 border-t border-border/60 justify-center text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-violet-600 dark:text-violet-400 font-semibold hover:underline ml-1">
              Sign In with existing credentials
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

