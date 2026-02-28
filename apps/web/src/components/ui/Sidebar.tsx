'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Logo } from './Logo'
import { LayoutDashboard, FileText, Sparkles, Search, Settings, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/discover', label: 'Jobs', icon: Search },
    { href: '/profile', label: 'Profile', icon: Settings },
    { href: '/digest', label: 'Digest', icon: Sparkles },
]

interface SidebarProps {
    userEmail: string
}

export function Sidebar({ userEmail }: SidebarProps) {
    const pathname = usePathname()
    const [mobileOpen, setMobileOpen] = useState(false)

    const navContent = (
        <>
            {/* Logo */}
            <div className="p-5 border-b border-slate-800/60">
                <Logo />
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-1" aria-label="Main navigation">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                    const Icon = item.icon
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className={`
                                flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl
                                transition-all duration-200
                                ${isActive
                                    ? 'bg-indigo-500/15 text-indigo-300 border-l-2 border-indigo-400 shadow-sm shadow-indigo-500/10'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border-l-2 border-transparent'
                                }
                            `}
                            aria-current={isActive ? 'page' : undefined}
                        >
                            <Icon size={18} className={isActive ? 'text-indigo-400' : ''} />
                            {item.label}
                        </Link>
                    )
                })}
            </nav>

            {/* User Section */}
            <div className="p-3 border-t border-slate-800/60">
                <div className="px-3 py-2 text-xs text-slate-500 truncate">
                    {userEmail}
                </div>
                <form action="/auth/signout" method="post">
                    <button
                        className="flex items-center gap-3 px-3 py-2.5 w-full text-sm font-medium text-red-400/80 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200"
                    >
                        <LogOut size={18} />
                        Sign Out
                    </button>
                </form>
            </div>
        </>
    )

    return (
        <>
            {/* Mobile menu button */}
            <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 hover:text-slate-100 transition-colors"
                aria-label="Toggle navigation"
            >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Mobile sidebar */}
            <aside
                className={`
                    md:hidden fixed inset-y-0 left-0 z-40 w-64 flex flex-col
                    bg-sidebar-bg backdrop-blur-xl border-r border-sidebar-border
                    transform transition-transform duration-300 ease-out
                    ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
                `}
            >
                {navContent}
            </aside>

            {/* Desktop sidebar */}
            <aside className="hidden md:flex w-64 flex-col shrink-0 bg-sidebar-bg backdrop-blur-xl border-r border-sidebar-border">
                {navContent}
            </aside>
        </>
    )
}
