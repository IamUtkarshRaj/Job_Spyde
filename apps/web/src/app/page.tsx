import Link from 'next/link'
import { Radar } from 'lucide-react'

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[80vh] text-center">
      <div className="bg-blue-600 text-white p-5 rounded-full mb-6 shadow-lg">
        <Radar size={48} />
      </div>
      <h1 className="text-5xl font-extrabold mb-4 tracking-tight text-gray-900">Job Spyde</h1>
      <p className="text-xl text-gray-500 mb-8 max-w-2xl">
        Your autonomous AI agent that discovers tailored jobs, drafts custom resumes, and manages your entire application pipeline.
      </p>

      <div className="flex gap-4">
        <Link href="/login" className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition shadow-sm">
          Sign In
        </Link>
        <Link href="/signup" className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 text-gray-900 transition bg-white">
          Sign Up
        </Link>
      </div>
    </main>
  )
}
