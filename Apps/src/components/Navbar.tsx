// src/components/Navbar.tsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Sun, Moon, Search } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Logo from "./Logo";
import { useAuth } from "./SignupPage/AuthContext";
import { useSearchData } from "../hooks/useSearchData";
import SearchSuggestions from "./SearchSuggestions";

interface NavbarProps {
  dark: boolean;
  setDark: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Navbar({ dark, setDark }: NavbarProps) {
  const { userStatus, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { search } = useSearchData();
  const toggleDark = () => setDark(!dark);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setIsOpen(false);
      setSearchTerm("");
    }
  };

  const searchResults = search(searchTerm);

 // Définis d'abord le tableau des liens
const navLinks = [
  { name: "Accueil", path: "/" },
  { name: "Services", path: "/services" },
  { name: "Prestataires", path: "/prestataires" },
  { name: "À propos", path: "/about" },
  { name: "Contact", path: "/contact" },
];

 

  const navLinkClasses =
    "px-3 py-2 rounded-2xl text-sm font-medium text-gray-800 dark:text-gray-100 hover:bg-white/10 dark:hover:bg-white/8 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600 dark:focus-visible:ring-offset-gray-900";

  return (
    <header className="sticky top-0 z-50 bg-white/60 dark:bg-gray-900/60 border-b border-gray-200 dark:border-gray-800 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link
              to="/"
              aria-label="Accueil"
              className="relative flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600 dark:focus-visible:ring-offset-gray-900 rounded-2xl"
            >
              {/* subtle decorative gradient behind logo to match Prestataires look */}
              <span className="absolute -left-3 -top-3 w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 opacity-10 blur-2xl pointer-events-none" />
              <Logo width={150} />
            </Link>
          </div>

          {/* Links (desktop) */}
          <nav className="hidden md:flex items-center gap-2" aria-label="Primary">       
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path} className={navLinkClasses}>
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Actions (desktop) */}
          <div className="hidden md:flex items-center gap-3">
            {/* Search (glass style) */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                id="site-search"
                type="text"
                placeholder="Recherche..."
                aria-label="Recherche"
                value={searchTerm}
                onChange={handleSearch}
                className="w-56 pl-10 pr-3 py-2 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900 transition"
              />
              <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer">
                <div className="w-6 h-6 rounded-md flex items-center justify-center bg-gradient-to-r from-yellow-400 to-orange-500 p-[2px]">
                  <Search size={14} className="text-white" />
                </div>
              </button>
              <SearchSuggestions
                query={searchTerm}
                results={searchResults}
                onSelect={() => {
                  setSearchTerm("");
                  setIsOpen(false);
                }}
              />
            </form>

            {/* Dark toggle */}
            <button
              type="button"
              onClick={toggleDark}
              aria-label="Basculer le mode sombre"
              className="p-2 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800/80 shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600 dark:focus-visible:ring-offset-gray-900"
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Auth buttons */}
            {!userStatus ? (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-2xl bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 dark:hover:bg-gray-700 shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600 dark:focus-visible:ring-offset-gray-900 text-sm font-semibold"
                >
                  Se connecter
                </Link>

                <Link
                  to="/signup"
                  className="relative inline-flex items-center gap-2 px-4 py-2 rounded-2xl font-semibold text-white bg-gradient-to-br from-yellow-400 to-orange-500 hover:scale-[1.01] hover:shadow-2xl transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600 dark:focus-visible:ring-offset-gray-900 text-sm"
                >
                  S'inscrire
                  {/* subtle moving gloss effect */}
                  <span className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-10 pointer-events-none" />
                </Link>
              </>
            ) : (
              <Link
                to="/profile"
                className="px-4 py-2 rounded-2xl bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 dark:hover:bg-gray-700 shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600 dark:focus-visible:ring-offset-gray-900 text-sm font-semibold"
              >
                Mon Profil
              </Link>
            )}
          </div>

          {/* Mobile toggle */}
          <div className="md:hidden flex items-center">
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              aria-label="Ouvrir le menu"
              aria-expanded={isOpen}
              className="p-2 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800/80 shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600 dark:focus-visible:ring-offset-gray-900"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur shadow-lg"
            role="dialog"
            aria-modal="true"
          >
            <div className="px-4 pt-3 pb-6">
              <div className="flex items-center justify-between mb-3">
                {/* Mobile search */}
              <form onSubmit={handleSearchSubmit} className="mb-4">
                <div className="relative">
                  <input
                    id="site-search-mobile"
                    type="text"
                    placeholder="Recherche..."
                    aria-label="Recherche"
                    value={searchTerm}
                    onChange={handleSearch}
                    className="w-full pl-10 pr-3 py-2 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/90 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600 dark:focus-visible:ring-offset-gray-900"
                  />
                  <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer">
                    <div className="w-6 h-6 rounded-md flex items-center justify-center bg-gradient-to-r from-yellow-400 to-orange-500 p-[2px]">
                      <Search size={14} className="text-white" />
                    </div>
                  </button>
                  <SearchSuggestions
                    query={searchTerm}
                    results={searchResults}
                    onSelect={() => {
                      setSearchTerm("");
                      setIsOpen(false);
                    }}
                  />
                </div>
              </form>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Fermer le menu"
                  className="p-2 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600 dark:focus-visible:ring-offset-gray-900"
                >
                  <X size={22} />
                </button>
              </div>

              {/* Mobile links */}
              <nav className="flex flex-col gap-2 mb-4" aria-label="Mobile Primary">
                {navLinks.map((link) => (
                  <Link 
                    key={link.path} 
                    to={link.path} 
                    onClick={() => setIsOpen(false)}
                    className="px-3 py-2 rounded-2xl text-gray-800 dark:text-gray-100 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600 dark:focus-visible:ring-offset-gray-900"
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>

              {/* Mobile actions */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={toggleDark}
                  className="w-full p-2 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800/80 shadow-md flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600 dark:focus-visible:ring-offset-gray-900"
                >
                  {dark ? <Sun size={16} /> : <Moon size={16} />}
                  <span className="text-sm font-medium">{dark ? "Mode clair" : "Mode sombre"}</span>
                </button>

                {!userStatus ? (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      className="w-full px-4 py-2 rounded-2xl bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 dark:hover:bg-gray-700 shadow-md text-center font-semibold"
                    >
                      Se connecter
                    </Link>

                    <Link
                      to="/signup"
                      onClick={() => setIsOpen(false)}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-2xl font-semibold text-white bg-gradient-to-br from-yellow-400 to-orange-500 hover:shadow-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600 dark:focus-visible:ring-offset-gray-900"
                    >
                      S'inscrire
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/profile"
                      onClick={() => setIsOpen(false)}
                      className="w-full px-4 py-2 rounded-2xl bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 dark:hover:bg-gray-700 shadow-md text-center font-semibold"
                    >
                      Mon Profil
                    </Link>
                    <button
                      onClick={() => { logout(); setIsOpen(false); }}
                      className="w-full px-4 py-2 rounded-2xl border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 shadow-md text-center font-semibold"
                    >
                      Se déconnecter
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}