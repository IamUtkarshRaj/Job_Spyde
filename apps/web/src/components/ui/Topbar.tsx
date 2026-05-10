import { Search, Bell, Sparkles, HelpCircle } from 'lucide-react'
import Link from 'next/link'

interface TopbarProps {
    userEmail: string
    userName?: string
}

export function Topbar({ userEmail, userName }: TopbarProps) {
    const initials = (userName || userEmail)
        .split('@')[0]
        .split(/[._-]/)
        .map(s => s[0]?.toUpperCase())
        .join('')
        .slice(0, 2)

    const displayName = userName || userEmail.split('@')[0].split(/[._-]/).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')

    return (
        <header className="h-16 flex items-center justify-between px-8 bg-slate-950/40 backdrop-blur-lg border-b border-white/5 relative z-20">
            {/* Search */}
            <div className="flex items-center w-1/2">
                <div className="relative w-full max-w-md group">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[var(--color-neon-teal)] transition-colors" />
                    <input
                        type="text"
                        placeholder="Find your next role..."
                        className="bg-black border-none rounded-full pl-10 pr-4 py-1.5 text-sm w-full focus:ring-1 focus:ring-[var(--color-neon-teal)]/40 placeholder:text-slate-500 text-white transition-all focus:outline-none"
                        aria-label="Search"
                    />
                </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-6">
                <button
                    className="text-slate-400 hover:text-white transition-opacity"
                    aria-label="Notifications"
                >
                    <Bell size={20} />
                </button>
                <a
                    href="#"
                    className="text-slate-400 hover:text-white transition-opacity"
                    aria-label="Help"
                >
                    <HelpCircle size={20} />
                </a>

                <Link href="/profile" className="flex items-center gap-3 ml-2 border-l border-white/10 pl-6 cursor-pointer hover:opacity-80 transition-opacity">
                    <div className="text-right hidden sm:block">
                        <p className="text-xs font-bold text-white">{displayName}</p>
                        <p className="text-[10px] text-slate-500">Member</p>
                    </div>
                    <div
                        className="h-8 w-8 rounded-full bg-gradient-to-br from-[var(--color-accent-primary)] to-[var(--color-neon-teal)] flex items-center justify-center text-xs font-bold text-white border border-[var(--color-neon-teal)]/30"
                        title={userName || userEmail}
                    >
                        {initials}
                    </div>
                </Link>
            </div>
        </header>
    )
}
