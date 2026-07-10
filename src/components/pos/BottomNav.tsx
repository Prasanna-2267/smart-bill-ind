import { Link, useRouterState } from "@tanstack/react-router";
import { Receipt, ClipboardList, LineChart, UtensilsCrossed, Settings } from "lucide-react";

const TABS = [
  { to: "/", label: "Billing", icon: Receipt },
  { to: "/orders", label: "Orders", icon: ClipboardList },
  { to: "/trends", label: "Trends", icon: LineChart },
  { to: "/menu", label: "Menu", icon: UtensilsCrossed },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  
  if (pathname === "/login") return null;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80">
      <div className="mx-auto flex h-[68px] max-w-[720px] items-center justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {TABS.map(({ to, label, icon: Icon }) => {
          const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className="group flex min-w-[56px] flex-col items-center gap-1 rounded-lg px-2 py-1.5"
            >
              <Icon
                className={`size-[22px] transition-colors ${
                  active ? "text-brand" : "text-zinc-400 group-hover:text-zinc-600"
                }`}
                strokeWidth={active ? 2.4 : 2}
              />
              <span
                className={`text-[10px] font-medium tracking-tight ${
                  active ? "text-brand" : "text-zinc-500"
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
