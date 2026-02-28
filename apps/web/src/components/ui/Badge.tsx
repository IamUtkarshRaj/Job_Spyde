type StatusType = 'discovered' | 'saved' | 'prepared' | 'applied' | 'interview' | 'offer' | 'rejected' | 'ghosted'

const statusStyles: Record<StatusType, string> = {
    discovered: 'bg-slate-500/20 text-slate-300 border-slate-500/20',
    saved: 'bg-blue-500/20 text-blue-300 border-blue-500/20',
    prepared: 'bg-amber-500/20 text-amber-300 border-amber-500/20',
    applied: 'bg-green-500/20 text-green-300 border-green-500/20',
    interview: 'bg-purple-500/20 text-purple-300 border-purple-500/20',
    offer: 'bg-pink-500/20 text-pink-300 border-pink-500/20',
    rejected: 'bg-red-500/20 text-red-300 border-red-500/20',
    ghosted: 'bg-slate-500/30 text-slate-400 border-slate-500/20',
}

interface BadgeProps {
    children: React.ReactNode
    variant?: StatusType | 'default' | 'match'
    className?: string
    score?: number
}

export function Badge({ children, variant = 'default', className = '', score }: BadgeProps) {
    if (variant === 'match' && score !== undefined) {
        const color = score > 80
            ? 'text-emerald-300 bg-emerald-500/20 border-emerald-500/30 shadow-emerald-500/10'
            : score > 60
                ? 'text-amber-300 bg-amber-500/20 border-amber-500/30 shadow-amber-500/10'
                : 'text-slate-300 bg-slate-500/20 border-slate-500/30'

        return (
            <span
                className={`
                    inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border shadow-sm
                    ${color}
                    ${className}
                `}
            >
                {children}
            </span>
        )
    }

    const baseStyles = variant === 'default'
        ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/20'
        : statusStyles[variant as StatusType] || 'bg-indigo-500/20 text-indigo-300 border-indigo-500/20'

    return (
        <span
            className={`
                inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full border
                ${baseStyles}
                ${className}
            `}
        >
            {children}
        </span>
    )
}
