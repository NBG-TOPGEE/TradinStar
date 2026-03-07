import { NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, Plus, BookOpen, BarChart3, Calculator, MessageCircle, LogOut, Cog } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const tabs = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/log", icon: Plus, label: "Log" },
  { to: "/journal", icon: BookOpen, label: "Journal" },
  { to: "/performance", icon: BarChart3, label: "Stats" },
  { to: "/risk", icon: Calculator, label: "Risk" },
  { to: "/coach", icon: MessageCircle, label: "Coach" },
  { to: "/settings", icon: Cog, label: "Settings" },
];

export default function AppLayout() {
  const { signOut } = useAuth();

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "hsl(220,20%,97%)" }}>
      <div className="flex-1 overflow-y-auto pb-24">
        <Outlet />
      </div>

      {/* Premium bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50" style={{
        background: "white",
        borderTop: "1px solid hsl(220,14%,90%)",
        boxShadow: "0 -4px 24px hsl(222,40%,14%,0.06)"
      }}>
        <div className="flex items-center justify-around max-w-lg mx-auto px-1 py-2">
          {tabs.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/dashboard"}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all text-xs font-medium ${
                  isActive
                    ? "text-white"
                    : "text-slate-400 hover:text-slate-600"
                }`
              }
              style={({ isActive }) => isActive ? {
                background: "hsl(222,60%,20%)",
                padding: "6px 10px",
              } : {}}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[10px] font-semibold">{label}</span>
            </NavLink>
          ))}
          <button
            onClick={signOut}
            className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all text-xs font-medium text-slate-400 hover:text-red-400"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-[10px] font-semibold">Out</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
