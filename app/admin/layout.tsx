/**
 * LAYOUT ADMIN
 * Layout avec sidebar pour tout le dashboard admin
 * Protection: seuls les utilisateurs avec role ADMIN peuvent accéder
 */

import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/admin/Sidebar';

export const metadata = {
  title: 'Admin - La Fine Parfumerie',
  description: 'Dashboard administrateur',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Double vérification (middleware + layout)
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/auth/signin');
  }

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      {/* Sidebar fixe */}
      <Sidebar user={session.user} />

      {/* Contenu principal avec marge pour la sidebar */}
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
