type StatusType = 'discovered' | 'saved' | 'prepared' | 'applied' | 'interview' | 'offer' | 'rejected' | 'ghosted'

const statusStyles: Record<StatusType, string> = {
    discovered: 'bg-white/5 text-slate-400 border-white/10',
    saved: 'bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)] border-[var(--color-accent-primary)]/20',
    prepared: 'bg-[var(--color-warning)]/10 text-[var(--color-warning)] border-[var(--color-warning)]/20',
    applied: 'bg-[var(--color-success)]/10 text-[var(--color-success)] border-[var(--color-success)]/20',
    interview: 'bg-[var(--color-soft-violet)]/10 text-[var(--color-soft-violet)] border-[var(--color-soft-violet)]/20',
    offer: 'bg-[var(--color-neon-teal)]/10 text-[var(--color-neon-teal)] border-[var(--color-neon-teal)]/20',
    rejected: 'bg-[var(--color-error)]/10 text-[var(--color-error)] border-[var(--color-error)]/20',
    ghosted: 'bg-white/5 text-slate-500 border-white/10',
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
            ? 'text-[var(--color-success)] bg-[var(--color-success)]/10 border-[var(--color-success)]/30'
            : score > 60
                ? 'text-[var(--color-warning)] bg-[var(--color-warning)]/10 border-[var(--color-warning)]/30'
                : 'text-slate-400 bg-white/5 border-white/10'

        return (
            <span
                className={`
                    inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border backdrop-blur-sm
                    ${color}
                    ${className}
                `}
            >
                {children}
            </span>
        )
    }

    const baseStyles = variant === 'default'
        ? 'bg-[var(--color-neon-teal)]/10 text-[var(--color-neon-teal)] border-[var(--color-neon-teal)]/20'
        : statusStyles[variant as StatusType] || 'bg-[var(--color-neon-teal)]/10 text-[var(--color-neon-teal)] border-[var(--color-neon-teal)]/20'

    return (
        <span
            className={`
                inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full border backdrop-blur-sm
                ${baseStyles}
                ${className}
            `}
        >
            {children}
        </span>
    )
}
