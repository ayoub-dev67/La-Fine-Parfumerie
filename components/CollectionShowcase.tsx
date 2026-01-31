"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Product } from "@/types";

interface CollectionShowcaseProps {
  title: string;
  subtitle: string;
  description: string;
  products: Product[];
  ctaLink: string;
  ctaText: string;
}

export default function CollectionShowcase({
  title,
  subtitle,
  description,
  products,
  ctaLink,
  ctaText,
}: CollectionShowcaseProps) {
  if (products.length === 0) return null;

  return (
    <section className="py-24 bg-noir-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-or/5 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Text content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-or text-xs font-sans tracking-[0.3em] uppercase">
              {subtitle}
            </span>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-creme mt-4 mb-6">
              {title}
            </h2>
            <div className="w-16 h-px bg-or mb-8" />
            <p className="text-creme/60 text-lg leading-relaxed mb-10 max-w-md">
              {description}
            </p>
            <Link href={ctaLink} className="btn-luxury inline-flex">
              {ctaText}
            </Link>
          </motion.div>

          {/* Right: Product showcase */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            {/* Main featured product */}
            <div className="relative">
              <Link
                href={`/products/${products[0].id}`}
                className="block group"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-noir">
                  <Image
                    src={products[0].image}
                    alt={products[0].name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-noir via-transparent to-transparent" />

                  {/* Product info */}
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    {products[0].brand && (
                      <span className="text-or text-xs font-sans tracking-[0.2em] uppercase">
                        {products[0].brand}
                      </span>
                    )}
                    <h3 className="font-serif text-2xl text-creme mt-2 group-hover:text-or transition-colors">
                      {products[0].name}
                    </h3>
                    <p className="text-creme/50 text-sm mt-2">
                      {products[0].volume}
                    </p>
                    <p className="font-serif text-xl text-creme mt-4">
                      {Number(products[0].price).toFixed(2)} €
                    </p>
                  </div>
                </div>

                {/* Border decoration */}
                <div className="absolute inset-0 border border-or/0 group-hover:border-or/30 transition-colors duration-500 pointer-events-none" />
              </Link>

              {/* Decorative frame */}
              <div className="absolute -top-4 -left-4 w-24 h-24 border-t border-l border-or/30" />
              <div className="absolute -bottom-4 -right-4 w-24 h-24 border-b border-r border-or/30" />
            </div>

            {/* Thumbnails for other products */}
            {products.length > 1 && (
              <div className="grid grid-cols-3 gap-4 mt-6">
                {products.slice(1, 4).map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  >
                    <Link
                      href={`/products/${product.id}`}
                      className="block group relative aspect-square overflow-hidden bg-noir"
                    >
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-noir/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute inset-0 border border-or/0 group-hover:border-or/50 transition-colors duration-300" />
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
