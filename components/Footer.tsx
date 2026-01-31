import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-noir border-t border-or/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block group">
              <span className="font-serif text-2xl text-creme group-hover:text-or transition-colors">
                La Fine
              </span>
              <span className="block text-or text-[10px] font-sans tracking-[0.3em] uppercase">
                Parfumerie
              </span>
            </Link>
            <p className="text-creme/50 text-sm mt-6 leading-relaxed max-w-xs">
              Votre destination exclusive pour les parfums niche et de luxe à Strasbourg.
              Une sélection passionnée depuis 2020.
            </p>

            {/* Social links */}
            <div className="flex gap-4 mt-6">
              {[
                { name: "Instagram", href: "#" },
                { name: "Facebook", href: "#" },
              ].map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="w-10 h-10 border border-or/30 flex items-center justify-center text-or hover:bg-or hover:text-noir transition-all duration-300"
                  aria-label={social.name}
                >
                  {social.name === "Instagram" && (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  )}
                  {social.name === "Facebook" && (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  )}
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-serif text-creme text-lg mb-6">Navigation</h4>
            <ul className="space-y-3">
              {[
                { label: "Accueil", href: "/" },
                { label: "Collection", href: "/products" },
                { label: "Signature Royale", href: "/products?category=Signature" },
                { label: "Parfums Niche", href: "/products?category=Niche" },
                { label: "Pour Elle", href: "/products?category=Femme" },
                { label: "Pour Lui", href: "/products?category=Homme" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-creme/50 text-sm hover:text-or transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-serif text-creme text-lg mb-6">Informations</h4>
            <ul className="space-y-3">
              {[
                { label: "Mentions légales", href: "/legal/mentions-legales" },
                { label: "CGV", href: "/legal/cgv" },
                { label: "Confidentialité", href: "/legal/confidentialite" },
                { label: "Retours & Remboursements", href: "/legal/retours" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-creme/50 text-sm hover:text-or transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-serif text-creme text-lg mb-6">Contact</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-or mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-creme/50">
                  12 Rue des Parfumeurs<br />
                  67000 Strasbourg, France
                </span>
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-or flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href="mailto:contact@lafineparfumerie.fr" className="text-creme/50 hover:text-or transition-colors">
                  contact@lafineparfumerie.fr
                </a>
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-or flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <a href="tel:+33388000000" className="text-creme/50 hover:text-or transition-colors">
                  +33 3 88 00 00 00
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-or/10 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-creme/30 text-xs">
              &copy; {currentYear} La Fine Parfumerie. Tous droits réservés.
            </p>
            <div className="flex items-center gap-6">
              <span className="text-creme/30 text-xs">
                Paiement sécurisé
              </span>
              <div className="flex items-center gap-2 text-creme/30">
                {/* Payment icons placeholder */}
                <span className="text-xs border border-creme/20 px-2 py-1">VISA</span>
                <span className="text-xs border border-creme/20 px-2 py-1">MC</span>
                <span className="text-xs border border-creme/20 px-2 py-1">AMEX</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
