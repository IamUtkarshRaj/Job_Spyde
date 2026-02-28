import Link from 'next/link'
import { Logo } from '@/components/ui/Logo'
import { Search, FileText, BarChart3, Sparkles, ArrowRight, Star } from 'lucide-react'

const features = [
  {
    icon: Search,
    title: 'Smart Job Discovery',
    description: 'AI agents search multiple sources to find jobs matching your skills, preferences, and career goals — automatically.',
  },
  {
    icon: FileText,
    title: 'AI Resume Adaptation',
    description: 'Generate tailored resumes for each application. Our AI rewrites and optimizes your resume for maximum keyword match.',
  },
  {
    icon: BarChart3,
    title: 'Application Tracking CRM',
    description: 'Track every application from discovery to offer with a clean pipeline. Never lose track of where you stand.',
  },
  {
    icon: Sparkles,
    title: 'Daily Insight Digest',
    description: 'Get personalized daily briefings with AI-powered recommendations on what to apply for, follow up on, or prepare for.',
  },
]

const testimonials = [
  {
    name: 'Rahul Mehta',
    role: 'B.Tech CSE – Pune',
    quote: 'Before Job Spyde, I used to apply randomly. Now I track everything properly and tailor resumes in minutes.',
  },
  {
    name: 'Ananya Sharma',
    role: 'MCA – Delhi',
    quote: 'The daily digest feature saves me hours. I know exactly which jobs to focus on each day.',
  },
  {
    name: 'Arjun Reddy',
    role: 'BE IT – Hyderabad',
    quote: 'Got 3 interview calls in my first week of using Job Spyde. The AI resume tailoring makes a real difference.',
  },
  {
    name: 'Priya Nair',
    role: 'B.Tech ECE – Bengaluru',
    quote: 'Finally a tool that understands what Indian students need. Clean, fast, and genuinely helpful.',
  },
]

const mockJobs = [
  { title: 'Frontend Engineer', company: 'Flipkart', match: 92, status: 'Interview' },
  { title: 'SDE Intern', company: 'Google', match: 87, status: 'Applied' },
  { title: 'Full Stack Dev', company: 'Razorpay', match: 78, status: 'Saved' },
]

export default function LandingPage() {
  return (

    <div className="relative overflow-hidden">
      {/* Aurora Background Blobs */}
      <div className="aurora-blob w-[500px] h-[500px] bg-indigo-600/20 top-[-100px] left-[-100px]" />
      <div className="aurora-blob-alt w-[400px] h-[400px] bg-blue-600/15 top-[200px] right-[-50px]" />
      <div className="aurora-blob w-[300px] h-[300px] bg-cyan-600/10 bottom-[400px] left-[30%]" />

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto" aria-label="Primary navigation">
        <Logo />
        <div className="hidden sm:flex items-center gap-6">
          <a href="#features" className="text-sm text-slate-400 hover:text-slate-200 transition-colors">Features</a>
          <a href="#testimonials" className="text-sm text-slate-400 hover:text-slate-200 transition-colors">Testimonials</a>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-slate-300 hover:text-slate-100 px-4 py-2 rounded-xl transition-colors"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="text-sm font-semibold text-white gradient-bg px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:brightness-110 transition-all duration-200"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-20 pb-16 md:pt-32 md:pb-24 text-center">
        <div className="animate-float-up">
          <span className="inline-flex items-center gap-2 text-xs font-medium text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-4 py-1.5 rounded-full mb-6">
            <Sparkles size={12} />
            AI-Powered Career Intelligence
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-50 leading-tight">
            Your Intelligent
            <br />
            <span className="gradient-text">Career Command Center</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Job Spyde uses AI agents to discover jobs, tailor resumes, and track applications — so you focus on getting hired.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 text-base font-semibold text-white gradient-bg px-8 py-3.5 rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:brightness-110 transition-all duration-200"
            >
              Get Started
              <ArrowRight size={18} />
            </Link>
            <a
              href="#preview"
              className="inline-flex items-center gap-2 text-base font-medium text-slate-300 bg-slate-800/50 border border-slate-700 px-8 py-3.5 rounded-xl hover:border-indigo-500/30 hover:text-slate-100 transition-all duration-200"
            >
              View Demo Dashboard
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-100">
            Everything you need to <span className="gradient-text">land your dream job</span>
          </h2>
          <p className="mt-4 text-slate-400 text-lg max-w-2xl mx-auto">
            From discovery to offer, Job Spyde handles the heavy lifting while you focus on what matters.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className="glass-card glass-card-lift p-8 group"
              >
                <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center mb-5 shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/30 transition-shadow duration-200">
                  <Icon size={22} className="text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-100 mb-2">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Dashboard Preview */}
      <section id="preview" className="relative z-10 max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-100">
            A glimpse of your <span className="gradient-text">command center</span>
          </h2>
        </div>
        <div className="glass-card p-8 glow-indigo">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
            <span className="text-xs text-slate-500 ml-3">Job Spyde — Dashboard</span>
          </div>

          {/* Summary strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Jobs Found', value: '24', color: 'text-indigo-300' },
              { label: 'Saved', value: '8', color: 'text-blue-300' },
              { label: 'Applied', value: '5', color: 'text-green-300' },
              { label: 'Interviews', value: '2', color: 'text-purple-300' },
            ].map((stat) => (
              <div key={stat.label} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/30">
                <div className="text-xs text-slate-500 mb-1">{stat.label}</div>
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              </div>
            ))}
          </div>

          {/* Mock job list */}
          <div className="space-y-3">
            {mockJobs.map((job) => (
              <div key={job.title} className="flex items-center justify-between bg-slate-800/30 rounded-xl px-5 py-4 border border-slate-700/20">
                <div>
                  <div className="font-medium text-slate-200">{job.title}</div>
                  <div className="text-sm text-slate-500">{job.company}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${job.match > 85
                    ? 'text-emerald-300 bg-emerald-500/20 border-emerald-500/30'
                    : 'text-amber-300 bg-amber-500/20 border-amber-500/30'
                    }`}>
                    {job.match}% Match
                  </span>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${job.status === 'Interview'
                    ? 'text-purple-300 bg-purple-500/20 border-purple-500/20'
                    : job.status === 'Applied'
                      ? 'text-green-300 bg-green-500/20 border-green-500/20'
                      : 'text-blue-300 bg-blue-500/20 border-blue-500/20'
                    }`}>
                    {job.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-100">
            Trusted by <span className="gradient-text">students like you</span>
          </h2>
          <p className="mt-4 text-slate-400 text-lg">Real stories from real job seekers across India.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="glass-card p-7">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-slate-300 italic leading-relaxed mb-5">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center text-xs font-bold text-white">
                  {t.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-200">{t.name}</div>
                  <div className="text-xs text-slate-500">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/50 mt-10">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo size="small" />
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-slate-300 transition-colors">GitHub</a>
            <a href="mailto:contact@jobspyde.com" className="hover:text-slate-300 transition-colors">Contact</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Privacy</a>
          </div>
          <p className="text-xs text-slate-600">© Job Spyde 2026</p>
        </div>
      </footer>
    </div>

  )
}
