// src/components/AboutHero.tsx
import React from "react";
import { motion } from "framer-motion";

const AboutHero: React.FC = () => {
  return (
    <section
      aria-label="À propos de Hello Service"
      className="relative bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 py-20 sm:py-28 lg:py-32 overflow-hidden"
    >
      {/* Arrière-plan décoratif */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-1/4 w-80 h-80 bg-blue-200/30 dark:bg-blue-900/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-purple-200/40 dark:bg-purple-900/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 dark:from-white dark:via-blue-200 dark:to-white bg-clip-text text-transparent"
        >
          À propos de Hello Service
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-6 text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
        >
          Hello Service est une plateforme qui connecte les utilisateurs avec les meilleurs prestataires dans différentes catégories. Notre objectif est de faciliter la recherche et la réservation de services en toute simplicité.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-10 flex justify-center gap-4"
        >
          <button className="px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 shadow-lg hover:shadow-2xl transition-all">
            Découvrir nos services
          </button>
          <button className="px-6 py-3 rounded-xl font-semibold text-blue-600 dark:text-blue-400 border border-blue-600/40 dark:border-blue-400/40 hover:bg-blue-50 dark:hover:bg-gray-800 transition-all">
            Nous contacter
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutHero;
