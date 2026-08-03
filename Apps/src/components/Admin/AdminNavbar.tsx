import {
  Bell,
  Search,
  Menu,
  Sun,
  Moon,
  ChevronDown,
} from "lucide-react";
import { useAdminStore } from "./AdminStore";

export default function AdminNavbar({
  dark,
  setDark,
  onToggleSidebar,
}: {
  dark: boolean;
  setDark: (v: boolean) => void;
  onToggleSidebar: () => void;
}) {
  const { activities } = useAdminStore();
  const pendingCount =
    activities.filter((a) => a.type !== "system").length;
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200/80 bg-white/80 px-4 backdrop-blur-xl dark:border-slate-700/80 dark:bg-slate-900/80 sm:px-6">
      <button
        onClick={onToggleSidebar}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Logo */}
      <div className="flex items-center gap-2.5 flex-shrink-0">
        <img
          src="/logo.svg"
          alt="Logo"
          className="h-8 w-8 object-contain"
        />
        <span className="hidden text-base font-bold text-slate-900 dark:text-white sm:block">
          HelloService
        </span>
      </div>

      {/* Search bar */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Rechercher dans le tableau de bord..."
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:placeholder-slate-500 dark:focus:border-blue-500 dark:focus:bg-slate-800"
        />
      </div>

      <div className="flex items-center gap-2">
        {/* Dark/Light mode toggle */}
        <button
          onClick={() => setDark(!dark)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition-all hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          title={dark ? "Mode clair" : "Mode sombre"}
        >
          {dark ? (
            <Sun className="h-5 w-5 text-amber-400" />
          ) : (
            <Moon className="h-5 w-5 text-slate-600" />
          )}
        </button>

        {/* Notifications */}
        <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
          <Bell className="h-5 w-5" />
          {pendingCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {pendingCount > 9 ? "9+" : pendingCount}
            </span>
          )}
        </button>

        {/* Admin status bubble */}
        <div className="hidden items-center gap-3 sm:flex">
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
          <div className="flex items-center gap-2.5">
            <div className="relative flex-shrink-0">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600 text-xs font-bold text-white shadow-md">
                AD
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-white bg-emerald-500 dark:border-slate-900">
                <span className="h-1.5 w-1.5 rounded-full bg-white" />
              </span>
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  Admin
                </p>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  En ligne
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Super administrateur
              </p>
            </div>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </div>
        </div>
      </div>
    </header>
  );
}