'use client'

import { useState } from 'react'
import { SavedJobsSidebar } from './SavedJobsSidebar'
import { ResumeForm } from './ResumeForm'
import { OptimizedAnalysis } from './OptimizedAnalysis'
import { OptimizingLoader } from './OptimizingLoader'
import { OptimizedResumePreview } from './OptimizedResumePreview'
import { ResumePDFViewer } from './ResumePDFViewer'

interface ResumeOptimizerClientProps {
    initialProfile: any
    initialProjects: any[]
    resumeText: string
    savedJobs: any[]
}

type WorkflowStep = 'form' | 'optimizing' | 'preview' | 'pdf'

export function ResumeOptimizerClient({ initialProfile, initialProjects, resumeText, savedJobs }: ResumeOptimizerClientProps) {
    const [selectedJob, setSelectedJob] = useState<any>(null)
    const [jobDescription, setJobDescription] = useState('')
    const [profile, setProfile] = useState(initialProfile)
    const [projects, setProjects] = useState(initialProjects)
    
    // Extended resume extraction states
    const [experience, setExperience] = useState<any[]>([])
    const [education, setEducation] = useState<any[]>([])
    const [skills, setSkills] = useState<string>('')
    const [certifications, setCertifications] = useState<any[]>([])
    const [isExtracting, setIsExtracting] = useState(false)

    // Optimization workflow states
    const [workflowStep, setWorkflowStep] = useState<WorkflowStep>('form')
    const [isOptimizing, setIsOptimizing] = useState(false)
    const [optimizedData, setOptimizedData] = useState<any>(null)
    const [optimizeError, setOptimizeError] = useState<string | null>(null)

    const handleAutoExtract = async () => {
        if (!resumeText) return;
        setIsExtracting(true);
        try {
            const res = await fetch('http://localhost:8000/v1/resume/extract-all', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resume_text: resumeText })
            });
            const data = await res.json();
            
            if (data.profile) setProfile(data.profile);
            if (data.projects && data.projects.length > 0) setProjects(data.projects);
            if (data.experience) setExperience(data.experience);
            if (data.education) setEducation(data.education);
            if (data.skills) setSkills(data.skills);
            if (data.certifications) setCertifications(data.certifications);
            
        } catch (error) {
            console.error("Extraction failed:", error);
        } finally {
            setIsExtracting(false);
        }
    }

    const handleOptimize = async () => {
        let jd = jobDescription || selectedJob?.description || ''
        const jTitle = selectedJob?.title || 'Target Role'
        const jCompany = selectedJob?.company || ''

        // If a saved job is selected but has no/short description, build one from metadata
        if (selectedJob && jd.length < 50) {
            const parts = []
            if (selectedJob.title) parts.push(`Job Title: ${selectedJob.title}`)
            if (selectedJob.company) parts.push(`Company: ${selectedJob.company}`)
            if (selectedJob.location) parts.push(`Location: ${selectedJob.location}`)
            if (selectedJob.source) parts.push(`Source: ${selectedJob.source}`)
            if (parts.length > 0) {
                jd = parts.join('\n') + (jd ? '\n\nDescription:\n' + jd : '')
            }
        }

        if (!jd || jd.length < 10) {
            setOptimizeError('Please provide a job description (paste it or select a saved job).')
            return
        }

        setOptimizeError(null)
        setIsOptimizing(true)
        setWorkflowStep('optimizing')

        try {
            const payload = {
                profile: {
                    full_name: profile?.full_name || '',
                    email: profile?.email || '',
                    phone: profile?.phone || '',
                    location: profile?.location || '',
                    linkedin_url: profile?.linkedin_url || '',
                    portfolio_url: profile?.portfolio_url || profile?.github_url || '',
                    professional_summary: profile?.professional_summary || '',
                },
                experience: experience.map(e => ({
                    company: e.company || '',
                    title: e.title || '',
                    dates: e.dates || '',
                    description: e.description || '',
                })),
                education: education.map(e => ({
                    school: e.school || e.institution_name || '',
                    degree: e.degree || '',
                    dates: e.dates || '',
                    details: e.details || '',
                })),
                projects: projects.map(p => ({
                    name: p.name || p.project_name || '',
                    url: p.url || p.link || '',
                    technologies: p.technologies || '',
                    description: p.description || '',
                })),
                skills: skills,
                certifications: certifications.map(c => ({
                    name: c.name || '',
                    issuer: c.issuer || '',
                })),
                job_description: jd,
                job_title: jTitle,
                company: jCompany,
            }

            const res = await fetch('http://localhost:8000/v1/resume/optimize-structured', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })

            if (!res.ok) {
                throw new Error(`Server error: ${res.status}`)
            }

            const data = await res.json()
            
            if (data.error) {
                console.warn('Optimization returned with error:', data.error)
            }

            setOptimizedData(data)
            setWorkflowStep('preview')

        } catch (error: any) {
            console.error('Optimization failed:', error)
            setOptimizeError(error.message || 'Optimization failed. Please try again.')
            setWorkflowStep('form')
        } finally {
            setIsOptimizing(false)
        }
    }

    const handleBackToForm = () => {
        setWorkflowStep('form')
    }

    const handleReOptimize = () => {
        handleOptimize()
    }

    const handleGeneratePDF = () => {
        setWorkflowStep('pdf')
    }

    const handleClosePDF = () => {
        setWorkflowStep('preview')
    }

    // ── Render based on workflow step ──
    if (workflowStep === 'optimizing') {
        return <OptimizingLoader />
    }

    if (workflowStep === 'pdf' && optimizedData) {
        return (
            <ResumePDFViewer
                data={optimizedData}
                profileName={optimizedData?.optimized_profile?.full_name || profile?.full_name || 'resume'}
                company={selectedJob?.company || ''}
                onClose={handleClosePDF}
            />
        )
    }

    if (workflowStep === 'preview' && optimizedData) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-12">
                    <OptimizedResumePreview
                        optimizedData={optimizedData}
                        originalData={{
                            profile,
                            experience,
                            education,
                            projects,
                            skills,
                            certifications,
                        }}
                        onBack={handleBackToForm}
                        onReOptimize={handleReOptimize}
                        onGeneratePDF={handleGeneratePDF}
                        jobTitle={selectedJob?.title || 'Target Role'}
                        company={selectedJob?.company || ''}
                    />
                </div>
            </div>
        )
    }

    // ── Default: Form step ──
    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Form & Analysis */}
            <div className="lg:col-span-8 space-y-8">
                
                <div className="flex justify-end">
                    <button 
                        onClick={handleAutoExtract}
                        disabled={isExtracting || !resumeText}
                        className="px-6 py-3 bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)] border border-[var(--color-accent-primary)]/30 rounded-xl font-bold tracking-widest text-xs uppercase hover:bg-[var(--color-accent-primary)]/20 transition-all disabled:opacity-50 flex items-center gap-2 shadow-[0_0_15px_rgba(var(--color-accent-primary-rgb),0.1)]"
                    >
                        {isExtracting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                Extracting...
                            </>
                        ) : (
                            'Auto-Extract from Resume'
                        )}
                    </button>
                </div>

                {/* Error display */}
                {optimizeError && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm font-medium">
                        {optimizeError}
                    </div>
                )}

                <div className="flex flex-col gap-8">
                    {/* Resume Details Form */}
                    <ResumeForm 
                        profile={profile} 
                        setProfile={setProfile}
                        projects={projects}
                        setProjects={setProjects}
                        experience={experience}
                        setExperience={setExperience}
                        education={education}
                        setEducation={setEducation}
                        skills={skills}
                        setSkills={setSkills}
                        certifications={certifications}
                        setCertifications={setCertifications}
                        resumeText={resumeText}
                    />

                    {/* Job Description Analysis */}
                    <OptimizedAnalysis 
                        jobDescription={jobDescription} 
                        setJobDescription={setJobDescription}
                        selectedJob={selectedJob}
                        onOptimize={handleOptimize}
                        isOptimizing={isOptimizing}
                    />
                </div>
            </div>

            {/* Right Column: Saved Jobs */}
            <div className="lg:col-span-4 sticky top-28">
                <SavedJobsSidebar 
                    savedJobs={savedJobs} 
                    selectedJob={selectedJob} 
                    onSelectJob={(job) => {
                        setSelectedJob(job)
                        setJobDescription(job.description || '')
                    }} 
                />
            </div>
        </div>
    )
}
