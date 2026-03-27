import { forwardRef } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant
    size?: ButtonSize
}

const variantClasses: Record<ButtonVariant, string> = {
    primary:
        'btn-primary',
    secondary:
        'bg-slate-800/50 border border-slate-700 text-slate-300 hover:border-indigo-500/30 hover:text-slate-100 hover:bg-slate-800/80 focus-visible:ring-slate-500',
    ghost:
        'bg-transparent text-slate-400 hover:text-slate-100 hover:bg-slate-800/40 focus-visible:ring-slate-500',
    danger:
        'bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:border-red-500/40 focus-visible:ring-red-500',
}

const sizeClasses: Record<ButtonSize, string> = {
    sm: 'text-xs px-3 py-1.5 rounded-lg gap-1.5',
    md: 'text-sm px-4 py-2.5 rounded-xl gap-2',
    lg: 'text-base px-6 py-3 rounded-xl gap-2',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ variant = 'primary', size = 'md', className = '', children, disabled, ...props }, ref) => {
        return (
            <button
                ref={ref}
                disabled={disabled}
                className={`
                    inline-flex items-center justify-center font-medium
                    transition-all duration-200 ease-out
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0e1a]
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
                    ${variantClasses[variant]}
                    ${sizeClasses[size]}
                    ${className}
                `}
                {...props}
            >
                {children}
            </button>
        )
    }
)

Button.displayName = 'Button'
