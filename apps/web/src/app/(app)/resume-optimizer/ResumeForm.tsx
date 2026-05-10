'use client'

import { FileText, Plus, Trash2, Link as LinkIcon, Phone, MapPin, Mail, User, Briefcase, Award, Zap } from 'lucide-react'

interface ResumeFormProps {
    profile: any
    setProfile: (p: any) => void
    projects: any[]
    setProjects: (p: any[]) => void
    experience?: any[]
    setExperience?: (e: any[]) => void
    education?: any[]
    setEducation?: (e: any[]) => void
    skills?: string
    setSkills?: (s: string) => void
    certifications?: any[]
    setCertifications?: (c: any[]) => void
    resumeText: string
}

export function ResumeForm({ 
    profile, setProfile, 
    projects, setProjects, 
    experience = [], setExperience = () => {},
    education = [], setEducation = () => {},
    skills = '', setSkills = () => {},
    certifications = [], setCertifications = () => {},
    resumeText 
}: ResumeFormProps) {
    
    const handleAddProject = () => {
        setProjects([
            { id: Math.random().toString(36).substr(2, 9), name: '', url: '', technologies: '', description: '' },
            ...projects
        ])
    }

    const handleRemoveProject = (id: string) => {
        setProjects(projects.filter(p => (p.id || p.name) !== id))
    }

    const handleAddExperience = () => {
        setExperience([
            { id: Math.random().toString(36).substr(2, 9), company: '', title: '', dates: '', description: '' },
            ...experience
        ])
    }

    const handleRemoveExperience = (id: string) => {
        setExperience(experience.filter(e => (e.id || e.company) !== id))
    }

    const handleAddEducation = () => {
        setEducation([
            { id: Math.random().toString(36).substr(2, 9), school: '', degree: '', dates: '', details: '' },
            ...education
        ])
    }

    const handleRemoveEducation = (id: string) => {
        setEducation(education.filter(e => (e.id || e.school) !== id))
    }

    const handleAddCertification = () => {
        setCertifications([
            { id: Math.random().toString(36).substr(2, 9), name: '', issuer: '' },
            ...certifications
        ])
    }

    const handleRemoveCertification = (id: string) => {
        setCertifications(certifications.filter(c => (c.id || c.name) !== id))
    }

    return (
        <div className="space-y-8">
            <div className="glass-panel ghost-border rounded-3xl p-8 relative overflow-hidden group">
                <div className="absolute -top-32 -right-32 w-96 h-96 bg-[var(--color-accent-primary)]/5 blur-[80px] rounded-full pointer-events-none group-hover:bg-[var(--color-accent-primary)]/10 transition-colors duration-1000" />

                <div className="flex justify-between items-center mb-8 relative z-10">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <User size={20} className="text-[var(--color-accent-primary)]" /> Personal Information
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">Core experiential parameters</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            Full Name
                        </label>
                        <input 
                            type="text" 
                            className="w-full px-4 py-3 bg-black/30 border border-white/5 rounded-xl text-slate-300 focus:outline-none focus:border-[var(--color-accent-primary)]/30 text-sm"
                            value={profile?.full_name || ''}
                            onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            Email
                        </label>
                        <input 
                            type="email" 
                            className="w-full px-4 py-3 bg-black/30 border border-white/5 rounded-xl text-slate-300 focus:outline-none focus:border-[var(--color-accent-primary)]/30 text-sm"
                            value={profile?.email || ''}
                            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            Phone
                        </label>
                        <input 
                            type="text" 
                            className="w-full px-4 py-3 bg-black/30 border border-white/5 rounded-xl text-slate-300 focus:outline-none focus:border-[var(--color-accent-primary)]/30 text-sm"
                            value={profile?.phone || ''}
                            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            Location
                        </label>
                        <input 
                            type="text" 
                            className="w-full px-4 py-3 bg-black/30 border border-white/5 rounded-xl text-slate-300 focus:outline-none focus:border-[var(--color-accent-primary)]/30 text-sm"
                            value={profile?.location || ''}
                            onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            LinkedIn
                        </label>
                        <input 
                            type="text" 
                            className="w-full px-4 py-3 bg-black/30 border border-white/5 rounded-xl text-slate-300 focus:outline-none focus:border-[var(--color-accent-primary)]/30 text-sm"
                            value={profile?.linkedin_url || ''}
                            onChange={(e) => setProfile({ ...profile, linkedin_url: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            Portfolio / Website
                        </label>
                        <input 
                            type="text" 
                            className="w-full px-4 py-3 bg-black/30 border border-white/5 rounded-xl text-slate-300 focus:outline-none focus:border-[var(--color-accent-primary)]/30 text-sm"
                            value={profile?.portfolio_url || profile?.github_url || ''}
                            onChange={(e) => setProfile({ ...profile, portfolio_url: e.target.value })}
                        />
                    </div>
                </div>

                <div className="mt-8 relative z-10">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                        Professional Summary
                    </label>
                    <textarea 
                        rows={5}
                        className="w-full px-4 py-3 bg-black/30 border border-white/5 rounded-xl text-slate-300 focus:outline-none focus:border-[var(--color-accent-primary)]/30 text-sm leading-relaxed resize-none"
                        value={profile?.professional_summary || ''}
                        onChange={(e) => setProfile({ ...profile, professional_summary: e.target.value })}
                    />
                </div>
            </div>

            {/* Experience Section */}
            <div className="glass-panel ghost-border rounded-3xl p-8 relative overflow-hidden group">
                <div className="flex justify-between items-center mb-8 relative z-10">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Briefcase size={20} className="text-[var(--color-neon-purple)]" /> Experience
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">Professional work history</p>
                    </div>
                    <button 
                        onClick={handleAddExperience}
                        className="p-2 rounded-xl bg-[var(--color-neon-purple)]/10 text-[var(--color-neon-purple)] hover:bg-[var(--color-neon-purple)]/20 transition-all border border-[var(--color-neon-purple)]/20 shadow-[0_0_15px_rgba(180,105,246,0.1)] group-hover:scale-110 active:scale-95"
                    >
                        <Plus size={20} />
                    </button>
                </div>

                <div className="space-y-6 relative z-10">
                    {experience.map((exp, idx) => (
                        <div key={exp.id || idx} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all group/exp">
                            <div className="flex justify-between items-start mb-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                                    <div className="space-y-2">
                                        <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Company</label>
                                        <input 
                                            type="text" 
                                            className="w-full px-3 py-2 bg-black/30 border border-white/5 rounded-lg text-slate-300 text-xs focus:outline-none focus:border-[var(--color-neon-purple)]/30"
                                            value={exp.company}
                                            onChange={(e) => {
                                                const newExp = [...experience];
                                                newExp[idx].company = e.target.value;
                                                setExperience(newExp);
                                            }}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Title</label>
                                        <input 
                                            type="text" 
                                            className="w-full px-3 py-2 bg-black/30 border border-white/5 rounded-lg text-slate-300 text-xs focus:outline-none focus:border-[var(--color-neon-purple)]/30"
                                            value={exp.title}
                                            onChange={(e) => {
                                                const newExp = [...experience];
                                                newExp[idx].title = e.target.value;
                                                setExperience(newExp);
                                            }}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Dates</label>
                                        <input 
                                            type="text" 
                                            className="w-full px-3 py-2 bg-black/30 border border-white/5 rounded-lg text-slate-300 text-xs focus:outline-none focus:border-[var(--color-neon-purple)]/30"
                                            value={exp.dates}
                                            placeholder="e.g. Jan 2020 - Present"
                                            onChange={(e) => {
                                                const newExp = [...experience];
                                                newExp[idx].dates = e.target.value;
                                                setExperience(newExp);
                                            }}
                                        />
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleRemoveExperience(exp.id || exp.company)}
                                    className="ml-4 p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 opacity-0 group-hover/exp:opacity-100 transition-all"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Description</label>
                                <textarea 
                                    rows={4}
                                    className="w-full px-3 py-2 bg-black/30 border border-white/5 rounded-lg text-slate-300 text-xs focus:outline-none focus:border-[var(--color-neon-purple)]/30 resize-none"
                                    value={exp.description}
                                    onChange={(e) => {
                                        const newExp = [...experience];
                                        newExp[idx].description = e.target.value;
                                        setExperience(newExp);
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                    {experience.length === 0 && (
                        <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                            <p className="text-slate-500 text-sm font-medium">No experience added.</p>
                            <button onClick={handleAddExperience} className="mt-4 text-[var(--color-neon-purple)] text-xs font-bold uppercase tracking-widest hover:underline">Add Experience</button>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Education Section */}
            <div className="glass-panel ghost-border rounded-3xl p-8 relative overflow-hidden group">
                <div className="flex justify-between items-center mb-8 relative z-10">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Award size={20} className="text-[var(--color-neon-teal)]" /> Education
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">Academic background</p>
                    </div>
                    <button 
                        onClick={handleAddEducation}
                        className="p-2 rounded-xl bg-[var(--color-neon-teal)]/10 text-[var(--color-neon-teal)] hover:bg-[var(--color-neon-teal)]/20 transition-all border border-[var(--color-neon-teal)]/20 shadow-[0_0_15px_rgba(105,246,184,0.1)] group-hover:scale-110 active:scale-95"
                    >
                        <Plus size={20} />
                    </button>
                </div>

                <div className="space-y-6 relative z-10">
                    {education.map((edu, idx) => (
                        <div key={edu.id || idx} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all group/edu">
                            <div className="flex justify-between items-start">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                                    <div className="space-y-2">
                                        <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">School / University</label>
                                        <input 
                                            type="text" 
                                            className="w-full px-3 py-2 bg-black/30 border border-white/5 rounded-lg text-slate-300 text-xs focus:outline-none focus:border-[var(--color-neon-teal)]/30"
                                            value={edu.school || edu.institution_name || ''}
                                            onChange={(e) => {
                                                const newEdu = [...education];
                                                newEdu[idx].school = e.target.value;
                                                setEducation(newEdu);
                                            }}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Degree</label>
                                        <input 
                                            type="text" 
                                            className="w-full px-3 py-2 bg-black/30 border border-white/5 rounded-lg text-slate-300 text-xs focus:outline-none focus:border-[var(--color-neon-teal)]/30"
                                            value={edu.degree}
                                            onChange={(e) => {
                                                const newEdu = [...education];
                                                newEdu[idx].degree = e.target.value;
                                                setEducation(newEdu);
                                            }}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Dates</label>
                                        <input 
                                            type="text" 
                                            className="w-full px-3 py-2 bg-black/30 border border-white/5 rounded-lg text-slate-300 text-xs focus:outline-none focus:border-[var(--color-neon-teal)]/30"
                                            value={edu.dates}
                                            placeholder="e.g. 2018 - 2022"
                                            onChange={(e) => {
                                                const newEdu = [...education];
                                                newEdu[idx].dates = e.target.value;
                                                setEducation(newEdu);
                                            }}
                                        />
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleRemoveEducation(edu.id || edu.school)}
                                    className="ml-4 p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 opacity-0 group-hover/edu:opacity-100 transition-all"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {education.length === 0 && (
                        <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                            <p className="text-slate-500 text-sm font-medium">No education background added.</p>
                            <button onClick={handleAddEducation} className="mt-4 text-[var(--color-neon-teal)] text-xs font-bold uppercase tracking-widest hover:underline">Add Education</button>
                        </div>
                    )}
                </div>
            </div>

            {/* Projects Section */}
            <div className="glass-panel ghost-border rounded-3xl p-8 relative overflow-hidden group">
                <div className="flex justify-between items-center mb-8 relative z-10">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <FileText size={20} className="text-[var(--color-neon-teal)]" /> Projects
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">Highlighted engineering achievements</p>
                    </div>
                    <button 
                        onClick={handleAddProject}
                        className="p-2 rounded-xl bg-[var(--color-neon-teal)]/10 text-[var(--color-neon-teal)] hover:bg-[var(--color-neon-teal)]/20 transition-all border border-[var(--color-neon-teal)]/20 shadow-[0_0_15px_rgba(105,246,184,0.1)] group-hover:scale-110 active:scale-95"
                    >
                        <Plus size={20} />
                    </button>
                </div>

                <div className="space-y-6 relative z-10">
                    {projects.map((project, idx) => (
                        <div key={project.id || idx} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all group/project">
                            <div className="flex justify-between items-start mb-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                                    <div className="space-y-2">
                                        <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Project Name</label>
                                        <input 
                                            type="text" 
                                            className="w-full px-3 py-2 bg-black/30 border border-white/5 rounded-lg text-slate-300 text-xs focus:outline-none focus:border-[var(--color-neon-teal)]/30"
                                            value={project.name || project.project_name || ''}
                                            placeholder="e.g. JobSpyde Autonomous Engine"
                                            onChange={(e) => {
                                                const newProjects = [...projects];
                                                newProjects[idx].name = e.target.value;
                                                setProjects(newProjects);
                                            }}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">URL</label>
                                        <input 
                                            type="text" 
                                            className="w-full px-3 py-2 bg-black/30 border border-white/5 rounded-lg text-slate-300 text-xs focus:outline-none focus:border-[var(--color-neon-teal)]/30"
                                            value={project.url || project.link || ''}
                                            placeholder="e.g. github.com/user/project"
                                            onChange={(e) => {
                                                const newProjects = [...projects];
                                                newProjects[idx].url = e.target.value;
                                                setProjects(newProjects);
                                            }}
                                        />
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleRemoveProject(project.id || project.name)}
                                    className="ml-4 p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 opacity-0 group-hover/project:opacity-100 transition-all"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Technologies (comma separated)</label>
                                    <input 
                                        type="text" 
                                        className="w-full px-3 py-2 bg-black/30 border border-white/5 rounded-lg text-slate-300 text-xs focus:outline-none focus:border-[var(--color-neon-teal)]/30"
                                        value={project.technologies || ''}
                                        placeholder="React, Next.js, OpenAI, Supabase"
                                        onChange={(e) => {
                                            const newProjects = [...projects];
                                            newProjects[idx].technologies = e.target.value;
                                            setProjects(newProjects);
                                        }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Description</label>
                                    <textarea 
                                        rows={3}
                                        className="w-full px-3 py-2 bg-black/30 border border-white/5 rounded-lg text-slate-300 text-xs focus:outline-none focus:border-[var(--color-neon-teal)]/30 resize-none"
                                        value={project.description || ''}
                                        placeholder="Briefly describe what you built and the impact it had..."
                                        onChange={(e) => {
                                            const newProjects = [...projects];
                                            newProjects[idx].description = e.target.value;
                                            setProjects(newProjects);
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}

                    {projects.length === 0 && (
                        <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                            <p className="text-slate-500 text-sm font-medium">No projects added yet.</p>
                            <button onClick={handleAddProject} className="mt-4 text-[var(--color-neon-teal)] text-xs font-bold uppercase tracking-widest hover:underline">Add First Project</button>
                        </div>
                    )}
                </div>
            </div>

            {/* Skills Section */}
            <div className="glass-panel ghost-border rounded-3xl p-8 relative overflow-hidden">
                <div className="flex justify-between items-center mb-8 relative z-10">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Zap size={20} className="text-amber-400" /> Skills
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">Core competencies & technologies</p>
                    </div>
                </div>
                <div className="relative z-10">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                        Comma-separated skills
                    </label>
                    <textarea 
                        rows={3}
                        className="w-full px-4 py-3 bg-black/30 border border-white/5 rounded-xl text-slate-300 focus:outline-none focus:border-amber-400/30 text-sm leading-relaxed resize-none"
                        value={skills}
                        placeholder="Python, React, Postgres, Leadership..."
                        onChange={(e) => setSkills(e.target.value)}
                    />
                </div>
            </div>

            {/* Certifications Section */}
            <div className="glass-panel ghost-border rounded-3xl p-8 relative overflow-hidden group">
                <div className="flex justify-between items-center mb-8 relative z-10">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Award size={20} className="text-[var(--color-neon-blue)]" /> Certifications
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">Professional credentials</p>
                    </div>
                    <button 
                        onClick={handleAddCertification}
                        className="p-2 rounded-xl bg-[var(--color-neon-blue)]/10 text-[var(--color-neon-blue)] hover:bg-[var(--color-neon-blue)]/20 transition-all border border-[var(--color-neon-blue)]/20 shadow-[0_0_15px_rgba(56,189,248,0.1)] group-hover:scale-110 active:scale-95"
                    >
                        <Plus size={20} />
                    </button>
                </div>

                <div className="space-y-4 relative z-10">
                    {certifications.map((cert, idx) => (
                        <div key={cert.id || idx} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all flex justify-between items-center group/cert">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 mr-4">
                                <input 
                                    type="text" 
                                    className="w-full px-3 py-2 bg-black/30 border border-white/5 rounded-lg text-slate-300 text-xs focus:outline-none focus:border-[var(--color-neon-blue)]/30"
                                    value={cert.name}
                                    placeholder="Certification Name"
                                    onChange={(e) => {
                                        const newCerts = [...certifications];
                                        newCerts[idx].name = e.target.value;
                                        setCertifications(newCerts);
                                    }}
                                />
                                <input 
                                    type="text" 
                                    className="w-full px-3 py-2 bg-black/30 border border-white/5 rounded-lg text-slate-300 text-xs focus:outline-none focus:border-[var(--color-neon-blue)]/30"
                                    value={cert.issuer}
                                    placeholder="Issuer (e.g. AWS, Coursera)"
                                    onChange={(e) => {
                                        const newCerts = [...certifications];
                                        newCerts[idx].issuer = e.target.value;
                                        setCertifications(newCerts);
                                    }}
                                />
                            </div>
                            <button 
                                onClick={() => handleRemoveCertification(cert.id || cert.name)}
                                className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 opacity-0 group-hover/cert:opacity-100 transition-all"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    )
}

