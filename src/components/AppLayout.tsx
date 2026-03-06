import { NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, Plus, BookOpen, BarChart3, Calculator, MessageCircle, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const tabs = [
  { to: "/", icon: LayoutDashboard, label: "Home" },
  { to: "/log", icon: Plus, label: "Log" },
  { to: "/journal", icon: BookOpen, label: "Journal" },
  { to: "/performance", icon: BarChart3, label: "Stats" },
  { to: "/risk", icon: Calculator, label: "Risk" },
  { to: "/coach", icon: MessageCircle, label: "Coach" },
];

export default function AppLayout() {
  const { signOut } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </div>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border backdrop-blur-xl">
        <div className="flex items-center justify-around max-w-lg mx-auto px-2 py-1">
          {tabs.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-2 py-2 rounded-lg transition-colors text-xs ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{label}</span>
            </NavLink>
          ))}
            <button
              onClick={signOut}
              className="flex flex-col items-center gap-0.5 px-2 py-2 rounded-lg transition-colors text-xs text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Out</span>
            </button>
          </div>
        </nav>
      </div>
  );
}
