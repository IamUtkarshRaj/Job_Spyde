'use client'

import React, { useCallback, useState } from 'react'
import { UploadCloud, File, X, CheckCircle, Loader2 } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

interface ResumeDropzoneProps {
    onUploaded: (path: string, fileName: string, size: number) => void
    defaultFileName?: string
}

export function ResumeDropzone({ onUploaded, defaultFileName }: ResumeDropzoneProps) {
    const [isDragging, setIsDragging] = useState(false)
    const [fileState, setFileState] = useState<{name: string, status: 'idle' | 'uploading' | 'success' | 'error'}>({
        name: defaultFileName || '',
        status: defaultFileName ? 'success' : 'idle'
    })
    
    const supabase = createClient()

    const handleUpload = async (file: File) => {
        if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
            alert('Invalid file format. Please upload PDF, DOC, or DOCX.')
            return
        }

        setFileState({ name: file.name, status: 'uploading' })

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Unauthorized')

            const fileExt = file.name.split('.').pop()
            const filePath = `${user.id}/resume-${Date.now()}.${fileExt}`

            const { data, error } = await supabase.storage
                .from('resumes')
                .upload(filePath, file, { upsert: true })

            if (error) throw error

            setFileState({ name: file.name, status: 'success' })
            onUploaded(data.path, file.name, file.size)
        } catch (err) {
            console.error('Upload failed:', err)
            setFileState({ name: file.name, status: 'error' })
        }
    }

    const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setIsDragging(false)
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleUpload(e.dataTransfer.files[0])
        }
    }, [])

    const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleUpload(e.target.files[0])
        }
    }

    return (
        <div 
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 relative overflow-hidden flex flex-col items-center justify-center min-h-[200px]
            ${isDragging ? 'border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/10 scale-[1.02]' 
            : fileState.status === 'success' ? 'border-[var(--color-neon-teal)]/30 bg-[var(--color-neon-teal)]/5'
            : 'border-white/15 bg-white/[0.02] hover:border-white/30 hover:bg-white/[0.04]'}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={(e) => { e.preventDefault(); setIsDragging(false) }}
            onDrop={onDrop}
        >
            <input type="file" id="resume-upload" className="hidden" accept=".pdf,.doc,.docx" onChange={onFileInput} />
            
            {fileState.status === 'idle' && (
                <>
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                        <UploadCloud size={32} className="text-slate-400" />
                    </div>
                    <label htmlFor="resume-upload" className="font-semibold text-white cursor-pointer hover:text-[var(--color-accent-primary)] transition-colors">
                        Click to upload
                    </label>
                    <span className="text-sm text-slate-400 mt-1 pointer-events-none">or drag and drop</span>
                    <p className="text-xs text-slate-500 mt-4 pointer-events-none">PDF, DOC, DOCX up to 10MB</p>
                </>
            )}

            {fileState.status === 'uploading' && (
                <div className="flex flex-col items-center gap-4">
                    <Loader2 size={40} className="text-[var(--color-accent-primary)] animate-spin" />
                    <p className="text-sm font-medium text-white/80 animate-pulse">Encrypting & Uploading {fileState.name}...</p>
                </div>
            )}

            {fileState.status === 'success' && (
                <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-[var(--color-neon-teal)]/20 flex items-center justify-center mb-2 shadow-[0_0_20px_rgba(105,246,184,0.1)]">
                        <CheckCircle size={32} className="text-[var(--color-neon-teal)]" />
                    </div>
                    <p className="text-base font-bold text-white flex items-center gap-2">
                        <File size={18} className="text-[var(--color-neon-teal)]" /> {fileState.name}
                    </p>
                    <label htmlFor="resume-upload" className="text-xs font-semibold uppercase tracking-wider text-[var(--color-accent-primary)] hover:text-white cursor-pointer transition-colors mt-2">
                        Replace File
                    </label>
                </div>
            )}
        </div>
    )
}
