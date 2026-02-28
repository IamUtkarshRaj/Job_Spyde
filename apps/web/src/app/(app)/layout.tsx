import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/ui/Sidebar'
import { Topbar } from '@/components/ui/Topbar'

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
        <div className="flex h-screen bg-[#0a0e1a]">
            <Sidebar userEmail={user.email || ''} />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <Topbar userEmail={user.email || ''} />

                <main className="flex-1 overflow-y-auto">
                    <div className="p-6 md:p-8 max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
