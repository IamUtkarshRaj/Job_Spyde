interface CardProps {
    children: React.ReactNode
    className?: string
    glow?: boolean
    hover?: boolean
}

export function Card({ children, className = '', glow = false, hover = true }: CardProps) {
    return (
        <div
            className={`
                glass-panel
                ${hover ? 'hover:-translate-y-1' : ''}
                ${glow ? 'shadow-[0_0_30px_var(--color-accent-glow)]' : ''}
                p-6
                ${className}
            `}
        >
            {children}
        </div>
    )
}

export function CardHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return <div className={`mb-4 flex flex-col gap-1 ${className}`}>{children}</div>
}

export function CardTitle({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return <h3 className={`text-card text-white ${className}`}>{children}</h3>
}

export function CardContent({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return <div className={`text-slate-400 text-sm leading-relaxed ${className}`}>{children}</div>
}
