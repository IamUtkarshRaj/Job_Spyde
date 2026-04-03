'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Logo } from './Logo'
import { LayoutDashboard, FileText, Sparkles, Search, Settings, LogOut, Menu, X, Crown, HelpCircle } from 'lucide-react'
import { useState } from 'react'

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/discover', label: 'Job Search', icon: Search },
    { href: '/resume-optimizer', label: 'Resume Optimizer', icon: Sparkles },
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
        <div className="relative z-10 flex flex-col h-full">
            {/* Brand Header */}
            <div className="px-8 py-8">
                <Logo />
                <p className="text-[10px] text-slate-500 tracking-[0.2em] mt-2 uppercase font-medium">Obsidian Observatory</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-1 mt-2" aria-label="Main navigation">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                    const Icon = item.icon
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className={`
                                flex items-center gap-4 px-4 py-3 text-sm font-medium
                                transition-all duration-300 relative group
                                ${isActive
                                    ? 'text-white before:absolute before:left-0 before:w-[2px] before:h-full before:bg-[var(--color-neon-teal)] before:shadow-[0_0_8px_rgba(105,246,184,0.6)] hover:bg-white/5'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }
                            `}
                            aria-current={isActive ? 'page' : undefined}
                        >
                            <Icon size={20} className={`transition-colors ${isActive ? 'text-[var(--color-neon-teal)]' : 'group-hover:text-white'}`} />
                            <span>{item.label}</span>
                        </Link>
                    )
                })}
            </nav>

            {/* Footer Actions */}
            <div className="px-4 pb-8 space-y-2">
                {/* Upgrade to Pro Card */}
                <div className="p-4 mb-4 rounded-xl bg-gradient-to-br from-[var(--color-accent-primary)]/10 to-[var(--color-neon-teal)]/10 border border-white/5">
                    <p className="text-xs text-white font-bold mb-2 flex items-center gap-1.5">
                        <Crown size={12} className="text-[var(--color-neon-teal)]" />
                        Upgrade to Pro
                    </p>
                    <p className="text-[10px] text-slate-400 mb-3 leading-relaxed">Get advanced AI insights and priority job matching.</p>
                    <button className="w-full py-2 bg-[var(--color-neon-teal)] text-slate-950 text-[10px] font-bold rounded-lg hover:shadow-[0_0_15px_rgba(105,246,184,0.4)] transition-all">
                        Go Premium
                    </button>
                </div>

                <a className="group flex items-center gap-4 px-4 py-2 text-slate-400 hover:text-white transition-colors duration-300" href="#">
                    <HelpCircle size={18} />
                    <span className="text-sm">Help</span>
                </a>

                <div className="px-4 py-2 text-xs font-medium text-slate-500 truncate">
                    {userEmail}
                </div>

                <form action="/auth/signout" method="post">
                    <button
                        className="flex items-center gap-4 px-4 py-2 w-full text-sm font-medium text-slate-400 hover:text-white transition-all duration-200"
                    >
                        <LogOut size={18} />
                        Sign Out
                    </button>
                </form>
            </div>
        </div>
    )

    return (
        <>
            {/* Mobile menu button */}
            <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden fixed top-4 left-4 z-50 p-2.5 rounded-xl bg-slate-950/90 backdrop-blur-xl border border-white/10 text-white hover:border-white/20 transition-colors shadow-lg"
                aria-label="Toggle navigation"
            >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/80 backdrop-blur-md z-40"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Mobile sidebar */}
            <aside
                className={`
                    md:hidden fixed inset-y-0 left-0 z-40 w-64 flex flex-col
                    bg-slate-950/60 backdrop-blur-xl border-r border-white/10
                    shadow-[0px_20px_40px_rgba(0,0,0,0.4)]
                    transform transition-transform duration-400 cubic-bezier(0.16, 1, 0.3, 1)
                    ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
                `}
            >
                {navContent}
            </aside>

            {/* Desktop sidebar */}
            <aside className="hidden md:flex w-64 flex-col shrink-0 bg-slate-950/60 backdrop-blur-xl border-r border-white/10 shadow-[0px_20px_40px_rgba(0,0,0,0.4)] relative">
                {navContent}
            </aside>
        </>
    )
}
