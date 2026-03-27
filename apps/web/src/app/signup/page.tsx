import Link from 'next/link'
import { signup } from '@/app/login/actions'
import { SubmitButton } from '@/components/submit-button'
import { Logo } from '@/components/ui/Logo'

export default async function SignupPage({
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
                        radial-gradient(circle at 80% 20%, rgba(0, 91, 196, 0.15) 0%, transparent 50%),
                        radial-gradient(circle at 20% 80%, rgba(105, 246, 184, 0.1) 0%, transparent 50%)
                    `
                }}
            />

            <div className="relative z-20 w-full max-w-md space-y-8 glass-panel ghost-border rounded-3xl p-10 mt-10">
                <div className="text-center">
                    <div className="flex justify-center mb-6">
                        <Logo />
                    </div>
                    <h2 className="mt-4 text-2xl font-bold text-white tracking-tight">
                        Secure Clearance
                    </h2>
                    <p className="mt-2 text-sm text-slate-400 font-light">
                        Create your intelligence profile
                    </p>
                </div>

                <form action={signup} className="mt-8 space-y-6">
                    <div className="flex flex-col gap-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label htmlFor="first_name" className="block text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">
                                    First Name
                                </label>
                                <input
                                    id="first_name"
                                    name="first_name"
                                    type="text"
                                    autoComplete="given-name"
                                    required
                                    className="appearance-none block w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-[var(--color-neon-teal)]/50 focus:shadow-[0_0_15px_rgba(105,246,184,0.1)] text-sm transition-all backdrop-blur-md"
                                    placeholder="John"
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="last_name" className="block text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">
                                    Last Name
                                </label>
                                <input
                                    id="last_name"
                                    name="last_name"
                                    type="text"
                                    autoComplete="family-name"
                                    required
                                    className="appearance-none block w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-[var(--color-neon-teal)]/50 focus:shadow-[0_0_15px_rgba(105,246,184,0.1)] text-sm transition-all backdrop-blur-md"
                                    placeholder="Doe"
                                />
                            </div>
                        </div>

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
                                autoComplete="new-password"
                                required
                                className="appearance-none block w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-[var(--color-neon-teal)]/50 focus:shadow-[0_0_15px_rgba(105,246,184,0.1)] text-sm transition-all backdrop-blur-md"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 pt-4">
                        <SubmitButton className="magnetic-btn w-full flex justify-center py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-white/10 hover:bg-white/15 border border-white/10 shadow-[0_4px_20px_rgba(133,173,255,0.2)] transition-all duration-300">
                            Create Clearance
                        </SubmitButton>
                    </div>

                    <div className="text-center text-sm text-slate-400 font-medium">
                        Already have access?{' '}
                        <Link href="/login" className="text-[var(--color-neon-teal)] hover:text-white transition-colors border-b border-transparent hover:border-white pb-0.5 ml-1 font-bold">
                            Initialize Session
                        </Link>
                    </div>

                    {error && (
                        <div className="rounded-xl bg-[var(--color-error)]/10 p-5 border border-[var(--color-error)]/20 shadow-sm">
                            <h3 className="text-xs font-bold text-[var(--color-error)] uppercase tracking-wider mb-1">Authorization Error</h3>
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
