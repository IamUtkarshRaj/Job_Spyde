'use client'

import { useState, KeyboardEvent } from 'react'
import { X } from 'lucide-react'

interface TagsInputProps {
    value: string[]
    onChange: (tags: string[]) => void
    placeholder?: string
}

export function TagsInput({ value, onChange, placeholder = 'Press Enter to add tags...' }: TagsInputProps) {
    const [input, setInput] = useState('')

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            addTag()
        } else if (e.key === 'Backspace' && input === '') {
            onChange(value.slice(0, -1))
        }
    }

    const addTag = () => {
        const trimmed = input.trim()
        if (trimmed && !value.includes(trimmed)) {
            onChange([...value, trimmed])
            setInput('')
        }
    }

    const removeTag = (indexToRemove: number) => {
        onChange(value.filter((_, index) => index !== indexToRemove))
    }

    return (
        <div className="flex flex-wrap items-center gap-2 p-2 border border-white/10 rounded-xl bg-white/[0.02] focus-within:border-[var(--color-accent-primary)]/50 focus-within:bg-white/[0.05] transition-colors shadow-inner">
            {value.map((tag, index) => (
                <span 
                    key={index} 
                    className="flex items-center gap-1.5 px-3 py-1 bg-[var(--color-accent-primary)]/20 text-white rounded-md text-sm backdrop-blur-sm border border-[var(--color-accent-primary)]/30 hover:bg-[var(--color-accent-primary)]/30 transition-colors cursor-default"
                >
                    {tag}
                    <button 
                        type="button"
                        onClick={() => removeTag(index)}
                        className="p-0.5 hover:bg-white/20 rounded-full transition-colors focus:outline-none"
                    >
                        <X size={14} className="opacity-70 hover:opacity-100" />
                    </button>
                </span>
            ))}
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={addTag}
                placeholder={value.length === 0 ? placeholder : ''}
                className="flex-1 bg-transparent min-w-[120px] outline-none text-sm text-white placeholder:text-slate-500 py-1 px-2"
            />
        </div>
    )
}
