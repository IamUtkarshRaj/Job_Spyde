'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Compass, FileText, BarChart3, LogOut, Radar } from 'lucide-react'
import { signOut } from '@/app/login/actions'

export function Navigation() {
    const pathname = usePathname()
    if (pathname === '/login' || pathname === '/signup' || pathname === '/') return null

    const links = [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/discover', label: 'Discover', icon: Compass },
        { href: '/resume', label: 'Resume', icon: FileText },
        { href: '/digest', label: 'Digest', icon: BarChart3 },
    ]

    return (
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between hidden md:flex sticky top-0 h-screen">
            <div className="p-6">
                <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl text-blue-600 mb-8">
                    <Radar size={24} />
                    Job Spyde
                </Link>
                <nav className="space-y-1">
                    {links.map((link) => {
                        const Icon = link.icon
                        const isActive = pathname.startsWith(link.href)
                        return (
                            <Link key={link.href} href={link.href} className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                                <Icon size={18} />
                                {link.label}
                            </Link>
                        )
                    })}
                </nav>
            </div>
            <div className="p-4 border-t border-gray-200">
                <button onClick={() => signOut()} className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900 w-full transition-colors cursor-pointer">
                    <LogOut size={18} />
                    Sign Out
                </button>
            </div>
        </aside>
    )
}
