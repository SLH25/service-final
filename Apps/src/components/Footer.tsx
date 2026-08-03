import React from "react";
import { motion, type Variants } from "framer-motion";
import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  const social = [
    { name: "Facebook", icon: Facebook, href: "#" },
    { name: "Twitter/X", icon: Twitter, href: "#" },
    { name: "Instagram", icon: Instagram, href: "#" },
    { name: "LinkedIn", icon: Linkedin, href: "#" },
  ];

  const links = [
    { label: "Accueil", to: "/" },
    { label: "Services", to: "/services" },
    { label: "Catégories", to: "/categories" },
    { label: "À propos", to: "/about" },
    { label: "Contact", to: "/contact" },
  ];

  return (
    <footer aria-label="Pied de page" className="relative mt-16 sm:mt-20">
      {/* Decorative gradient accents */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-0 left-0 h-64 w-64 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 opacity-10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 opacity-10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="rounded-xl border border-gray-200/60 dark:border-white/10 bg-white/80 dark:bg-gray-800/80 backdrop-blur shadow-lg"
        >
          <div className="grid grid-cols-1 gap-8 p-8 sm:p-10 md:grid-cols-3">
            {/* Column 1: Logo + Description */}
            <div>
              <Link to="/" className="inline-flex items-center gap-2 group">
                <span className="inline-flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-md group-hover:shadow-lg transition-shadow">
                  HS
                </span>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  Hello Service
                </span>
              </Link>
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 max-w-xs">
                Hello Service – la plateforme multi-services
              </p>
            </div>

            {/* Column 2: Quick Links */}
            <nav aria-label="Liens rapides">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-900 dark:text-white">
                Liens rapides
              </h3>
              <ul className="mt-4 space-y-3">
                {links.map((l) => (
                  <li key={l.to}>
                    <Link
                      to={l.to}
                      className="text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Column 3: Social */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-900 dark:text-white">
                Suivez-nous
              </h3>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                {social.map(({ name, icon: Icon, href }) => (
                  <a
                    key={name}
                    href={href}
                    aria-label={name}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="relative inline-flex items-center justify-center rounded-lg border border-gray-200/60 dark:border-white/10 bg-white/80 dark:bg-gray-800/80 backdrop-blur p-2.5 text-gray-700 dark:text-gray-300 hover:text-white transition group"
                  >
                    <span className="pointer-events-none absolute -inset-0.5 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 opacity-0 blur group-hover:opacity-40 transition-opacity" />
                    <Icon className="relative size-5" aria-hidden="true" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-gray-200/60 dark:border-white/10">
            <div className="px-8 py-5 text-center">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                © {year} Hello Service. Tous droits réservés.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;


