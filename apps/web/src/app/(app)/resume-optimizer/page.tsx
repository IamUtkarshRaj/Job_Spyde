import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ResumeOptimizerClient } from './ResumeOptimizerClient'

export default async function ResumeOptimizerPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch profile
    const { data: dbProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
    
    // Create a mutable profile object
    let profile = dbProfile ? { ...dbProfile } : { 
        full_name: '', email: user.email || '', phone: '', location: '', 
        linkedin_url: '', github_url: '', professional_summary: '' 
    }

    // Fetch projects
    let { data: projects } = await supabase
        .from('profile_projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    // Fetch resume text
    const { data: resume } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

    // If no projects but resume exists, auto-extract
    if ((!projects || projects.length === 0) && resume?.resume_text) {
        try {
            const agentUrl = process.env.AGENT_URL || 'http://127.0.0.1:8000'
            const res = await fetch(`${agentUrl}/v1/resume/extract-all`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resume_text: resume.resume_text }),
                cache: 'no-store'
            })
            if (res.ok) {
                const data = await res.json()
                
                // Merge extracted profile if database profile is missing details
                if (data.profile) {
                    profile.full_name = profile.full_name || data.profile.full_name
                    profile.email = profile.email || data.profile.email
                    profile.phone = profile.phone || data.profile.phone
                    profile.location = profile.location || data.profile.location
                    profile.linkedin_url = profile.linkedin_url || data.profile.linkedin_url
                    profile.github_url = profile.github_url || data.profile.portfolio_url
                    profile.professional_summary = profile.professional_summary || data.profile.professional_summary
                }

                if (data.projects) {
                    projects = data.projects.map((p: any) => ({
                        ...p,
                        id: Math.random().toString(36).substr(2, 9) // temp id for UI
                    }))
                }
            }
        } catch (e) {
            console.error("Auto Resume Extraction Failed:", e)
        }
    }

    // Fetch saved jobs
    const { data: savedJobs } = await supabase
        .from('jobs')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['saved', 'prepared', 'interview', 'offer'])
        .order('created_at', { ascending: false })

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
