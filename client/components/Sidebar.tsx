'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const nav = [
  { name: 'Event',   href: '/dashboard' },
  { name: 'Profile', href: '/profile' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:block w-64 shrink-0 h-screen bg-[#18191b]/90 border-r border-gray-900 p-6 backdrop-blur-xl shadow-xl">
      <div className="mb-10 flex items-center gap-2">
        {/* Optional: Add a logo here */}
        <span className="text-xl font-extrabold tracking-tight text-[#A02DED] select-none">
          Net Zero
        </span>
      </div>
      <nav className="flex flex-col gap-3">
        {nav.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                px-5 py-3 rounded-xl text-base font-semibold transition
                ${active
                  ? "bg-gradient-to-r from-[#A02DED]/80 to-blue-800/60 text-white shadow"
                  : "text-gray-300 hover:bg-gray-900/80 hover:text-[#A02DED]"
                }
              `}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
