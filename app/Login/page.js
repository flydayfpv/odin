"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";

export default function OdinLogin() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(true);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      if (data.token) {
        if (remember) {
          localStorage.setItem("odin_token", data.token);
        } else {
          sessionStorage.setItem("odin_token", data.token);
        }
      }

      // → แทนที่จะไป dashboard โดยตรง ให้ไปหน้า roleCheck ก่อน
      router.replace("/odin/roleCheckPage");
    } catch (err) {
      setError(err.message || "Unable to login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="w-full max-w-lg">
        <div className="rounded-2xl overflow-hidden shadow-2xl border border-slate-700 bg-gradient-to-b from-slate-900/60 to-slate-800/60">
          <div className="p-8 md:p-10 flex gap-6">
            <div className="w-28 h-28 rounded-xl bg-gradient-to-tr from-indigo-700 to-cyan-500 flex items-center justify-center shadow-inner">
              <div className="text-white flex flex-col items-center">
                <ShieldCheck size={36} />
                <span className="text-xs mt-1">ODIN</span>
              </div>
            </div>

            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-white">Sign in to ODIN</h2>
              <p className="text-sm text-slate-300 mt-1">
                Secure access — enterprise single-pane control 11
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                {error && (
                  <div className="text-sm text-red-300 bg-red-900/30 border border-red-800 p-3 rounded">
                    {error}
                  </div>
                )}

                <label className="block">
                  <span className="text-sm text-slate-300">Work email</span>
                  <div className="mt-2 relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full pl-11 pr-3 py-2 rounded-lg bg-slate-900/50 border border-slate-700 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      autoComplete="email"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <Mail size={18} />
                    </span>
                  </div>
                </label>

                <label className="block">
                  <span className="text-sm text-slate-300">Password</span>
                  <div className="mt-2 relative">
                    <input
                      type={showPass ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-11 py-2 rounded-lg bg-slate-900/50 border border-slate-700 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      autoComplete="current-password"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <Lock size={18} />
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowPass((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-white"
                      aria-label="Toggle password visibility"
                    >
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </label>

                <div className="grid grid-cols-1 gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-medium shadow-md hover:opacity-95 disabled:opacity-50"
                  >
                    {loading ? "Signing in…" : "Sign in to ODIN"}
                  </button>
                </div>

                <div className="pt-2 text-xs text-slate-400">
                  By signing in you agree to ODIN’s terms of service.
                </div>
              </form>
            </div>
          </div>

          <div className="border-t border-slate-700/60 p-4 text-xs text-slate-400 text-center">
            © {new Date().getFullYear()} ODIN — Secure operations platform
          </div>
        </div>
      </div>
    </div>
  );
}
