import { savePreferences } from './actions'
import { Logo } from '@/components/ui/Logo'

export default function OnboardingPage() {
    async function handleSave(formData: FormData) {
        'use server'
        await savePreferences(formData)
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center px-4 py-20 relative overflow-hidden z-10 w-full">
            {/* Stitch Background Gradients */}
            <div className="fixed inset-0 pointer-events-none"
                style={{
                    backgroundImage: `
                        radial-gradient(circle at 30% 20%, rgba(0, 91, 196, 0.15) 0%, transparent 50%),
                        radial-gradient(circle at 70% 80%, rgba(105, 246, 184, 0.1) 0%, transparent 50%)
                    `
                }}
            />

            <div className="relative z-20 w-full max-w-xl glass-panel ghost-border rounded-3xl p-10 mt-10">
                <div className="flex justify-center mb-6">
                    <Logo />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2 text-center">Set Your Parameters</h1>
                <p className="text-sm text-slate-400 text-center mb-10 font-light">Input your intelligence criteria for optimal AI matching.</p>

                <form action={handleSave} className="space-y-6">
                    <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest pl-1" htmlFor="roles">Target Roles (comma separated)</label>
                        <input
                            className="appearance-none block w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-[var(--color-neon-teal)]/50 focus:shadow-[0_0_15px_rgba(105,246,184,0.1)] text-sm transition-all backdrop-blur-md"
                            name="roles"
                            placeholder="Software Engineer, Product Manager"
                            required
                            defaultValue="Software Engineer"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest pl-1" htmlFor="locations">Locations (comma separated)</label>
                        <input
                            className="appearance-none block w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-[var(--color-neon-teal)]/50 focus:shadow-[0_0_15px_rgba(105,246,184,0.1)] text-sm transition-all backdrop-blur-md"
                            name="locations"
                            placeholder="San Francisco, New York, Remote"
                            required
                            defaultValue="San Francisco"
                        />
                    </div>

                    <div className="pt-2">
                        <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                            <input
                                type="checkbox"
                                name="remote"
                                className="w-4 h-4 rounded border-white/10 bg-black text-[var(--color-neon-teal)] focus:ring-[var(--color-neon-teal)]/30 focus:ring-offset-0"
                                defaultChecked
                            />
                            <span className="text-sm font-semibold text-white tracking-wide">Open to Global / Remote Work</span>
                        </label>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest pl-1" htmlFor="experience_level">Carrier Phase</label>
                        <select
                            name="experience_level"
                            className="appearance-none block w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[var(--color-neon-teal)]/50 focus:shadow-[0_0_15px_rgba(105,246,184,0.1)] text-sm transition-all backdrop-blur-md"
                            required
                        >
                            <option value="Entry Level" className="bg-[var(--color-bg-primary)]">Entry Phase (0-2 years)</option>
                            <option value="Mid Level" className="bg-[var(--color-bg-primary)]">Mid Phase (2-5 years)</option>
                            <option value="Senior Level" className="bg-[var(--color-bg-primary)]">Senior Phase (5+ years)</option>
                            <option value="Lead/Management" className="bg-[var(--color-bg-primary)]">Lead / Administrative</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest pl-1" htmlFor="keywords">Expertise Signals (comma separated)</label>
                        <input
                            className="appearance-none block w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-[var(--color-neon-teal)]/50 focus:shadow-[0_0_15px_rgba(105,246,184,0.1)] text-sm transition-all backdrop-blur-md"
                            name="keywords"
                            placeholder="React, Python, AWS"
                            defaultValue="React, Python"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest pl-1" htmlFor="resume_text">Core Memory Payload (Paste Resume)</label>
                        <textarea
                            name="resume_text"
                            className="appearance-none block w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-[var(--color-neon-teal)]/50 focus:shadow-[0_0_15px_rgba(105,246,184,0.1)] text-sm transition-all backdrop-blur-md min-h-[180px] font-light leading-relaxed"
                            placeholder="Paste your raw resume extract for the AI semantic engine..."
                            required
                        />
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            className="magnetic-btn w-full flex justify-center py-3.5 px-4 rounded-xl text-sm font-bold text-slate-950 bg-[var(--color-neon-teal)] hover:shadow-[0_0_20px_rgba(105,246,184,0.4)] transition-all duration-300"
                        >
                            Commit Preferences to Core
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
