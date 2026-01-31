'use client';

/**
 * SIDEBAR ADMIN
 * Navigation latérale pour le dashboard admin
 * Design noir/or luxe avec états actifs
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';

interface SidebarProps {
  user: {
    name?: string | null;
    email: string;
    role: string;
  };
}

const menuItems = [
  { name: 'Dashboard', href: '/admin', icon: '📊' },
  { name: 'Produits', href: '/admin/products', icon: '🛍️' },
  { name: 'Commandes', href: '/admin/orders', icon: '📦' },
  { name: 'Codes Promo', href: '/admin/promo', icon: '🏷️' },
  { name: 'Emails', href: '/admin/emails', icon: '📧' },
  { name: 'Clients', href: '/admin/customers', icon: '👥' },
  { name: 'Paramètres', href: '/admin/settings', icon: '⚙️' },
];

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-black border-r border-[#c5a059]/20 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-[#c5a059]/20">
        <Link href="/admin">
          <h1 className="text-2xl font-bold text-[#c5a059] font-serif">
            La Fine Parfumerie
          </h1>
        </Link>
        <p className="text-xs text-gray-500 mt-1">Administration</p>
        <div className="mt-4 p-3 bg-[#c5a059]/10 rounded-lg">
          <p className="text-sm font-semibold text-white">{user.name || 'Admin'}</p>
          <p className="text-xs text-gray-400 truncate">{user.email}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                active
                  ? 'bg-[#c5a059] text-black font-semibold shadow-lg'
                  : 'text-gray-300 hover:bg-[#c5a059]/10 hover:text-[#c5a059]'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer - Actions */}
      <div className="border-t border-[#c5a059]/20 p-4 space-y-2">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-400 hover:text-[#c5a059] transition-colors rounded-lg hover:bg-[#c5a059]/10"
        >
          <span>🌐</span>
          <span>Voir le site</span>
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-400 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
        >
          <span>🚪</span>
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}
