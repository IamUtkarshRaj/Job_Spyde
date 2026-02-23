import { savePreferences } from './actions'

export default function OnboardingPage() {
    async function handleSave(formData: FormData) {
        'use server'
        await savePreferences(formData)
    }

    return (
        <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
            <h1 className="text-2xl font-bold mb-4">Set Your Preferences</h1>
            <form action={handleSave} className="animate-in flex-1 flex flex-col w-full justify-center gap-4 text-foreground">

                <div>
                    <label className="text-md font-medium" htmlFor="roles">Target Roles (comma separated)</label>
                    <input
                        className="rounded-md px-4 py-2 bg-inherit border w-full mt-1"
                        name="roles"
                        placeholder="Software Engineer, Product Manager"
                        required
                        defaultValue="Software Engineer"
                    />
                </div>

                <div>
                    <label className="text-md font-medium" htmlFor="locations">Locations (comma separated)</label>
                    <input
                        className="rounded-md px-4 py-2 bg-inherit border w-full mt-1"
                        name="locations"
                        placeholder="San Francisco, New York, Remote"
                        required
                        defaultValue="San Francisco"
                    />
                </div>

                <div>
                    <label className="flex items-center space-x-2">
                        <input type="checkbox" name="remote" className="rounded border-gray-300" defaultChecked />
                        <span>Open to Remote?</span>
                    </label>
                </div>

                <div>
                    <label className="text-md font-medium" htmlFor="keywords">Keywords to Include (comma separated)</label>
                    <input
                        className="rounded-md px-4 py-2 bg-inherit border w-full mt-1"
                        name="keywords"
                        placeholder="React, Python, AWS"
                        defaultValue="React, Python"
                    />
                </div>

                <button
                    type="submit"
                    className="bg-blue-600 rounded-md px-4 py-2 text-white font-medium hover:bg-blue-700 transition"
                >
                    Save & Continue to Dashboard
                </button>
            </form>
        </div>
    )
}
