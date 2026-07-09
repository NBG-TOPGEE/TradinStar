import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight } from "lucide-react";
import navbarLogo from "@/assets/images/navbar-logo.png";

// ── Shared styles ─────────────────────────────────────────────────────────
const CARD: React.CSSProperties = {
  background: "linear-gradient(160deg, hsl(222,24%,10%) 0%, hsl(222,22%,9%) 100%)",
  border: "1px solid hsl(222,18%,16%)",
  borderRadius: "1.5rem",
  boxShadow: "0 24px 80px hsl(222,40%,4%,0.8), inset 0 1px 0 hsl(215,30%,30%,0.1)",
};

const INPUT: React.CSSProperties = {
  background: "hsl(222,22%,11%)",
  border: "1px solid hsl(222,18%,18%)",
  borderRadius: "0.875rem",
  color: "hsl(210,30%,88%)",
  fontSize: "0.875rem",
  padding: "0.75rem 1rem 0.75rem 2.75rem",
  outline: "none",
  width: "100%",
  transition: "border-color 0.2s, box-shadow 0.2s",
};

const DIVIDER = () => (
  <div className="flex items-center gap-3 my-5">
    <div className="flex-1 h-px" style={{ background: "hsl(222,18%,16%)" }} />
    <span className="text-xs font-medium" style={{ color: "hsl(215,15%,30%)" }}>or</span>
    <div className="flex-1 h-px" style={{ background: "hsl(222,18%,16%)" }} />
  </div>
);

function InputFocus(el: EventTarget & HTMLInputElement, focus: boolean) {
  el.style.borderColor = focus ? "hsl(217,92%,60%,0.6)" : "hsl(222,18%,18%)";
  el.style.boxShadow = focus ? "0 0 0 3px hsl(217,92%,60%,0.08)" : "none";
}

// ── Google icon ───────────────────────────────────────────────────────────
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

// ── Shared input element (module-level — must NOT be redefined per render) ──
function Inp({
  type = "text", icon: Icon, value, onChange, placeholder, required = true, minLength, right
}: {
  type?: string; icon: any; value: string; onChange: (v: string) => void;
  placeholder: string; required?: boolean; minLength?: number; right?: React.ReactNode;
}) {
  return (
    <div className="relative">
      <Icon className="absolute left-3 top-3.5 h-4 w-4" style={{ color: "hsl(215,15%,38%)" }} />
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} required={required} minLength={minLength}
        style={{ ...INPUT, paddingRight: right ? "2.75rem" : "1rem" }}
        onFocus={e => InputFocus(e.currentTarget, true)}
        onBlur={e => InputFocus(e.currentTarget, false)}
      />
      {right && <div className="absolute right-3 top-3.5">{right}</div>}
    </div>
  );
}

function PrimaryBtn({ children, disabled }: { children: React.ReactNode; disabled?: boolean }) {
  return (
    <button type="submit" disabled={disabled}
      className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
      style={{ background: "linear-gradient(135deg, hsl(217,92%,60%), hsl(222,70%,40%))", boxShadow: "0 4px 20px hsl(217,92%,60%,0.4)" }}>
      {children}
    </button>
  );
}

