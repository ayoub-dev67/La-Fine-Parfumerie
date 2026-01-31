/**
 * Layout dédié pour les pages d'authentification
 * Exclut Navbar et Footer pour une expérience de connexion épurée
 */

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-black">{children}</div>;
}
