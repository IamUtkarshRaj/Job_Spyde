'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Spline from '@splinetool/react-spline';
import { Radar, Search, Wand2, LayoutGrid, Lightbulb, Sparkles, ArrowRight, Zap, Star, Quote, ChevronRight, Globe, Shield } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [navScrolled, setNavScrolled] = useState(false);

  // Navbar glass effect on scroll
  useEffect(() => {
    const handleScroll = () => setNavScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // ── Hero entrance ──
      const hero = gsap.timeline({ defaults: { ease: 'power4.out' } });
      hero
        .from('.hero-badge', { y: 24, opacity: 0, duration: 1, delay: 0.4 })
        .from('.hero-line-1', { y: 60, opacity: 0, duration: 1.1 }, '-=0.7')
        .from('.hero-line-2', { y: 60, opacity: 0, duration: 1.1 }, '-=0.85')
        .from('.hero-sub', { y: 18, opacity: 0, duration: 0.9 }, '-=0.6')
        .from('.hero-actions', { y: 24, opacity: 0, duration: 0.9 }, '-=0.55');

      // ── Floating parallax on ambient blobs ──
      gsap.to('.blob-blue', {
        y: -60, x: 30,
        scrollTrigger: { trigger: containerRef.current, start: 'top top', end: 'bottom top', scrub: 1.5 }
      });
      gsap.to('.blob-teal', {
        y: -40, x: -20,
        scrollTrigger: { trigger: containerRef.current, start: 'top top', end: 'bottom top', scrub: 2 }
      });

      // ── Robust GSAP ScrollTrigger ──
      // Instead of setting opacity: 0 via JS (which breaks in StrictMode),
      // we just use simple from() animations. If ScrollTrigger fails, they
      // simply won't animate but they'll remain visible in the DOM natively.
      
      const elements = [
        { sel: '.stat-card', y: 30, stagger: 0.1 },
        { sel: '.section-reveal', y: 30, stagger: 0 },
        { sel: '.feat', y: 40, stagger: 0.1 },
        { sel: '.dash-mock', y: 60, stagger: 0 },
        { sel: '.testi', y: 40, stagger: 0.15 },
        { sel: '.cta-banner', y: 30, stagger: 0 }
      ];

      elements.forEach(({ sel, y, stagger }) => {
        gsap.from(sel, {
          scrollTrigger: {
            trigger: sel,
            start: 'top 85%',
          },
          y: y,
          opacity: 0,
          duration: 0.8,
          stagger: stagger,
          ease: 'power3.out',
          clearProps: 'all' // Ensures no inline styles break layout after animation
        });
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="relative min-h-screen overflow-x-hidden bg-[#060a14] text-white font-sans antialiased">

      {/* ── Ambient Blobs ── */}
      <div className="blob-blue fixed top-[-15%] left-[-8%] w-[700px] h-[700px] rounded-full opacity-40 pointer-events-none z-0"
           style={{ background: 'radial-gradient(circle, rgba(0,91,196,0.25) 0%, transparent 65%)', filter: 'blur(100px)' }} />
      <div className="blob-teal fixed top-[30%] right-[-12%] w-[600px] h-[600px] rounded-full opacity-30 pointer-events-none z-0"
           style={{ background: 'radial-gradient(circle, rgba(105,246,184,0.2) 0%, transparent 65%)', filter: 'blur(100px)' }} />

      {/* ═══════════════════════════════════════════
          NAVBAR — Glass Panel
      ═══════════════════════════════════════════ */}
      <header className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-500
        ${navScrolled
          ? 'bg-[#0a0e1a]/70 backdrop-blur-2xl border-b border-white/[0.06] shadow-[0_8px_30px_rgba(0,0,0,0.5)]'
          : 'bg-transparent border-b border-transparent'
        }
      `}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-[72px]">
            {/* Brand */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-[#5b8aff] to-[#4eeabb] flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-shadow">
                <Radar size={18} className="text-white" />
              </div>
              <span className="text-[22px] font-black tracking-tight">
                Job<span className="bg-gradient-to-r from-[#85adff] to-[#69f6b8] bg-clip-text text-transparent">Spyde</span>
              </span>
            </Link>

            {/* Nav links */}
            <nav className="hidden md:flex items-center gap-1">
              {['Features', 'Platform', 'Testimonials'].map(item => (
                <a key={item} href={`#${item.toLowerCase()}`}
                   className="px-4 py-2 text-[13px] font-medium text-white/50 hover:text-white rounded-lg hover:bg-white/[0.04] transition-all duration-200">
                  {item}
                </a>
              ))}
            </nav>

            {/* Auth */}
            <div className="flex items-center gap-3">
              <Link href="/login"
                    className="hidden sm:inline-flex px-5 py-2 text-[13px] font-semibold text-white/60 hover:text-white rounded-lg hover:bg-white/[0.06] transition-all duration-200">
                Log in
              </Link>
              <Link href="/signup"
                    className="px-5 py-2.5 text-[13px] font-bold rounded-lg bg-gradient-to-r from-[#5b8aff] to-[#4eeabb] text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-px active:translate-y-0 transition-all duration-200">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* ═══════════════════════════════════════════
            HERO
        ═══════════════════════════════════════════ */}
        <section className="relative pt-32 pb-20 lg:pt-44 lg:pb-32 px-6 min-h-[92vh] flex items-center">
          {/* Spline behind — faded */}
          <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.6]"
               style={{ maskImage: 'linear-gradient(to bottom, white 40%, transparent 95%)', WebkitMaskImage: 'linear-gradient(to bottom, white 40%, transparent 95%)' }}>
            <Spline scene="https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode" />
          </div>

          <div className="max-w-[1100px] mx-auto relative z-10 w-full">
            {/* Badge */}
            <div className="hero-badge flex items-center gap-2.5 w-fit mb-10 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.04]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <span className="text-[12px] font-medium text-white/60">Now in public beta — free for early adopters</span>
            </div>

            {/* Heading */}
            <h1 className="mb-7">
              <span className="hero-line-1 block text-[clamp(3rem,7vw,5.5rem)] font-extrabold leading-[1.08] tracking-[-0.04em] text-white">
                Stop job-hunting.
              </span>
              <span className="hero-line-2 block text-[clamp(3rem,7vw,5.5rem)] font-extrabold leading-[1.08] tracking-[-0.04em] bg-gradient-to-r from-[#85adff] via-[#69f6b8] to-[#4eeabb] bg-clip-text text-transparent">
                Start job-commanding.
              </span>
            </h1>

            <p className="hero-sub max-w-[580px] text-[17px] leading-[1.7] text-white/45 mb-10">
              Job Spyde uses autonomous AI agents to discover, match, and apply to roles that fit you — so you can focus on preparing for interviews, not scrolling through job boards.
            </p>

            {/* CTA Row */}
            <div className="hero-actions flex flex-wrap items-center gap-4">
              <Link href="/signup"
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#5b8aff] to-[#4eeabb] text-white font-bold text-[15px] shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/35 hover:-translate-y-px active:translate-y-0 transition-all duration-200">
                Get started — it&apos;s free
                <ArrowRight size={16} />
              </Link>
              <a href="#platform"
                 className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border border-white/10 bg-white/[0.03] text-white/70 font-medium text-[15px] hover:bg-white/[0.06] hover:text-white transition-all duration-200 group">
                See the platform
                <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>

            {/* Social proof mini */}
            <div className="mt-14 flex items-center gap-4 text-[13px] text-white/30">
              <div className="flex -space-x-2">
                {['#5b8aff','#4eeabb','#ac8aff','#f59e0b'].map((c,i) => (
                  <div key={i} className="w-7 h-7 rounded-full border-2 border-[#060a14]" style={{ background: c }} />
                ))}
              </div>
              <span>Trusted by <strong className="text-white/50">5,000+</strong> job seekers</span>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            STATS
        ═══════════════════════════════════════════ */}
        <section id="stats" className="py-6 px-6 relative z-10">
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { val: '10K+', label: 'Jobs matched', accent: '#85adff' },
              { val: '98%', label: 'Match accuracy', accent: '#69f6b8' },
              { val: '5K+', label: 'Active users', accent: '#ac8aff' },
              { val: '3×', label: 'Faster hiring', accent: '#f59e0b' },
            ].map((s, i) => (
              <div key={i} className="stat-card text-center py-5 px-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm">
                <div className="text-2xl font-bold mb-0.5" style={{ color: s.accent }}>{s.val}</div>
                <div className="text-[11px] text-white/35 uppercase tracking-widest font-semibold">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            FEATURES
        ═══════════════════════════════════════════ */}
        <section id="features" className="py-28 px-6 relative z-10">
          <div className="max-w-6xl mx-auto">
            {/* Section Header */}
            <div className="section-reveal max-w-lg mb-16">
              <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-emerald-400 mb-3">What you get</p>
              <h2 className="text-[2.5rem] font-extrabold leading-[1.15] tracking-tight text-white mb-4">
                Everything to land<br />your next role, faster.
              </h2>
              <p className="text-[15px] text-white/40 leading-relaxed">Four modules working together so you never miss an opportunity or send a generic resume again.</p>
            </div>

            <div id="features-grid" className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                { icon: Search, title: 'Smart Discovery', desc: 'AI agents scrape and rank jobs across multiple boards in real-time, filtered to your exact preferences.', accent: '#85adff', tag: 'Core' },
                { icon: Wand2, title: 'Resume Tailoring', desc: 'Every application gets a contextually re-written resume and cover letter — no more copy-pasting.', accent: '#ac8aff', tag: 'AI Engine' },
                { icon: LayoutGrid, title: 'Pipeline Tracker', desc: 'Visualize every application stage from discovered → applied → interview → offer in one view.', accent: '#69f6b8', tag: 'CRM' },
                { icon: Lightbulb, title: 'Daily Digest', desc: 'Wake up to a personalized briefing: new matches, follow-up reminders, and market signals.', accent: '#f59e0b', tag: 'Insights' },
              ].map((f, i) => (
                <div key={i}
                     className="feat group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-7 hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-300 overflow-hidden">
                  {/* Subtle corner glow */}
                  <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                       style={{ background: `radial-gradient(circle, ${f.accent}15 0%, transparent 70%)` }} />

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center border"
                           style={{ borderColor: `${f.accent}25`, background: `${f.accent}0D` }}>
                        <f.icon size={22} style={{ color: f.accent }} />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest rounded-full px-2.5 py-1 border"
                            style={{ color: `${f.accent}99`, borderColor: `${f.accent}20`, background: `${f.accent}08` }}>
                        {f.tag}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                    <p className="text-[14px] text-white/40 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            PLATFORM PREVIEW
        ═══════════════════════════════════════════ */}
        <section id="platform" className="py-28 px-6 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="section-reveal text-center mb-14">
              <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-blue-400 mb-3">The platform</p>
              <h2 className="text-[2.5rem] font-extrabold tracking-tight text-white">Your command center, at a glance.</h2>
            </div>

            <div className="dash-mock rounded-2xl border border-white/[0.08] bg-[#0c1120] overflow-hidden shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)]">
              {/* Browser chrome */}
              <div className="h-10 bg-[#111827] border-b border-white/[0.05] flex items-center px-4 gap-2">
                <div className="flex gap-1.5">
                  <div className="w-[10px] h-[10px] rounded-full bg-[#ff5f57]" />
                  <div className="w-[10px] h-[10px] rounded-full bg-[#febc2e]" />
                  <div className="w-[10px] h-[10px] rounded-full bg-[#28c840]" />
                </div>
                <div className="flex-1 text-center">
                  <span className="text-[11px] text-white/25 font-mono">app.jobspyde.ai/dashboard</span>
                </div>
              </div>

              {/* Mock content */}
              <div className="p-6 md:p-8 flex gap-6">
                {/* Mini sidebar */}
                <div className="hidden md:flex flex-col items-center gap-5 pt-2 pr-6 border-r border-white/5">
                  <div className="p-2 rounded-lg bg-emerald-500/15 border border-emerald-500/25 text-emerald-400"><LayoutGrid size={18} /></div>
                  <div className="p-2 rounded-lg text-white/20"><Search size={18} /></div>
                  <div className="p-2 rounded-lg text-white/20"><Wand2 size={18} /></div>
                  <div className="p-2 rounded-lg text-white/20"><Globe size={18} /></div>
                </div>

                {/* Main area */}
                <div className="flex-1 space-y-5">
                  <div className="flex justify-between items-end">
                    <div>
                      <h3 className="text-xl font-bold text-white">Welcome back, Utkarsh</h3>
                      <p className="text-sm text-white/35">3 interviews this week · 2 new matches</p>
                    </div>
                    <div className="hidden sm:flex items-center gap-2">
                      <span className="text-[10px] text-white/25 font-mono">Pipeline</span>
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest bg-emerald-400/10 text-emerald-400 border border-emerald-400/20">Live</span>
                    </div>
                  </div>

                  {/* KPI row */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { l: 'Applications', v: '24', c: 'text-white' },
                      { l: 'Response Rate', v: '18%', c: 'text-emerald-400' },
                      { l: 'Interviews', v: '3', c: 'text-purple-400' },
                    ].map((k,i) => (
                      <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                        <div className="text-[11px] text-white/30 mb-1">{k.l}</div>
                        <div className={`text-2xl font-bold ${k.c}`}>{k.v}</div>
                      </div>
                    ))}
                  </div>

                  {/* Feed */}
                  <div className="bg-white/[0.015] border border-white/5 rounded-xl p-5">
                    <div className="text-xs font-semibold text-white/60 mb-3">Recent Activity</div>
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.015] border border-white/5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-black font-extrabold text-xs">O</div>
                          <div>
                            <div className="text-sm text-white font-semibold">OpenAI</div>
                            <div className="text-[10px] text-white/30 font-mono">Software Engineer · SF</div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-purple-400/10 text-purple-400 border border-purple-400/15">98% Match</span>
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-blue-400/10 text-blue-400 border border-blue-400/15">Auto-Applied</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.015] border border-white/5 opacity-50">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-black border border-white/10 flex items-center justify-center text-white font-extrabold text-xs">V</div>
                          <div>
                            <div className="text-sm text-white font-semibold">Vercel</div>
                            <div className="text-[10px] text-white/30 font-mono">Frontend Dev · Remote</div>
                          </div>
                        </div>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-amber-400/10 text-amber-400 border border-amber-400/15">Interview Prep</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            TESTIMONIALS
        ═══════════════════════════════════════════ */}
        <section id="testimonials" className="py-28 px-6 relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="section-reveal text-center mb-16">
              <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-purple-400 mb-3">Real stories</p>
              <h2 className="text-[2.5rem] font-extrabold tracking-tight text-white mb-3">People are landing jobs with Spyde.</h2>
              <p className="text-[15px] text-white/35 max-w-lg mx-auto">Here&apos;s what early users have to say about their experience.</p>
            </div>

            <div id="testimonials-grid" className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                {
                  name: 'Rahul Mehta',
                  role: 'Senior PM at Stripe',
                  quote: "I was mass-applying and getting nowhere. Spyde found roles I'd never have searched for myself — then tailored my resume to each one. Got 3 FAANG interviews in a week.",
                  avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCh_t-Ep04UgKY1ezL3qRG7x6LUl0dzIFUqe1VtFT-wQqK-1aQzVFl205q-YyWPYsDRzBF98fnjMs6jZTH1e6VZIjZ6ZGl8CeJ55wFZC0DF8y8X4nIz_iIfBJT0DI7j-A5wjD9Mc9ISfe597Ley2RYsZhKKHr3z2B3B_DH9w--5e5c0U_hrXKO-EWjLQqmzqJ-1g0C35lJflKrnEmULo3-PzU8BXYYWHzFuOZ6Za3CXmLONDNz6jyh3wiwgP_OLK_ry13cUIjqC8rtK',
                  stars: 5,
                },
                {
                  name: 'Ananya Singh',
                  role: 'Frontend Engineer',
                  quote: 'The tracking pipeline is genuinely useful. I used to lose track of which companies I\'d applied to. Now everything\'s in one place and the daily digest keeps me accountable.',
                  avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuABIiQQIXUO24C93cZ-PgP1QXW9Kr7qy9EzC7yGQyzDtM5PaCnMX37XQZnVnynF3c9OmnSSw8QV5pwRB1Mx9PQLB2R4BpBYZ4IQZtBkrKljCWFFu5kSAea38zwOUWlh0occKqwXyrlb6g6JWOLJHG-Ewaa4slhz3ykUiXGXk5FAwTa4sm7KfFwn6WYrhpZACTHUA8oNSlhx_KEwYWGaA3-MrtwLLq5Mx9Bhqz1KANHfE3QconT2_Kd9y8mGppUQQorxn4Y92zhyzYEd',
                  stars: 5,
                },
                {
                  name: 'Marcus Chen',
                  role: 'DevOps Lead',
                  quote: 'Went from spending 2 hours a day on LinkedIn to 15 minutes reviewing Spyde\'s suggestions. The match quality is honestly better than any recruiter I\'ve worked with.',
                  avatar: null,
                  stars: 5,
                },
              ].map((t, i) => (
                <div key={i}
                     className={`testi group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-7 hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-300 ${i === 2 ? 'md:col-span-2' : ''}`}>
                  {/* Stars */}
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: t.stars }).map((_, j) => (
                      <Star key={j} size={14} className="fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  <p className="text-[15px] text-white/60 leading-relaxed mb-6">&ldquo;{t.quote}&rdquo;</p>

                  <div className="flex items-center gap-3">
                    {t.avatar ? (
                      <div className="w-10 h-10 rounded-full bg-cover bg-center border border-white/10"
                           style={{ backgroundImage: `url('${t.avatar}')` }} />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm border border-white/10">
                        {t.name[0]}
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-semibold text-white">{t.name}</div>
                      <div className="text-[12px] text-white/30">{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            FINAL CTA
        ═══════════════════════════════════════════ */}
        <section className="pb-28 px-6 relative z-10">
          <div className="cta-banner max-w-4xl mx-auto text-center rounded-3xl border border-white/[0.06] bg-white/[0.02] px-8 py-16 relative overflow-hidden">
            <div className="absolute inset-0 opacity-30 pointer-events-none"
                 style={{ background: 'radial-gradient(ellipse at center, rgba(91,138,255,0.15) 0%, transparent 60%)' }} />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-4">Ready to take control of your career?</h2>
              <p className="text-[15px] text-white/40 mb-8 max-w-md mx-auto">Join 5,000+ professionals using AI to land their dream roles. It&apos;s free to start.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="/signup"
                      className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#5b8aff] to-[#4eeabb] text-white font-bold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/35 hover:-translate-y-px transition-all duration-200 text-[15px]">
                  Create free account
                </Link>
                <Link href="/login"
                      className="px-8 py-3.5 rounded-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/[0.04] font-medium transition-all duration-200 text-[15px]">
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ═══════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════ */}
      <footer className="relative z-10 border-t border-white/[0.04] py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#5b8aff] to-[#4eeabb] flex items-center justify-center">
              <Radar size={14} className="text-white" />
            </div>
            <span className="text-sm font-bold text-white/50">Job Spyde</span>
          </div>
          <div className="flex items-center gap-6 text-[12px] text-white/25">
            <a href="#" className="hover:text-white/60 transition-colors">Privacy</a>
            <a href="#" className="hover:text-white/60 transition-colors">Terms</a>
            <a href="#" className="hover:text-white/60 transition-colors">GitHub</a>
            <span className="text-white/15">© 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
