import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/ui/Sidebar'
import { Topbar } from '@/components/ui/Topbar'
import { PageTransition } from '@/components/motion/PageTransition'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    return (
        <div className="flex h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] relative overflow-hidden">
            {/* Stitch Background Radials */}
            <div className="fixed inset-0 pointer-events-none z-0"
                style={{
                    backgroundImage: `
                        radial-gradient(circle at 0% 0%, rgba(0, 91, 196, 0.15) 0%, transparent 50%),
                        radial-gradient(circle at 100% 100%, rgba(105, 246, 184, 0.1) 0%, transparent 50%)
                    `
                }}
            />

            <div className="relative z-10 flex h-full w-full">
                <Sidebar userEmail={user.email || ''} />

                <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                    <Topbar 
                        userEmail={user.email || ''} 
                        userName={user.user_metadata?.name || user.user_metadata?.full_name || ''} 
                    />

                    <main className="flex-1 overflow-y-auto">
                        <div className="p-6 md:p-12 max-w-[1400px] mx-auto w-full relative">
                            <PageTransition>
                                {children}
                            </PageTransition>
                        </div>
                    </main>
                </div>
            </div>

            {/* Bottom gradient fade — Stitch */}
            <div className="fixed bottom-0 right-0 left-64 h-24 bg-gradient-to-t from-[var(--color-bg-primary)] to-transparent pointer-events-none z-30" />
        </div>
    )
}
