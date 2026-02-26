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
                glass-card
                ${hover ? 'glass-card-lift' : ''}
                ${glow ? 'glow-indigo' : ''}
                p-6
                ${className}
            `}
        >
            {children}
        </div>
    )
}

export function CardHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return <div className={`mb-4 ${className}`}>{children}</div>
}

export function CardTitle({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return <h3 className={`text-lg font-semibold text-slate-100 ${className}`}>{children}</h3>
}

export function CardContent({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return <div className={`text-slate-400 ${className}`}>{children}</div>
}
