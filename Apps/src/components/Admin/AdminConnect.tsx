import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Eye, EyeOff, LogIn, Lock, User } from "lucide-react";
import Admin from "./Admin";
import Api, { logoutAdmin } from "./Axio";
import { setTokens, getRefreshToken, clearTokens } from "./tokenManager";

export default function AdminConnect({
  dark,
  setDark,
}: {
  dark: boolean;
  setDark: (v: boolean) => void;
}) {
  const [authenticated, setAuthenticated] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // On mount: try to restore session from the refresh token
  useEffect(() => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      setInitializing(false);
      return;
    }

    // Try to get a new access token from the refresh token
    Api.post("refresh/", { refresh: refreshToken })
      .then((res) => {
        setTokens(res.data.access, refreshToken);
        setAuthenticated(true);
      })
      .catch(() => {
        clearTokens();
      })
      .finally(() => {
        setInitializing(false);
      });
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    setLoading(true);

    try {
      const response = await Api.post("login/", {
        username: username.trim(),
        password: password,
      });

      if (response.status === 200) {
        // Le backend renvoie maintenant tous les utilisateurs actifs ;
        // on restreint ici l'accès au panneau aux administrateurs (is_staff).
        const isStaff = response.data?.user?.is_staff;
        if (!isStaff) {
          setError("Accès refusé. Vous n'êtes pas administrateur.");
          return;
        }
        setTokens(response.data.access, response.data.refresh);
        localStorage.setItem("adminUsername", response.data.username);
        setAuthenticated(true);
      }
    } catch (err: any) {
      if (err.response) {
        const status = err.response.status;
        const message = err.response.data?.message;

        if (status === 401) {
          setError(message || "Nom d'utilisateur ou mot de passe incorrect.");
        } else if (status === 403) {
          setError(message || "Accès refusé. Vous n'êtes pas administrateur.");
        } else if (status >= 500) {
          setError("Erreur serveur. Veuillez réessayer plus tard.");
        } else {
          setError(message || "Erreur de connexion au serveur.");
        }
      } else if (err.request) {
        setError("Impossible de joindre le serveur. Vérifiez votre connexion.");
      } else {
        setError("Une erreur inattendue est survenue.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logoutAdmin(); // blackliste le refresh token côté serveur
    setAuthenticated(false);
    setUsername("");
    setPassword("");
  };

  // Show a loading spinner while checking for an existing session
  if (initializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-700 shadow-lg">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <div className="h-2 w-32 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-blue-600 to-violet-700"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
            />
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Vérification de votre session...
          </p>
        </div>
      </div>
    );
  }

  if (authenticated) {
    return <Admin dark={dark} setDark={setDark} onLogout={handleLogout} />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Left decorative panel */}
      <div className="hidden w-1/2 flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-violet-700 p-12 lg:flex">
        <div className="max-w-md text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-white/15 backdrop-blur-sm">
            <ShieldCheck className="h-10 w-10 text-white" />
          </div>
          <h1 className="mt-8 text-4xl font-bold text-white">HelloService</h1>
          <p className="mt-4 text-lg text-blue-100">
            Espace d'administration
          </p>
          <p className="mt-6 text-sm leading-relaxed text-blue-200">
            Accédez au tableau de bord pour gérer les utilisateurs,
            les prestataires et les services de la plateforme.
          </p>
        </div>
      </div>

      {/* Right login form */}
      <div className="flex w-full items-center justify-center p-6 lg:w-1/2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile header */}
          <div className="mb-8 text-center lg:hidden">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-700 shadow-lg">
              <ShieldCheck className="h-8 w-8 text-white" />
            </div>
            <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">
              Administration
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Connectez-vous pour accéder au tableau de bord
            </p>
          </div>

          {/* Desktop header */}
          <div className="mb-8 hidden lg:block">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Connexion
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Connectez-vous pour accéder au tableau de bord d'administration
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Nom d'utilisateur
              </label>
              <div className="relative mt-1.5">
                <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:placeholder-slate-500 dark:focus:border-blue-500"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Mot de passe
              </label>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-11 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:placeholder-slate-500 dark:focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Error message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="rounded-xl bg-red-500/10 px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-700 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? (
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <LogIn className="h-5 w-5" />
              )}
              {loading ? "Connexion en cours..." : "Se connecter"}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}