"use client";

import { motion } from "framer-motion";

const features = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: "Authenticité Garantie",
    description: "Chaque parfum est certifié 100% authentique, directement sourcé auprès des maisons de parfumerie.",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    title: "Écrin Luxueux",
    description: "Un packaging soigné et raffiné pour une expérience d'unboxing digne des plus grandes maisons.",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: "Livraison Express",
    description: "Expédition sous 24h et livraison gratuite en France métropolitaine dès 100€ d'achat.",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    title: "Conseil Expert",
    description: "Notre équipe de passionnés vous guide dans le choix de votre fragrance idéale.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

export default function FeaturesSection() {
  return (
    <section className="py-24 bg-noir-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-or text-xs font-sans tracking-[0.3em] uppercase">
            Notre engagement
          </span>
          <h2 className="font-serif text-4xl md:text-5xl text-creme mt-4 mb-6">
            L&apos;Excellence à Votre Service
          </h2>
          <div className="w-16 h-px bg-or mx-auto" />
        </motion.div>

        {/* Features grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group relative p-8 bg-noir border border-or/10 hover:border-or/30 transition-colors duration-500"
            >
              {/* Icon */}
              <div className="w-16 h-16 mb-6 border border-or/30 flex items-center justify-center text-or group-hover:bg-or group-hover:text-noir transition-all duration-500">
                {feature.icon}
              </div>

              {/* Content */}
              <h3 className="font-serif text-xl text-creme mb-3">
                {feature.title}
              </h3>
              <p className="text-creme/50 text-sm leading-relaxed">
                {feature.description}
              </p>

              {/* Corner accent */}
              <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-or/20 group-hover:border-or/50 transition-colors duration-500" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-or/20 group-hover:border-or/50 transition-colors duration-500" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