export default function Auth() {
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]       = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // ── OAuth ──────────────────────────────────────────────────────────────
  const handleOAuth = async (provider: "google") => {
    setOauthLoading(provider);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/onboarding` },
    });
    if (error) {
      toast({ title: `${provider} sign-in failed`, description: error.message, variant: "destructive" });
      setOauthLoading(null);
    }
    // On success, Supabase redirects — no need to setOauthLoading(null)
  };

  // ── Email login ────────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) toast({ title: "Login failed", description: error.message, variant: "destructive" });
    else navigate("/dashboard");
  };

  // ── Signup ─────────────────────────────────────────────────────────────
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: {
        data: { display_name: displayName },
        emailRedirectTo: `${window.location.origin}/onboarding`,
      },
    });
    setLoading(false);
    if (error) toast({ title: "Signup failed", description: error.message, variant: "destructive" });
    else toast({ title: "Check your email", description: "We sent you a confirmation link." });
  };

  // ── Forgot password ────────────────────────────────────────────────────
  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Check your email", description: "Reset link sent." }); setMode("login"); }
  };

  // (Inp and PrimaryBtn are defined outside the component — see below)

  if (mode === "forgot") return (
    <div className="min-h-screen flex items-center justify-center px-4 ambient-bg">
      <div className="w-full max-w-sm" style={CARD}>
        <div className="p-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold mb-1" style={{ color: "hsl(210,30%,92%)" }}>Reset Password</h2>
            <p className="text-sm" style={{ color: "hsl(215,15%,40%)" }}>Enter your email for a reset link</p>
          </div>
          <form onSubmit={handleForgot} className="space-y-4">
            <Inp icon={Mail} value={email} onChange={setEmail} placeholder="your@email.com" type="email" />
            <PrimaryBtn disabled={loading}>{loading ? "Sending…" : "Send Reset Link"}</PrimaryBtn>
            <button type="button" onClick={() => setMode("login")}
              className="w-full text-sm transition-all hover:opacity-80" style={{ color: "hsl(215,15%,40%)" }}>
              ← Back to login
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-4 ambient-bg">
      <div className="flex flex-col items-center w-full max-w-sm">
        <div className="w-full" style={CARD}>
          <div className="p-8">

            {/* Logo + subtitle */}
            <div className="flex flex-col items-center mb-7">
              <div className="nav-brand-logo-frame mb-1">
                <img src={navbarLogo} alt="TradinStar" className="nav-brand-logo object-contain" />
              </div>
              <p className="text-sm mt-2" style={{ color: "hsl(215,15%,40%)" }}>
                {mode === "login" ? "Welcome back, trader" : "Start your trading journey"}
              </p>
            </div>

            {/* ── OAUTH BUTTONS ── */}
            <div className="space-y-2.5 mb-1">
              <button
                onClick={() => handleOAuth("google")}
                disabled={!!oauthLoading}
                className="w-full flex items-center justify-center gap-3 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
                style={{
                  background: "hsl(222,22%,13%)",
                  border: "1px solid hsl(222,18%,20%)",
                  color: "hsl(210,25%,78%)"
                }}>
                {oauthLoading === "google"
                  ? <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: "hsl(222,18%,30%)", borderTopColor: "hsl(210,25%,70%)" }} />
                  : <GoogleIcon />}
                Continue with Google
              </button>

            </div>

            <DIVIDER />

            {/* ── EMAIL FORM ── */}
            <form onSubmit={mode === "login" ? handleLogin : handleSignup} className="space-y-3">
              {mode === "signup" && (
                <Inp icon={User} value={displayName} onChange={setDisplayName} placeholder="Display name" />
              )}

              <Inp icon={Mail} value={email} onChange={setEmail} placeholder="your@email.com" type="email" />

              <Inp
                icon={Lock} value={password} onChange={setPassword}
                placeholder="Password" type={showPassword ? "text" : "password"} minLength={6}
                right={
                  <button type="button" onClick={() => setShowPassword(s => !s)}
                    className="transition-all hover:opacity-80" style={{ color: "hsl(215,15%,38%)" }}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
              />

              {mode === "login" && (
                <div className="flex justify-end">
                  <button type="button" onClick={() => setMode("forgot")}
                    className="text-xs transition-all hover:opacity-80" style={{ color: "hsl(217,92%,60%)" }}>
                    Forgot password?
                  </button>
                </div>
              )}

              <PrimaryBtn disabled={loading}>
                {loading
                  ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Please wait…</>
                  : mode === "login"
                    ? <><ArrowRight className="w-4 h-4" /> Sign In</>
                    : <><ArrowRight className="w-4 h-4" /> Create Account</>
                }
              </PrimaryBtn>
            </form>

            {/* Toggle */}
            <div className="mt-5 text-center">
              <button type="button" onClick={() => setMode(mode === "login" ? "signup" : "login")}
                className="text-sm transition-all hover:opacity-80" style={{ color: "hsl(215,15%,40%)" }}>
                {mode === "login" ? "Don't have an account? " : "Already have an account? "}
                <span style={{ color: "hsl(217,92%,65%)" }}>
                  {mode === "login" ? "Sign up" : "Sign in"}
                </span>
              </button>
            </div>

          </div>
        </div>

        {/* Footer branding */}
        <p className="mt-5 text-center text-xs tracking-widest" style={{ color: "hsl(215,15%,22%)" }}>
          BUILT BY <span className="font-bold" style={{ color: "hsl(215,15%,28%)" }}>VERTODEA</span>
        </p>
      </div>
    </div>
  );
}
