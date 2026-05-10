import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ResumeOptimizerClient } from './ResumeOptimizerClient'

export default async function ResumeOptimizerPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch all required data in parallel
    const [
        { data: dbProfile },
        { data: initialProjects },
        { data: resume },
        { data: savedJobs }
    ] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('profile_projects').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('resumes').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).single(),
        supabase.from('jobs').select('*').eq('user_id', user.id).in('status', ['saved', 'prepared', 'interview', 'offer']).order('created_at', { ascending: false })
    ])
    
    // Create a mutable profile object
    let profile = dbProfile ? { ...dbProfile } : { 
        full_name: '', email: user.email || '', phone: '', location: '', 
        linkedin_url: '', github_url: '', professional_summary: '' 
    }

    let projects = initialProjects || []

    // NOTE: Auto-extraction on page load was blocking rendering for up to 2 minutes. 
    // This has been removed to ensure the page loads instantly.
    // If auto-extraction is needed, it should be triggered via a client-side button 
    // or run entirely in the background via webhooks/queue.

    return (
        <div className="max-w-[1400px] mx-auto space-y-8 relative z-10 w-full pb-20">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter aurora-text py-1">Resume Optimizer</h1>
                <p className="text-slate-400 text-[15px] font-medium max-w-2xl">
                    Optimize your resume for specific job descriptions and improve your matching score.
                </p>
            </div>

            <ResumeOptimizerClient 
                initialProfile={profile} 
                initialProjects={projects || []}
                resumeText={resume?.resume_text || ''}
                savedJobs={savedJobs || []}
            />
        </div>
    )
}
