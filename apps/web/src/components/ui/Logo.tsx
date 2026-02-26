import Link from 'next/link'

export function Logo({ size = 'default' }: { size?: 'small' | 'default' | 'large' }) {
    const sizes = {
        small: { text: 'text-lg', icon: 16 },
        default: { text: 'text-xl', icon: 20 },
        large: { text: 'text-3xl', icon: 28 },
    }

    const s = sizes[size]

    return (
        <Link href="/" className="flex items-center gap-2 group" aria-label="Job Spyde Home">
            {/* Logo Mark — 3 connected nodes */}
            <svg
                width={s.icon}
                height={s.icon}
                viewBox="0 0 28 28"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="shrink-0"
            >
                {/* Connecting lines */}
                <line x1="14" y1="4" x2="5" y2="22" stroke="url(#logo-gradient)" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="14" y1="4" x2="23" y2="22" stroke="url(#logo-gradient)" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="5" y1="22" x2="23" y2="22" stroke="url(#logo-gradient)" strokeWidth="1.5" strokeLinecap="round" />
                {/* Nodes */}
                <circle cx="14" cy="4" r="3" fill="url(#logo-gradient)" />
                <circle cx="5" cy="22" r="3" fill="url(#logo-gradient)" />
                <circle cx="23" cy="22" r="3" fill="url(#logo-gradient)" />
                <defs>
                    <linearGradient id="logo-gradient" x1="0" y1="0" x2="28" y2="28">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                </defs>
            </svg>
            {/* Wordmark */}
            <span className={`${s.text} font-bold tracking-tight`}>
                <span className="text-slate-100">Job</span>
                <span className="gradient-text"> Spyde</span>
            </span>
        </Link>
    )
}
