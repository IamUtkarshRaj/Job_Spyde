import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 text-center">
      <h1 className="text-4xl font-bold mb-4">Student Job Application & Tracking</h1>
      <p className="text-xl mb-8">Efficiently track your job applications and tailor your resumes with AI.</p>

      <div className="flex gap-4">
        <Link href="/login" className="px-6 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700">
          Sign In
        </Link>
        <Link href="/signup" className="px-6 py-3 border border-gray-300 rounded-md font-medium hover:bg-gray-50 text-black">
          Sign Up
        </Link>
      </div>
    </main>
  )
}
