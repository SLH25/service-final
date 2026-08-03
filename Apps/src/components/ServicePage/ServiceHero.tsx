// src/components/ServicePage/ServiceHero.tsx
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function ServiceHero() {
  return (
    <section className="relative bg-white dark:bg-gray-900 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10 dark:from-blue-600/20 dark:via-purple-600/20 dark:to-pink-600/20 blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-6 py-24 text-center">
        {/* Titre principal */}
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white"
        >
          Nos Services, Votre <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Solution</span>
        </motion.h1>

        {/* Sous-texte */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-300"
        >
          Découvrez une gamme complète de services conçus pour vous simplifier la vie. 
          Avec <strong>Hello Service</strong>, vos besoins trouvent toujours une réponse adaptée.
        </motion.p>

        {/* Boutons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 flex flex-wrap justify-center gap-4"
        >
          <Link
            to="/prestataires"
            className="px-6 py-3 rounded-2xl font-semibold text-white bg-gradient-to-br from-yellow-400 to-orange-500 hover:scale-[1.02] hover:shadow-xl transition"
          >
            Explorer les Prestataires
          </Link>

          <Link
            to="/contact"
            className="px-6 py-3 rounded-2xl font-semibold text-gray-900 bg-white border border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 dark:hover:bg-gray-700 shadow-md transition"
          >
            Contactez-nous
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
