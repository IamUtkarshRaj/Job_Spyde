'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import gsap from 'gsap'

export function PageTransition({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!containerRef.current) return

        // Cinematic fade + subtle scale + blur for child nodes
        gsap.fromTo(
            containerRef.current.children,
            { 
                opacity: 0, 
                y: 12,
                scale: 0.99,
                filter: 'blur(6px)'
            },
            { 
                opacity: 1, 
                y: 0,
                scale: 1,
                filter: 'blur(0px)',
                duration: 0.6, 
                ease: 'power3.out',
                stagger: 0.04
            }
        )
    }, [pathname])

    return (
        <div ref={containerRef} className="w-full h-full relative">
            {children}
        </div>
    )
}
