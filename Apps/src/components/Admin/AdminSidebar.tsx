import { X, LogOut, LayoutDashboard, Briefcase, Wrench, Users } from "lucide-react";

export type PageKey = "dashboard" | "prestataires" | "services" | "utilisateurs";

const sidebarLinks: { key: PageKey; icon: typeof LayoutDashboard; label: string }[] = [
  { key: "dashboard", icon: LayoutDashboard, label: "Tableau de bord" },
  { key: "prestataires", icon: Briefcase, label: "Prestataire" },
  { key: "services", icon: Wrench, label: "Service" },
  { key: "utilisateurs", icon: Users, label: "Utilisateur" },
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
    <>
      <div className="flex h-16 items-center justify-between border-b border-slate-200/80 px-6 dark:border-slate-700/80">
        <div className="flex items-center gap-3">
          <img src="/logo.svg" alt="Logo" className="h-8 w-8 object-contain" />
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">
              HelloService
            </h1>
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Administration
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {sidebarLinks.map((link) => (
          <button
            key={link.key}
            onClick={() => {
              onNavigate(link.key);
              onClose?.();
            }}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
              activePage === link.key
                ? "bg-gradient-to-r from-blue-500/10 to-violet-500/10 text-blue-700 shadow-sm dark:from-blue-500/15 dark:to-violet-500/15 dark:text-blue-300"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-white"
            }`}
          >
            <link.icon className="h-5 w-5 flex-shrink-0" />
            <span className="flex-1 text-left">{link.label}</span>
          </button>
        ))}
      </nav>

      <div className="border-t border-slate-200/80 p-4 dark:border-slate-700/80">
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-red-600 transition-all hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
        >
          <LogOut className="h-5 w-5" />
          <span>Déconnexion</span>
        </button>
      </div>
    </>
  );
}