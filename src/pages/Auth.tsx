import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import navbarLogo from "@/assets/images/navbar-logo.png";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgot, setIsForgot] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
    } else {
      navigate("/dashboard");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: {
        data: { display_name: displayName },
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });
    setLoading(false);
    if (error) {
      toast({ title: "Signup failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Check your email", description: "We sent you a confirmation link to verify your account." });
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Check your email", description: "We sent you a password reset link." });
      setIsForgot(false);
    }
  };

  const CARD_STYLE = {
    background: "linear-gradient(160deg, hsl(222,24%,10%) 0%, hsl(222,22%,9%) 100%)",
    border: "1px solid hsl(222,18%,16%)",
    borderRadius: "1.5rem",
    boxShadow: "0 24px 80px hsl(222,40%,4%,0.8), 0 0 0 1px hsl(215,30%,30%,0.06), inset 0 1px 0 hsl(215,30%,30%,0.1)",
  };

  const INPUT_STYLE = {
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

  if (isForgot) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 ambient-bg">
        <div className="w-full max-w-sm" style={CARD_STYLE}>
          <div className="p-8">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold mb-1" style={{ color: "hsl(210,30%,92%)" }}>Reset Password</h2>
              <p className="text-sm" style={{ color: "hsl(215,15%,40%)" }}>Enter your email to receive a reset link</p>
            </div>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4" style={{ color: "hsl(215,15%,38%)" }} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  style={INPUT_STYLE}
                  onFocus={e => {
                    e.currentTarget.style.borderColor = "hsl(217,92%,60%,0.6)";
                    e.currentTarget.style.boxShadow = "0 0 0 3px hsl(217,92%,60%,0.08)";
                  }}
                  onBlur={e => {
                    e.currentTarget.style.borderColor = "hsl(222,18%,18%)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all active:scale-[0.98] disabled:opacity-60"
                style={{
                  background: "linear-gradient(135deg, hsl(217,92%,60%), hsl(222,70%,40%))",
                  boxShadow: "0 4px 16px hsl(217,92%,60%,0.35)",
                }}
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
              <button
                type="button"
                onClick={() => setIsForgot(false)}
                className="w-full text-sm transition-all hover:opacity-80"
                style={{ color: "hsl(215,15%,40%)" }}
              >
                ← Back to login
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 ambient-bg">
      <div className="flex flex-col items-center w-full max-w-sm">
        <div className="w-full" style={CARD_STYLE}>
          <div className="p-8">
            {/* Logo */}
            <div className="flex flex-col items-center mb-7">
              <div className="nav-brand-logo-frame mb-1">
                <img src={navbarLogo} alt="TradinStar logo" className="nav-brand-logo object-contain" />
              </div>
              <p className="text-sm mt-2" style={{ color: "hsl(215,15%,40%)" }}>
                {isLogin ? "Welcome back, trader" : "Create your trading journal"}
              </p>
            </div>

            <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-4">
              {!isLogin && (
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4" style={{ color: "hsl(215,15%,38%)" }} />
                  <input
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    placeholder="Display name"
                    required
                    style={INPUT_STYLE}
                    onFocus={e => { e.currentTarget.style.borderColor = "hsl(217,92%,60%,0.6)"; e.currentTarget.style.boxShadow = "0 0 0 3px hsl(217,92%,60%,0.08)"; }}
                    onBlur={e => { e.currentTarget.style.borderColor = "hsl(222,18%,18%)"; e.currentTarget.style.boxShadow = "none"; }}
                  />
                </div>
              )}

              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4" style={{ color: "hsl(215,15%,38%)" }} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  style={INPUT_STYLE}
                  onFocus={e => { e.currentTarget.style.borderColor = "hsl(217,92%,60%,0.6)"; e.currentTarget.style.boxShadow = "0 0 0 3px hsl(217,92%,60%,0.08)"; }}
                  onBlur={e => { e.currentTarget.style.borderColor = "hsl(222,18%,18%)"; e.currentTarget.style.boxShadow = "none"; }}
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4" style={{ color: "hsl(215,15%,38%)" }} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  minLength={6}
                  style={{ ...INPUT_STYLE, paddingRight: "2.75rem" }}
                  onFocus={e => { e.currentTarget.style.borderColor = "hsl(217,92%,60%,0.6)"; e.currentTarget.style.boxShadow = "0 0 0 3px hsl(217,92%,60%,0.08)"; }}
                  onBlur={e => { e.currentTarget.style.borderColor = "hsl(222,18%,18%)"; e.currentTarget.style.boxShadow = "none"; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 transition-all hover:opacity-80"
                  style={{ color: "hsl(215,15%,38%)" }}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {isLogin && (
                <button
                  type="button"
                  onClick={() => setIsForgot(true)}
                  className="text-xs transition-all hover:opacity-80"
                  style={{ color: "hsl(217,92%,60%)" }}
                >
                  Forgot password?
                </button>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
                style={{
                  background: "linear-gradient(135deg, hsl(217,92%,60%), hsl(222,70%,40%))",
                  boxShadow: "0 4px 20px hsl(217,92%,60%,0.4)",
                }}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Please wait...
                  </>
                ) : isLogin ? "Sign In" : "Create Account"}
              </button>
            </form>

            <div className="mt-5 text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm transition-all hover:opacity-80"
                style={{ color: "hsl(215,15%,40%)" }}
              >
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <span style={{ color: "hsl(217,92%,65%)" }}>
                  {isLogin ? "Sign up" : "Sign in"}
                </span>
              </button>
            </div>
          </div>
        </div>

        <p className="mt-5 text-center text-xs tracking-widest" style={{ color: "hsl(215,15%,25%)" }}>
          BUILT BY <span className="font-bold" style={{ color: "hsl(215,15%,30%)" }}>VYBE STACK</span>
        </p>
      </div>
    </div>
  );
}
