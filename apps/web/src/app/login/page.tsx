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
        <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 relative">
            {/* Aurora blobs */}
            <div className="aurora-blob w-[400px] h-[400px] bg-indigo-600/15 top-[10%] left-[-5%]" />
            <div className="aurora-blob-alt w-[300px] h-[300px] bg-blue-600/10 bottom-[10%] right-[5%]" />

            <div className="relative z-10 w-full max-w-md space-y-8 glass-card p-10">
                <div className="text-center">
                    <div className="flex justify-center mb-4">
                        <Logo />
                    </div>
                    <h2 className="mt-4 text-lg font-medium text-slate-400">
                        Sign in to your account
                    </h2>
                </div>

                <form action={login} className="mt-8 space-y-6">
                    <div className="flex flex-col gap-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">
                                Email address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="appearance-none block w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 text-sm transition-all"
                                placeholder="you@example.com"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="appearance-none block w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 text-sm transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 pt-2">
                        <SubmitButton className="w-full flex justify-center py-3 px-4 rounded-xl text-sm font-semibold text-white gradient-bg shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:brightness-110 transition-all duration-200">
                            Sign in
                        </SubmitButton>
                    </div>

                    <div className="text-center text-sm text-slate-500">
                        Don&apos;t have an account?{' '}
                        <Link href="/signup" className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                            Sign up
                        </Link>
                    </div>

                    {error && (
                        <div className="rounded-xl bg-red-500/10 p-4 border border-red-500/20">
                            <h3 className="text-sm font-medium text-red-400">Authentication Error</h3>
                            <p className="mt-1 text-sm text-red-400/80">{error}</p>
                        </div>
                    )}

                    {message && (
                        <div className="rounded-xl bg-green-500/10 p-4 border border-green-500/20">
                            <h3 className="text-sm font-medium text-green-400">Verify Email</h3>
                            <p className="mt-1 text-sm text-green-400/80">{message}</p>
                        </div>
                    )}
                </form>
            </div>
        </div>
    )
}
