import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, FileText, Sparkles, LogOut, Search } from 'lucide-react'

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
        <div className="flex h-screen bg-background">
            {/* Sidebar */}
            <aside className="w-64 border-r bg-card hidden md:flex flex-col">
                <div className="p-6 border-b">
                    <h1 className="text-xl font-bold tracking-tight">JobTracker</h1>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-colors">
                        <LayoutDashboard size={18} />
                        Dashboard
                    </Link>
                    <Link href="/resume" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-colors">
                        <FileText size={18} />
                        My Resume
                    </Link>
                    <Link href="/digest" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-colors">
                        <Sparkles size={18} />
                        Daily Digest
                    </Link>
                    <div className="pt-4 mt-4 border-t">
                        <Link href="/discover" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-blue-600 hover:bg-blue-50 transition-colors">
                            <Search size={18} />
                            Discover Jobs
                        </Link>
                    </div>
                </nav>
                <div className="p-4 border-t">
                    <div className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-muted-foreground">
                        <div className="truncate w-full">{user.email}</div>
                    </div>
                    <form action="/auth/signout" method="post">
                        <button className="flex items-center gap-3 px-3 py-2 w-full text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors">
                            <LogOut size={18} />
                            Sign Out
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <header className="md:hidden p-4 border-b flex justify-between items-center bg-card">
                    <span className="font-bold">JobTracker</span>
                    {/* Mobile menu trigger would go here */}
                </header>
                <div className="p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}
