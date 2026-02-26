import { savePreferences } from './actions'
import { Logo } from '@/components/ui/Logo'

export default function OnboardingPage() {
    async function handleSave(formData: FormData) {
        'use server'
        await savePreferences(formData)
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 relative">
            {/* Aurora blobs */}
            <div className="aurora-blob w-[350px] h-[350px] bg-indigo-600/15 top-[15%] left-[10%]" />
            <div className="aurora-blob-alt w-[250px] h-[250px] bg-cyan-600/10 bottom-[20%] right-[10%]" />

            <div className="relative z-10 w-full max-w-md glass-card p-10">
                <div className="flex justify-center mb-6">
                    <Logo />
                </div>
                <h1 className="text-2xl font-bold text-slate-100 mb-2 text-center">Set Your Preferences</h1>
                <p className="text-sm text-slate-500 text-center mb-8">Help us find the right jobs for you.</p>

                <form action={handleSave} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="roles">Target Roles (comma separated)</label>
                        <input
                            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 text-sm transition-all"
                            name="roles"
                            placeholder="Software Engineer, Product Manager"
                            required
                            defaultValue="Software Engineer"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="locations">Locations (comma separated)</label>
                        <input
                            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 text-sm transition-all"
                            name="locations"
                            placeholder="San Francisco, New York, Remote"
                            required
                            defaultValue="San Francisco"
                        />
                    </div>

                    <div>
                        <label className="flex items-center gap-2.5 cursor-pointer">
                            <input
                                type="checkbox"
                                name="remote"
                                className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-indigo-500/30 focus:ring-offset-0"
                                defaultChecked
                            />
                            <span className="text-sm text-slate-300">Open to Remote?</span>
                        </label>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="keywords">Keywords to Include (comma separated)</label>
                        <input
                            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 text-sm transition-all"
                            name="keywords"
                            placeholder="React, Python, AWS"
                            defaultValue="React, Python"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white gradient-bg shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:brightness-110 transition-all duration-200"
                    >
                        Save & Continue to Dashboard
                    </button>
                </form>
            </div>
        </div>
    )
}
