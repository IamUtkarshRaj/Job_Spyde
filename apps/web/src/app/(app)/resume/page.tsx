import { createClient } from '@/utils/supabase/server'
import { uploadResume } from './actions'

export default async function ResumePage() {
    const supabase = await createClient()
    const { data: resumes } = await supabase.from('resumes').select('*').order('created_at', { ascending: false }).limit(1)
    const currentResume = resumes && resumes.length > 0 ? resumes[0] : null

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-slate-100">Resume Management</h1>

            <div className="glass-card p-6">
                <h2 className="text-xl font-semibold text-slate-200 mb-4">Current Resume</h2>
                {currentResume ? (
                    <div className="space-y-2">
                        <p className="text-sm text-green-400 font-medium">Resume on file (uploaded {new Date(currentResume.created_at).toLocaleDateString()})</p>
                        {currentResume.storage_path && <p className="text-xs text-slate-500">Path: {currentResume.storage_path}</p>}
                        <div className="mt-4 p-4 bg-slate-800/40 rounded-xl border border-slate-700/20">
                            <h3 className="text-sm font-medium text-slate-300 mb-2">Extracted Text Preview:</h3>
                            <p className="text-sm font-mono whitespace-pre-wrap line-clamp-6 text-slate-400">{currentResume.resume_text}</p>
                        </div>
                    </div>
                ) : (
                    <p className="text-slate-500">No resume uploaded yet.</p>
                )}
            </div>

            <div className="glass-card p-6">
                <h2 className="text-xl font-semibold text-slate-200 mb-4">Upload New Resume</h2>
                <form action={async (formData) => {
                    'use server'
                    await uploadResume(formData)
                }} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Resume File (PDF/DOCX)</label>
                        <input
                            type="file"
                            name="resumeFile"
                            className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-500/10 file:text-indigo-300 hover:file:bg-indigo-500/20 file:transition-colors file:cursor-pointer"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Resume Text (Paste content here for better tailoring results)</label>
                        <textarea
                            name="resumeText"
                            rows={10}
                            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 text-sm transition-all"
                            placeholder="Paste your resume text here..."
                            defaultValue={currentResume?.resume_text || ''}
                            required
                        />
                    </div>

                    <button type="submit" className="gradient-bg text-white px-6 py-2.5 rounded-xl font-semibold text-sm shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:brightness-110 transition-all duration-200">
                        Save Resume
                    </button>
                </form>
            </div>
        </div>
    )
}
