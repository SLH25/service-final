// src/components/AboutPage/AboutMain.tsx
import React from "react";
import { motion } from "framer-motion";
import { CheckCircle, Users, Globe } from "lucide-react";

const features = [
  {
    title: "Notre mission",
    description:
      "Faciliter l’accès à des services fiables et de qualité pour tous, en connectant prestataires et utilisateurs de manière simple et efficace.",
    icon: Globe,
    gradient: "bg-gradient-to-br from-blue-500 to-purple-600",
  },
  {
    title: "Nos valeurs",
    description:
      "Transparence, confiance et excellence sont au cœur de toutes nos interactions et services.",
    icon: Users,
    gradient: "bg-gradient-to-br from-emerald-500 to-teal-600",
  },
  {
    title: "Fiabilité & Support",
    description:
      "Nous garantissons un service client disponible et des prestataires vérifiés pour assurer votre satisfaction.",
    icon: CheckCircle,
    gradient: "bg-gradient-to-br from-orange-500 to-red-500",
  },
];

// Variants pour le container et les items
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 260, damping: 20 } },
};

const AboutMain: React.FC = () => {
  return (
    <section
      aria-label="Notre mission et valeurs"
      className="relative py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 overflow-hidden"
    >
      {/* Éléments décoratifs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-16 left-10 w-72 h-72 bg-blue-100 dark:bg-blue-900/20 rounded-full mix-blend-multiply filter blur-2xl opacity-70"></div>
        <div className="absolute bottom-16 right-10 w-72 h-72 bg-purple-100 dark:bg-purple-900/20 rounded-full mix-blend-multiply filter blur-2xl opacity-70"></div>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Titre et description */}
        <div className="text-center max-w-3xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 dark:from-white dark:via-blue-200 dark:to-white bg-clip-text text-transparent"
          >
            Notre mission & nos valeurs
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
          >
            Découvrez ce qui nous motive et les principes qui guident chaque action au sein de Hello Service.
          </motion.p>
        </div>

        {/* Features */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map(({ title, description, icon: Icon, gradient }, idx) => (
            <motion.article
              key={idx}
              variants={itemVariants}
              whileHover={{ y: -8 }}
              className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 flex flex-col items-center text-center"
            >
              <div className={`w-16 h-16 mb-4 rounded-2xl flex items-center justify-center ${gradient} shadow-lg`}>
                <Icon className="w-8 h-8 text-white drop-shadow-lg" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">{description}</p>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default AboutMain;
