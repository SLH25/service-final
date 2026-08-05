import { useState } from "react";
import AdminNavbar from "./AdminNavbar";
import AdminSidebar, { type PageKey } from "./AdminSidebar";
import AdminDashboard from "./AdminDashboard";
import Client from "./Client/Client";
import Prestataire from "./Prestataire/Prestataire";
import Service from "./Service/Service";
import { AdminStoreProvider } from "./AdminStore";
import { motion, AnimatePresence } from "framer-motion";

const pageComponents: Record<PageKey, React.ComponentType> = {
  dashboard: AdminDashboard,
  clients: Client,
  prestataires: Prestataire,
  services: Service,
};

export default function Admin({
  dark,
  setDark,
  onLogout,
}: {
  dark: boolean;
  setDark: (v: boolean) => void;
  onLogout?: () => void;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState<PageKey>("dashboard");

  const ActiveComponent = pageComponents[activePage];

  return (
    <AdminStoreProvider>
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar mobile */}
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200/80 bg-white dark:border-slate-700/80 dark:bg-slate-900 lg:static lg:z-auto lg:translate-x-0"
          >
            <AdminSidebar
              activePage={activePage}
              onNavigate={setActivePage}
              onClose={() => setSidebarOpen(false)}
              onLogout={onLogout}
            />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Sidebar desktop */}
      <aside className="hidden w-72 flex-shrink-0 border-r border-slate-200/80 bg-white dark:border-slate-700/80 dark:bg-slate-900 lg:flex lg:flex-col">
        <AdminSidebar
          activePage={activePage}
          onNavigate={setActivePage}
          onLogout={onLogout}
        />
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        <AdminNavbar
          dark={dark}
          setDark={setDark}
          onToggleSidebar={() => setSidebarOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <ActiveComponent />
        </main>
      </div>
      </div>
    </AdminStoreProvider>
  );
}
