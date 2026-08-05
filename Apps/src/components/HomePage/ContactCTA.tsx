import React from "react";
import { motion, type Variants } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "../SignupPage/AuthContext";

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const ContactCTA: React.FC = () => {
 const { userStatus } = useAuth();
  return (
    <>
     {!userStatus && ( 
    <section
      aria-label="Contact CTA"
      className="relative overflow-hidden py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950"
    >
      {/* Decorative gradient accents to match existing system */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-10 -right-6 h-72 w-72 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 opacity-20 blur-3xl" />
        <div className="absolute -bottom-10 -left-6 h-72 w-72 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 opacity-10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="mx-auto max-w-3xl"
        >
          {/* Glass card wrapper */}
          <div className="relative rounded-2xl border border-gray-200/60 dark:border-white/10 bg-white/80 dark:bg-gray-800/80 backdrop-blur shadow-lg">
            {/* subtle gradient edge */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-black/0 [mask-image:radial-gradient(75%_100%_at_50%_0%,black,transparent)]" />
         
            <div className="px-6 py-10 sm:px-10 sm:py-14 text-center">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 dark:from-white dark:via-blue-200 dark:to-white bg-clip-text text-transparent">
                Prêt à démarrer avec Hello Service ?
              </h2>
              <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-600 dark:text-gray-300">
                Nous sommes là pour répondre à vos questions et vous accompagner. Rejoignez notre communauté et trouvez le service idéal en quelques clics.
              </p>

              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
                {/* Secondary glass button */}
                <Link
                  to="/contact"
                  aria-label="Contactez-nous"
                  className="inline-flex items-center justify-center rounded-xl border border-gray-200/70 dark:border-white/10 bg-white/80 dark:bg-gray-800/80 backdrop-blur px-5 py-3 text-sm font-semibold text-gray-900 dark:text-white shadow-sm hover:bg-white/90 dark:hover:bg-gray-800/90 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900"
                >
                  Contactez-nous
                </Link>

                {/* Primary gradient button */}
                <Link
                  to="/signup"
                  aria-label="S'inscrire"
                  className="relative inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-md transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                >
                  {/* hover glow */}
                  <span className="pointer-events-none absolute -inset-0.5 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 opacity-0 blur group-hover:opacity-30" />
                  <span className="relative">S'inscrire</span>
                </Link>
              </div>
            </div>
          
            
          </div>
        </motion.div>
      </div>
    </section>
    ) }
    </> 
  );
};

export default ContactCTA;


