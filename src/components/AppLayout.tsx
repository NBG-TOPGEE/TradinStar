import { NavLink, Outlet, useLocation } from "react-router-dom";
import { LayoutDashboard, BookOpen, BarChart3, MessageCircle, Cog, Plus, TrendingUp } from "lucide-react";

const tabs = [
  { to: "/dashboard",   icon: LayoutDashboard, label: "Home"    },
  { to: "/journal",     icon: BookOpen,         label: "Journal" },
  { to: "/performance", icon: BarChart3,         label: "Stats"   },
  { to: "/coach",       icon: MessageCircle,     label: "Coach"   },
];

// Pages that should hide the nav (full-screen flows)
const HIDE_NAV = ["/log", "/reset-password"];

export default function AppLayout() {
  const location = useLocation();
  const hideNav = HIDE_NAV.some(p => location.pathname.startsWith(p));

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "hsl(220,20%,97%)" }}>

      {/* ── TOP HEADER ── */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100"
        style={{ boxShadow: "0 1px 8px hsl(222,40%,14%,0.05)" }}>
        <div className="flex items-center justify-between max-w-lg mx-auto px-4 h-14">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "hsl(222,60%,20%)" }}>
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-800 tracking-tight">TradinStar</span>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1">
            {/* Risk Calculator shortcut */}
            <NavLink to="/risk"
              className={({ isActive }) =>
                `w-9 h-9 rounded-xl flex items-center justify-center transition-all text-xs font-semibold ${
                  isActive
                    ? "text-white"
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                }`
              }
              style={({ isActive }) => isActive ? { background: "hsl(222,60%,20%)" } : {}}
              title="Risk Calculator"
            >
              <span className="text-[11px] font-bold">R%</span>
            </NavLink>

            {/* Settings */}
            <NavLink to="/settings"
              className={({ isActive }) =>
                `w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                  isActive
                    ? "text-white"
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                }`
              }
              style={({ isActive }) => isActive ? { background: "hsl(222,60%,20%)" } : {}}
              title="Settings"
            >
              <Cog className="w-4 h-4" />
            </NavLink>
          </div>
        </div>
      </header>

      {/* ── PAGE CONTENT ── */}
      <div className="flex-1 overflow-y-auto" style={{ paddingBottom: hideNav ? "0" : "80px" }}>
        <Outlet />
      </div>

      {/* ── BOTTOM NAV ── */}
      {!hideNav && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-100"
          style={{ boxShadow: "0 -4px 24px hsl(222,40%,14%,0.06)" }}>
          <div className="flex items-center justify-around max-w-lg mx-auto px-2"
            style={{ height: "64px" }}>

            {/* First 2 tabs */}
            {tabs.slice(0, 2).map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/dashboard"}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-0.5 w-14 h-12 rounded-2xl transition-all ${
                    isActive
                      ? "text-white"
                      : "text-slate-400 hover:text-slate-600"
                  }`
                }
                style={({ isActive }) => isActive ? {
                  background: "hsl(222,60%,20%)",
                  boxShadow: "0 2px 10px hsl(222,60%,20%,0.3)",
                } : {}}
              >
                <Icon className="w-[18px] h-[18px]" />
                <span className="text-[10px] font-semibold">{label}</span>
              </NavLink>
            ))}

            {/* ── CENTER FAB — Log Trade ── */}
            <NavLink to="/log"
              className="flex flex-col items-center justify-center w-14 h-14 rounded-2xl text-white transition-all active:scale-95 -mt-5 shadow-lg"
              style={{
                background: "linear-gradient(135deg, hsl(217,90%,56%), hsl(222,60%,35%))",
                boxShadow: "0 4px 16px hsl(217,90%,56%,0.4)",
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
                    isActive
                      ? "text-white"
                      : "text-slate-400 hover:text-slate-600"
                  }`
                }
                style={({ isActive }) => isActive ? {
                  background: "hsl(222,60%,20%)",
                  boxShadow: "0 2px 10px hsl(222,60%,20%,0.3)",
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
