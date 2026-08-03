import React from "react";
import { motion } from "framer-motion";
import { MapPin, Mail, Phone } from "lucide-react";

const Contact: React.FC = () => {
  return (
    <section
      aria-label="Formulaire de contact"
      className="relative py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-white via-blue-50 to-slate-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800"
    >
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Formulaire */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg p-8 sm:p-10"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Envoyez-nous un message</h2>
            <form className="space-y-4">
              <input
                type="text"
                placeholder="Nom complet"
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600 dark:focus-visible:ring-offset-gray-900 transition"
              />
              <input
                type="email"
                placeholder="Email"
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600 dark:focus-visible:ring-offset-gray-900 transition"
              />
              <textarea
                placeholder="Votre message"
                rows={5}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600 dark:focus-visible:ring-offset-gray-900 transition"
              />
              <button
                type="submit"
                className="w-full px-6 py-3 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-semibold shadow-lg hover:shadow-2xl transition-all duration-200"
              >
                Envoyer
              </button>
            </form>
          </motion.div>

          {/* Détails & localisation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Informations de contact</h2>
            <ul className="space-y-4 text-gray-700 dark:text-gray-300">
              <li className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                123 Rue Exemple, Douala, Cameroun
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                contact@helloservice.cm
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                +237 6X XX XX XX
              </li>
            </ul>

            <div className="w-full h-64 rounded-2xl overflow-hidden shadow-lg">
              <iframe
                title="Localisation Hello Service"
                className="w-full h-full border-0"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.12345!2d9.70432!3d4.0482!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x105dc123456789ab%3A0xabcdef1234567890!2sDouala%2C%20Cameroun!5e0!3m2!1sfr!2s!4v1690000000000!5m2!1sfr!2s"
                allowFullScreen
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
