import { login } from './actions'
import Link from 'next/link'
import { SubmitButton } from '@/components/submit-button'
import { Logo } from '@/components/ui/Logo'

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ message?: string; error?: string }>
}) {
    const { message, error } = await searchParams

    return (
        <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 relative overflow-hidden z-10 w-full">
            {/* Stitch Background Gradients */}
            <div className="fixed inset-0 pointer-events-none"
                style={{
                    backgroundImage: `
                        radial-gradient(circle at 20% 30%, rgba(0, 91, 196, 0.15) 0%, transparent 50%),
                        radial-gradient(circle at 80% 70%, rgba(105, 246, 184, 0.1) 0%, transparent 50%)
                    `
                }}
            />

            <div className="relative z-20 w-full max-w-md space-y-8 glass-panel ghost-border rounded-3xl p-10 mt-10">
                <div className="text-center">
                    <div className="flex justify-center mb-6">
                        <Logo />
                    </div>
                    <h2 className="mt-4 text-2xl font-bold text-white tracking-tight">
                        Welcome Back
                    </h2>
                    <p className="mt-2 text-sm text-slate-400 font-light">
                        Sign in to access your intelligence dashboard
                    </p>
                </div>

                <form action={login} className="mt-8 space-y-6">
                    <div className="flex flex-col gap-5">
                        <div className="space-y-2">
                            <label htmlFor="email" className="block text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">
                                Email address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="appearance-none block w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-[var(--color-neon-teal)]/50 focus:shadow-[0_0_15px_rgba(105,246,184,0.1)] text-sm transition-all backdrop-blur-md"
                                placeholder="you@example.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="password" className="block text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="appearance-none block w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-[var(--color-neon-teal)]/50 focus:shadow-[0_0_15px_rgba(105,246,184,0.1)] text-sm transition-all backdrop-blur-md"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 pt-4">
                        <SubmitButton className="magnetic-btn w-full flex justify-center py-3.5 px-4 rounded-xl text-sm font-bold text-slate-950 bg-[var(--color-neon-teal)] hover:shadow-[0_0_20px_rgba(105,246,184,0.4)] transition-all duration-300">
                            Initialize Session
                        </SubmitButton>
                    </div>

                    <div className="text-center text-sm text-slate-400 font-medium">
                        Don&apos;t have an account?{' '}
                        <Link href="/signup" className="text-[var(--color-neon-teal)] hover:text-white transition-colors border-b border-transparent hover:border-white pb-0.5 ml-1 font-bold">
                            Request Access
                        </Link>
                    </div>

                    {error && (
                        <div className="rounded-xl bg-[var(--color-error)]/10 p-5 border border-[var(--color-error)]/20 shadow-sm">
                            <h3 className="text-xs font-bold text-[var(--color-error)] uppercase tracking-wider mb-1">Authentication Error</h3>
                            <p className="text-sm text-[var(--color-error)] font-light">{error}</p>
                        </div>
                    )}

                    {message && (
                        <div className="rounded-xl bg-[var(--color-neon-teal)]/10 p-5 border border-[var(--color-neon-teal)]/20 shadow-sm">
                            <h3 className="text-xs font-bold text-[var(--color-neon-teal)] uppercase tracking-wider mb-1">System Message</h3>
                            <p className="text-sm text-[var(--color-neon-teal)] font-light">{message}</p>
                        </div>
                    )}
                </form>
            </div>
        </div>
    )
}
