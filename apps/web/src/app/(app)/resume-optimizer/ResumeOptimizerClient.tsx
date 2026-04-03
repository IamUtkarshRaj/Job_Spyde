'use client'

import { useState } from 'react'
import { SavedJobsSidebar } from './SavedJobsSidebar'
import { ResumeForm } from './ResumeForm'
import { OptimizedAnalysis } from './OptimizedAnalysis'

interface ResumeOptimizerClientProps {
    initialProfile: any
    initialProjects: any[]
    resumeText: string
    savedJobs: any[]
}

export function ResumeOptimizerClient({ initialProfile, initialProjects, resumeText, savedJobs }: ResumeOptimizerClientProps) {
    const [selectedJob, setSelectedJob] = useState<any>(null)
    const [jobDescription, setJobDescription] = useState('')
    const [profile, setProfile] = useState(initialProfile)
    const [projects, setProjects] = useState(initialProjects)

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Form & Analysis */}
            <div className="lg:col-span-8 space-y-8">
                <div className="flex flex-col gap-8">
                    {/* Resume Details Form */}
                    <ResumeForm 
                        profile={profile} 
                        setProfile={setProfile}
                        projects={projects}
                        setProjects={setProjects}
                        resumeText={resumeText}
                    />

                    {/* Job Description Analysis (Bottom or Middle depending on layout) */}
                    <OptimizedAnalysis 
                        jobDescription={jobDescription} 
                        setJobDescription={setJobDescription}
                        selectedJob={selectedJob}
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
