'use client'

import { useEffect, useState } from 'react'
import { BrainCircuit, Sparkles, Zap, FileText, CheckCircle2 } from 'lucide-react'

const STEPS = [
    { icon: BrainCircuit, label: 'Analyzing job description keywords...', color: 'var(--color-accent-primary)' },
    { icon: Zap, label: 'Matching skills to requirements...', color: 'var(--color-neon-teal)' },
    { icon: FileText, label: 'Rewriting experience for impact...', color: 'var(--color-soft-violet)' },
    { icon: Sparkles, label: 'Optimizing for ATS compatibility...', color: 'var(--color-neon-teal)' },
]

export function OptimizingLoader() {
    const [currentStep, setCurrentStep] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentStep(prev => (prev < STEPS.length - 1 ? prev + 1 : prev))
        }, 3000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="glass-panel ghost-border rounded-3xl p-12 relative overflow-hidden">
            {/* Animated background blobs */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div 
                    className="absolute w-96 h-96 rounded-full blur-[120px] animate-pulse"
                    style={{ 
                        background: 'radial-gradient(circle, rgba(133,173,255,0.15), transparent)',
                        top: '-20%', left: '-10%',
                        animationDuration: '3s'
                    }}
                />
                <div 
                    className="absolute w-80 h-80 rounded-full blur-[100px] animate-pulse"
                    style={{ 
                        background: 'radial-gradient(circle, rgba(105,246,184,0.12), transparent)',
                        bottom: '-15%', right: '-5%',
                        animationDuration: '4s',
                        animationDelay: '1s'
                    }}
                />
            </div>

            <div className="relative z-10 flex flex-col items-center text-center">
                {/* Central spinner */}
                <div className="relative mb-10">
                    <div className="w-24 h-24 rounded-full border-2 border-[var(--color-accent-primary)]/20 flex items-center justify-center relative">
                        {/* Orbiting ring */}
                        <div 
                            className="absolute inset-0 rounded-full border-2 border-transparent"
                            style={{
                                borderTopColor: 'var(--color-accent-primary)',
                                borderRightColor: 'var(--color-neon-teal)',
                                animation: 'spin 2s linear infinite'
                            }}
                        />
                        {/* Inner glow */}
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--color-accent-primary)]/20 to-[var(--color-neon-teal)]/20 flex items-center justify-center backdrop-blur-sm">
                            <BrainCircuit size={28} className="text-[var(--color-accent-primary)] animate-pulse" />
                        </div>
                    </div>
                    {/* Pulsing ring */}
                    <div 
                        className="absolute inset-0 rounded-full border border-[var(--color-accent-primary)]/30"
                        style={{ animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite' }}
                    />
                </div>

                <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Optimizing Your Resume</h2>
                <p className="text-sm text-slate-500 mb-10 max-w-md">
                    Our AI is rewriting your resume to maximize ATS compatibility and keyword alignment with the target position.
                </p>

                {/* Step progress */}
                <div className="w-full max-w-md space-y-4">
                    {STEPS.map((step, idx) => {
                        const Icon = step.icon
                        const isActive = idx === currentStep
                        const isDone = idx < currentStep

                        return (
                            <div 
                                key={idx}
                                className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-500 ${
                                    isActive 
                                        ? 'bg-white/[0.05] border border-white/10 shadow-[0_0_20px_rgba(133,173,255,0.1)]' 
                                        : isDone 
                                            ? 'opacity-60' 
                                            : 'opacity-30'
                                }`}
                            >
                                <div 
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-500 ${
                                        isDone ? 'bg-[var(--color-neon-teal)]/20' : isActive ? 'bg-white/10' : 'bg-white/5'
                                    }`}
                                >
                                    {isDone ? (
                                        <CheckCircle2 size={18} className="text-[var(--color-neon-teal)]" />
                                    ) : (
                                        <Icon 
                                            size={18} 
                                            className={isActive ? 'animate-pulse' : ''}
                                            style={{ color: isActive ? step.color : 'var(--color-text-muted)' }}
                                        />
                                    )}
                                </div>
                                <span className={`text-sm font-medium transition-colors duration-500 ${
                                    isActive ? 'text-white' : isDone ? 'text-slate-400' : 'text-slate-600'
                                }`}>
                                    {step.label}
                                </span>
                                {isActive && (
                                    <div className="ml-auto">
                                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin text-[var(--color-accent-primary)]" />
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            <style jsx>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                @keyframes ping {
                    75%, 100% { transform: scale(1.5); opacity: 0; }
                }
            `}</style>
        </div>
    )
}
