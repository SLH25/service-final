import {
  LayoutDashboard,
  Users,
  Briefcase,
  Wrench,
  LogOut,
  X,
} from "lucide-react";

export type PageKey = "dashboard" | "clients" | "prestataires" | "services";

const navItems: { key: PageKey; icon: typeof Users; label: string }[] = [
  { key: "dashboard", icon: LayoutDashboard, label: "Tableau de bord" },
  { key: "clients", icon: Users, label: "Clients" },
  { key: "prestataires", icon: Briefcase, label: "Prestataires" },
  { key: "services", icon: Wrench, label: "Services" },
];

export default function AdminSidebar({
  activePage,
  onNavigate,
  onClose,
  onLogout,
}: {
  activePage: PageKey;
  onNavigate: (page: PageKey) => void;
  onClose?: () => void;
  onLogout?: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-700 shadow-lg">
            <span className="text-lg font-bold text-white">HS</span>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">HelloService</p>
            <p className="text-[10px] text-slate-400">Administration</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 lg:hidden dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = activePage === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                active
                  ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-500/25"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
              }`}
            >
              <Icon className={`h-5 w-5 ${active ? "text-white" : "text-slate-400"}`} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      {onLogout && (
        <div className="border-t border-slate-200/70 p-4 dark:border-slate-700/70">
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-500 transition-all hover:bg-red-500/10"
          >
            <LogOut className="h-5 w-5" />
            Se déconnecter
          </button>
        </div>
      )}
    </div>
  );
}
