import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { LayoutDashboard, BookOpen, BarChart3, MessageCircle, Cog, Plus } from "lucide-react";
import navbarLogo from "@/assets/images/navbar-logo.png";

const tabs = [
  { to: "/dashboard",   icon: LayoutDashboard, label: "Home"    },
  { to: "/journal",     icon: BookOpen,         label: "Journal" },
  { to: "/performance", icon: BarChart3,         label: "Stats"   },
  { to: "/coach",       icon: MessageCircle,     label: "Coach"   },
];

const HIDE_NAV = ["/log", "/reset-password"];

export default function AppLayout() {
  const location = useLocation();
  const hideNav = HIDE_NAV.some(p => location.pathname.startsWith(p));

  return (
    <div className="flex flex-col min-h-screen ambient-bg">

      {/* ── TOP HEADER ── */}
      <header
        className="sticky top-0 z-40"
        style={{
          background: "linear-gradient(180deg, hsl(222,28%,8%) 0%, hsl(222,28%,7%,0.95) 100%)",
          borderBottom: "1px solid hsl(222,18%,14%)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 1px 0 hsl(215,30%,30%,0.08), 0 8px 32px hsl(222,40%,4%,0.4)",
        }}
      >
        <div className="flex items-center justify-between max-w-lg mx-auto px-4 h-14">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center min-w-fit shrink-0 py-1 pr-2">
            <span className="nav-brand-logo-frame">
              <img src={navbarLogo} alt="TradinStar logo" className="nav-brand-logo object-contain" />
            </span>
          </Link>

          {/* Right actions */}
          <div className="flex items-center gap-1">
            <NavLink
              to="/risk"
              className={({ isActive }) =>
                `w-9 h-9 rounded-xl flex items-center justify-center transition-all text-xs font-bold ${
                  isActive ? "text-white" : "text-slate-500 hover:text-blue-400"
                }`
              }
              style={({ isActive }) => isActive ? {
                background: "linear-gradient(135deg, hsl(217,92%,60%), hsl(222,70%,45%))",
                boxShadow: "0 4px 12px hsl(217,92%,60%,0.4)",
              } : {
                background: "hsl(222,20%,13%)",
                border: "1px solid hsl(222,18%,18%)",
              }}
              title="Risk Calculator"
            >
              <span className="text-[11px] font-bold">R%</span>
            </NavLink>

            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                  isActive ? "text-white" : "text-slate-500 hover:text-blue-400"
                }`
              }
              style={({ isActive }) => isActive ? {
                background: "linear-gradient(135deg, hsl(217,92%,60%), hsl(222,70%,45%))",
                boxShadow: "0 4px 12px hsl(217,92%,60%,0.4)",
              } : {
                background: "hsl(222,20%,13%)",
                border: "1px solid hsl(222,18%,18%)",
              }}
              title="Settings"
            >
              <Cog className="w-4 h-4" />
            </NavLink>
          </div>
        </div>
      </header>

      {/* ── PAGE CONTENT ── */}
      <div className="flex-1 overflow-y-auto" style={{ paddingBottom: hideNav ? "0" : "88px" }}>
        <Outlet />
      </div>

      {/* ── VYBE STACK CREDIT ── */}
      {!hideNav && (
        <div
          className="text-center pb-1 pt-0.5"
          style={{ position: "fixed", bottom: "68px", left: 0, right: 0, zIndex: 49, pointerEvents: "none" }}
        >
          <span className="text-[9px] tracking-widest font-semibold" style={{ color: "hsl(215,15%,30%)" }}>
            BUILT BY VYBE STACK
          </span>
        </div>
      )}

      {/* ── BOTTOM NAV ── */}
      {!hideNav && (
        <nav
          className="fixed bottom-0 left-0 right-0 z-50"
          style={{
            background: "linear-gradient(180deg, hsl(222,28%,7%,0.9) 0%, hsl(222,30%,6%) 100%)",
            borderTop: "1px solid hsl(222,18%,14%)",
            backdropFilter: "blur(24px)",
            boxShadow: "0 -8px 40px hsl(222,40%,4%,0.6), 0 -1px 0 hsl(215,30%,30%,0.06)",
          }}
        >
          <div className="flex items-center justify-around max-w-lg mx-auto px-2" style={{ height: "68px" }}>
            {/* First 2 tabs */}
            {tabs.slice(0, 2).map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/dashboard"}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-0.5 w-14 h-12 rounded-2xl transition-all ${
                    isActive ? "text-white" : "text-slate-500 hover:text-slate-300"
                  }`
                }
                style={({ isActive }) => isActive ? {
                  background: "linear-gradient(135deg, hsl(217,92%,60%,0.9), hsl(222,70%,45%))",
                  boxShadow: "0 4px 16px hsl(217,92%,60%,0.5), 0 0 24px hsl(217,92%,60%,0.2)",
                } : {}}
              >
                <Icon className="w-[18px] h-[18px]" />
                <span className="text-[10px] font-semibold">{label}</span>
              </NavLink>
            ))}

            {/* ── CENTER FAB ── */}
            <NavLink
              to="/log"
              className="flex flex-col items-center justify-center w-14 h-14 rounded-2xl text-white transition-all active:scale-95 -mt-5"
              style={{
                background: "linear-gradient(135deg, hsl(217,92%,60%), hsl(222,80%,40%))",
                boxShadow: "0 6px 24px hsl(217,92%,60%,0.55), 0 0 40px hsl(217,92%,60%,0.2)",
                border: "1px solid hsl(217,92%,70%,0.3)",
              }}
            >
              <Plus className="w-6 h-6" strokeWidth={2.5} />
              <span className="text-[9px] font-bold mt-0.5">LOG</span>
            </NavLink>

            {/* Last 2 tabs */}
            {tabs.slice(2).map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-0.5 w-14 h-12 rounded-2xl transition-all ${
                    isActive ? "text-white" : "text-slate-500 hover:text-slate-300"
                  }`
                }
                style={({ isActive }) => isActive ? {
                  background: "linear-gradient(135deg, hsl(217,92%,60%,0.9), hsl(222,70%,45%))",
                  boxShadow: "0 4px 16px hsl(217,92%,60%,0.5), 0 0 24px hsl(217,92%,60%,0.2)",
                } : {}}
              >
                <Icon className="w-[18px] h-[18px]" />
                <span className="text-[10px] font-semibold">{label}</span>
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}
