"use client";

import Link from "next/link";
import { useCart } from "@/lib/CartContext";
import { useWishlist } from "@/lib/WishlistContext";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import Cart from "./Cart";
import SearchBar from "./SearchBar";

const navLinks = [
  { href: "/", label: "Accueil" },
  { href: "/products", label: "Collection" },
  { href: "/products?category=Signature", label: "Signature Royale" },
  { href: "/products?category=Niche", label: "Niche" },
];

export default function Navbar() {
  const { getTotalItems } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { data: session, status } = useSession();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Fermer le menu utilisateur si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Détection du scroll pour l'effet transparent -> solid
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fermer le menu mobile et panier lors du changement de route
  useEffect(() => {
    setIsCartOpen(false);
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        role="navigation"
        aria-label="Navigation principale"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-noir/95 backdrop-blur-md shadow-lg shadow-noir/50"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link href="/" className="flex flex-col items-start group">
              <span className="font-serif text-2xl text-creme tracking-wide group-hover:text-or transition-colors duration-300">
                La Fine
              </span>
              <span className="text-or text-[10px] font-sans tracking-[0.3em] uppercase -mt-1">
                Parfumerie
              </span>
            </Link>

            {/* Navigation desktop */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative font-sans text-sm tracking-wider uppercase transition-colors duration-300
                    ${pathname === link.href ? "text-or" : "text-creme/80 hover:text-or"}
                  `}
                >
                  {link.label}
                  {pathname === link.href && (
                    <motion.span
                      layoutId="activeNav"
                      className="absolute -bottom-1 left-0 right-0 h-px bg-or"
                    />
                  )}
                </Link>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              {/* Barre de recherche */}
              <SearchBar />

              {/* Bouton compte utilisateur */}
              {status === "loading" ? (
                <div className="w-10 h-10 rounded-full bg-zinc-800 animate-pulse" />
              ) : session ? (
                // Utilisateur connecté - Avatar et menu
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 group"
                    aria-label="Menu utilisateur"
                  >
                    {session.user.image ? (
                      <img
                        src={session.user.image}
                        alt={session.user.name || "Avatar"}
                        className="w-10 h-10 rounded-full border-2 border-or/50 group-hover:border-or transition-colors"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-or/20 border-2 border-or/50 group-hover:border-or flex items-center justify-center transition-colors">
                        <span className="text-or font-serif text-lg">
                          {(session.user.name || session.user.email)?.[0]?.toUpperCase()}
                        </span>
                      </div>
                    )}
                    <svg
                      className={`hidden sm:block w-4 h-4 text-creme/60 transition-transform ${isUserMenuOpen ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Menu dropdown */}
                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-or/20 rounded-lg shadow-xl overflow-hidden"
                      >
                        {/* Info utilisateur */}
                        <div className="px-4 py-3 border-b border-or/10">
                          <p className="text-creme font-medium truncate">
                            {session.user.name || "Utilisateur"}
                          </p>
                          <p className="text-creme/50 text-sm truncate">
                            {session.user.email}
                          </p>
                        </div>

                        {/* Liens */}
                        <div className="py-2">
                          <Link
                            href="/wishlist"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-creme/80 hover:bg-or/10 hover:text-or transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            Mes favoris
                            {wishlistCount > 0 && (
                              <span className="ml-auto bg-red-500/20 text-red-400 text-xs px-2 py-0.5 rounded">
                                {wishlistCount}
                              </span>
                            )}
                          </Link>
                          <Link
                            href="/orders"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-creme/80 hover:bg-or/10 hover:text-or transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            Mes commandes
                          </Link>
                          <Link
                            href="/account"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-creme/80 hover:bg-or/10 hover:text-or transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Mon compte
                          </Link>
                        </div>

                        {/* Déconnexion */}
                        <div className="border-t border-or/10 py-2">
                          <button
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              signOut({ callbackUrl: "/" });
                            }}
                            className="flex items-center gap-3 w-full px-4 py-2 text-red-400 hover:bg-red-500/10 transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Déconnexion
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                // Non connecté - Bouton connexion
                <Link
                  href="/auth/signin"
                  className="hidden sm:flex items-center gap-2 px-4 py-2 text-creme/80 hover:text-or transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-sm tracking-wider uppercase">Connexion</span>
                </Link>
              )}

              {/* Bouton favoris */}
              <Link
                href="/wishlist"
                className="relative p-2.5 text-creme/70 hover:text-or transition-colors"
                aria-label="Mes favoris"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                {wishlistCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-sans font-bold w-4 h-4 flex items-center justify-center rounded-full"
                  >
                    {wishlistCount > 9 ? "9+" : wishlistCount}
                  </motion.span>
                )}
              </Link>

              {/* Bouton panier */}
              <button
                onClick={() => setIsCartOpen(true)}
                aria-label={`Panier${getTotalItems() > 0 ? `, ${getTotalItems()} article${getTotalItems() > 1 ? 's' : ''}` : ''}`}
                className="relative group flex items-center gap-3 px-5 py-2.5 border border-or/50 hover:border-or hover:bg-or/10 transition-all duration-300"
              >
                <svg
                  className="w-5 h-5 text-or"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                <span className="hidden sm:block font-sans text-xs text-creme tracking-wider uppercase">
                  Panier
                </span>
                {getTotalItems() > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 bg-or text-noir text-[10px] font-sans font-bold w-5 h-5 flex items-center justify-center"
                  >
                    {getTotalItems()}
                  </motion.span>
                )}
              </button>

              {/* Bouton menu mobile */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-creme hover:text-or transition-colors"
                aria-label={isMobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Ligne dorée décorative */}
        <div className={`h-px bg-gradient-to-r from-transparent via-or/30 to-transparent transition-opacity duration-500 ${isScrolled ? "opacity-100" : "opacity-0"}`} />
      </motion.nav>

      {/* Menu mobile */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            {/* Overlay */}
            <div
              className="absolute inset-0 bg-noir/90 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Menu content */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="absolute right-0 top-0 bottom-0 w-80 bg-noir border-l border-or/20 p-8 pt-24"
            >
              <nav className="flex flex-col gap-6">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`block font-serif text-2xl transition-colors duration-300 ${
                        pathname === link.href ? "text-or" : "text-creme hover:text-or"
                      }`}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}

                {/* Séparateur */}
                <div className="h-px bg-or/20 my-2" />

                {/* Liens auth mobile */}
                {session ? (
                  <>
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <Link
                        href="/wishlist"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 font-serif text-xl text-creme hover:text-or transition-colors"
                      >
                        Mes favoris
                        {wishlistCount > 0 && (
                          <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                            {wishlistCount}
                          </span>
                        )}
                      </Link>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <Link
                        href="/orders"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block font-serif text-xl text-creme hover:text-or transition-colors"
                      >
                        Mes commandes
                      </Link>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <Link
                        href="/account"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block font-serif text-xl text-creme hover:text-or transition-colors"
                      >
                        Mon compte
                      </Link>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 }}
                    >
                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          signOut({ callbackUrl: "/" });
                        }}
                        className="block font-serif text-xl text-red-400 hover:text-red-300 transition-colors"
                      >
                        Deconnexion
                      </button>
                    </motion.div>
                  </>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Link
                      href="/auth/signin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block font-serif text-xl text-or hover:text-or/80 transition-colors"
                    >
                      Se connecter
                    </Link>
                  </motion.div>
                )}
              </nav>

              {/* Infos boutique */}
              <div className="absolute bottom-8 left-8 right-8">
                <div className="h-px bg-or/20 mb-6" />
                <p className="text-creme/40 text-xs font-sans tracking-wider uppercase mb-2">
                  La Fine Parfumerie
                </p>
                <p className="text-creme/60 text-sm">
                  Strasbourg, France
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer pour compenser la navbar fixed */}
      <div className="h-20" />

      {/* Cart drawer */}
      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
