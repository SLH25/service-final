// src/components/HeroSection.tsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "../../assets/hero-image.webp"
import { useSearchData } from "../../hooks/useSearchData";
import SearchSuggestions from "../SearchSuggestions";

type HeroSectionProps = {
  dark?: boolean;
};

const HeroSection: React.FC<HeroSectionProps> = ({ dark = false }) => {
  const navigate = useNavigate();
  const { services, loading, error, search } = useSearchData();
  const [searchTerm, setSearchTerm] = useState("");

  // Les 5 premiers services retournés par le backend
  const topServices = services.slice(0, 5);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleServiceClick = (serviceName: string) => {
    navigate(`/search?q=${encodeURIComponent(serviceName)}`);
  };

  const searchResults = search(searchTerm);

  return (
    <div className={dark ? "dark" : ""}>
      <section
        className="relative w-full min-h-[70vh] md:min-h-[80vh] lg:min-h-[85vh] overflow-hidden flex items-center justify-center"
        aria-label="Section de mise en avant"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Overlay sombre */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/60 dark:from-gray-900/80 dark:via-gray-900/70 dark:to-gray-900/80 transition-colors duration-300" />

        {/* Effets décoratifs */}
        <div className="absolute top-10 right-10 w-72 h-72 bg-blue-500/20 dark:bg-blue-900/30 rounded-full mix-blend-multiply blur-3xl opacity-70" />
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-purple-500/20 dark:bg-purple-900/30 rounded-full mix-blend-multiply blur-3xl opacity-70" />

        {/* Contenu centré */}
        <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 md:py-20 lg:py-24 flex flex-col items-center text-center">
          {/* Titre */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-white font-extrabold tracking-tight text-3xl sm:text-4xl lg:text-5xl bg-gradient-to-r from-white via-blue-200 to-white bg-clip-text text-transparent"
          >
            Découvrez les meilleurs services près de chez vous
          </motion.h1>

          {/* Sous-titre */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="mt-4 text-white/90 text-lg sm:text-xl lg:text-2xl max-w-2xl"
          >
            Recherchez, réservez et connectez-vous avec des professionnels locaux de confiance
          </motion.p>

          {/* Barre de recherche */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.4 }}
            className="w-full max-w-2xl mt-8"
          >
            <form
              className="w-full"
              role="search"
              aria-label="Recherche de services"
              onSubmit={handleSearchSubmit}
            >
              <div className="flex flex-col sm:flex-row items-stretch gap-2">
                <div className="relative flex-1">
                  <label htmlFor="hero-search" className="sr-only">
                    Recherchez un service
                  </label>
                  <input
                    id="hero-search"
                    type="text"
                    placeholder="Recherchez un service..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 sm:py-4 rounded-2xl border border-white/30 bg-white/80 text-gray-900 placeholder-gray-500 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white transition dark:bg-gray-800/80 dark:text-gray-100 dark:placeholder-gray-400 dark:border-white/10 dark:focus:ring-offset-gray-900"
                  />
                  <Search
                    size={20}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none"
                  />
                  <SearchSuggestions
                    query={searchTerm}
                    results={searchResults}
                    onSelect={() => setSearchTerm("")}
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="relative px-6 py-3 sm:py-4 rounded-2xl font-semibold text-white bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 shadow-lg hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-white dark:focus:ring-offset-gray-900"
                >
                  Rechercher
                </motion.button>
              </div>
            </form>
          </motion.div>

          {/* Boutons rapides */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.6 }}
            className="w-full max-w-2xl flex flex-col sm:flex-row items-center justify-center gap-3 mt-6"
          >
            {/* min-height réserve l'espace exact des services chargés (3 lignes mobile, 2 lignes tablet, 1 ligne desktop) pour éliminer le CLS */}
            <div className="flex flex-wrap justify-center gap-2 min-h-[148px] sm:min-h-[96px] lg:min-h-[44px]">
              {loading ? (
                <div className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-white/50 text-white/80 backdrop-blur-sm">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"></div>
                  <span className="text-sm font-semibold">Chargement...</span>
                </div>
              ) : error ? (
                <div className="px-5 py-3 rounded-2xl border border-white/50 text-white/80 backdrop-blur-sm text-sm font-semibold">
                  Services indisponibles
                </div>
              ) : topServices.length === 0 ? (
                <div className="px-5 py-3 rounded-2xl border border-white/50 text-white/80 backdrop-blur-sm text-sm font-semibold">
                  Aucun service disponible
                </div>
              ) : (
                topServices.map((service) => (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => handleServiceClick(service.name)}
                    className="px-5 py-3 rounded-2xl border border-white/50 text-white hover:bg-white/10 backdrop-blur-sm transition font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white focus:ring-offset-white dark:focus:ring-offset-gray-900"
                  >
                    {service.name}
                  </button>
                ))
              )}
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => navigate("/services")}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold shadow-lg hover:shadow-2xl transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-white dark:focus:ring-offset-gray-900"
              >
                Voir toutes les Services
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HeroSection;