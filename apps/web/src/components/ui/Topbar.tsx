import { Search, Bell } from 'lucide-react'

interface TopbarProps {
    userEmail: string
}

export function Topbar({ userEmail }: TopbarProps) {
    const initials = userEmail
        .split('@')[0]
        .split(/[._-]/)
        .map(s => s[0]?.toUpperCase())
        .join('')
        .slice(0, 2)

    return (
        <header className="h-14 flex items-center justify-between px-6 bg-slate-900/60 backdrop-blur-md border-b border-slate-800/50">
            {/* Search */}
            <div className="flex items-center gap-3 flex-1 max-w-md">
                <div className="relative w-full">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search jobs, companies..."
                        className="w-full pl-9 pr-4 py-2 text-sm bg-slate-800/50 border border-slate-700/50 text-slate-200 placeholder:text-slate-500 rounded-xl focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all duration-200"
                        aria-label="Search"
                    />
                </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
                <button
                    className="relative p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-xl transition-colors"
                    aria-label="Notifications"
                >
                    <Bell size={18} />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full" />
                </button>

                <div
                    className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-indigo-500/20"
                    title={userEmail}
                >
                    {initials}
                </div>
            </div>
        </header>
    )
}
