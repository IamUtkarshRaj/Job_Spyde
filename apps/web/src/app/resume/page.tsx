import { createClient } from '@/utils/supabase/server'
import { uploadResume } from './actions'

export default async function ResumePage() {
    const supabase = await createClient()
    const { data: resumes } = await supabase.from('resumes').select('*').order('created_at', { ascending: false }).limit(1)
    const currentResume = resumes && resumes.length > 0 ? resumes[0] : null

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold">Resume Management</h1>

            <div className="p-6 border rounded-lg shadow-sm bg-card">
                <h2 className="text-xl font-semibold mb-4">Current Resume</h2>
                {currentResume ? (
                    <div className="space-y-2">
                        <p className="text-sm text-green-600 font-medium">Resume on file (uploaded {new Date(currentResume.created_at).toLocaleDateString()})</p>
                        {currentResume.storage_path && <p className="text-xs text-muted-foreground">Path: {currentResume.storage_path}</p>}
                        <div className="mt-4 p-4 bg-muted/50 rounded-md">
                            <h3 className="text-sm font-medium mb-2">Extracted Text Preview:</h3>
                            <p className="text-sm font-mono whitespace-pre-wrap line-clamp-6">{currentResume.resume_text}</p>
                        </div>
                    </div>
                ) : (
                    <p className="text-muted-foreground">No resume uploaded yet.</p>
                )}
            </div>

            <div className="p-6 border rounded-lg shadow-sm bg-card">
                <h2 className="text-xl font-semibold mb-4">Upload New Resume</h2>
                <form action={async (formData) => {
                    'use server'
                    await uploadResume(formData)
                }} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Resume File (PDF/DOCX)</label>
                        <input type="file" name="resumeFile" className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Resume Text (Paste content here for better tailoring results)</label>
                        <textarea
                            name="resumeText"
                            rows={10}
                            className="w-full rounded-md border p-3 bg-inherit"
                            placeholder="Paste your resume text here..."
                            defaultValue={currentResume?.resume_text || ''}
                            required
                        />
                    </div>

                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium">
                        Save Resume
                    </button>
                </form>
            </div>
        </div>
    )
}
