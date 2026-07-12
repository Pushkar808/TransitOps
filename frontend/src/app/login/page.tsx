'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import { AnimatedHeading } from '@/components/animated-heading';
import { FadeIn } from '@/components/fade-in';
import { LogisticsHeroPlayer } from '@/components/logistics-hero-player';

const DEMO_ACCOUNTS = [
  { label: 'Admin', email: 'admin@transitops.com', password: 'Admin@123' },
  { label: 'Fleet Manager', email: 'fleet@transitops.com', password: 'Fleet@123' },
  { label: 'Driver', email: 'driver@transitops.com', password: 'Driver@123' },
  { label: 'Safety Officer', email: 'safety@transitops.com', password: 'Safety@123' },
  { label: 'Financial Analyst', email: 'finance@transitops.com', password: 'Finance@123' },
];

export default function LoginPage() {
  const { user, login, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = React.useState('admin@transitops.com');
  const [password, setPassword] = React.useState('Admin@123');
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!loading && user) router.replace('/dashboard');
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative w-full min-h-screen overflow-x-hidden bg-black text-white">

      {/* ── Background ──────────────────────────────────────────────── */}
      <LogisticsHeroPlayer />

      {/* ── Overlay: mobile/tablet uniform dark, desktop directional ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 0, background: 'rgba(0,0,0,0.58)' }}
      />
      <div
        className="absolute inset-0 pointer-events-none hidden lg:block"
        style={{
          zIndex: 1,
          background:
            'linear-gradient(to right, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.30) 50%, rgba(0,0,0,0.05) 100%)',
        }}
      />

      {/* ── Page Shell ──────────────────────────────────────────────── */}
      <div
        className="relative flex flex-col min-h-screen"
        style={{ zIndex: 2 }}
      >
        {/*
          Layout strategy:
          - Mobile   (< 640px)  : column, heading top, card bottom, scroll allowed
          - Tablet   (640-1023) : column, centered, more breathing room
          - Desktop  (1024px+)  : row, heading left, card right, vertically centered
        */}
        <div className="flex-1 flex flex-col lg:flex-row lg:items-center gap-0 lg:gap-12 xl:gap-20 px-5 sm:px-8 md:px-12 lg:px-16 xl:px-20 pt-12 sm:pt-16 md:pt-20 lg:pt-0 pb-8 sm:pb-12 lg:pb-0">

          {/* ── Left: Branding copy ───────────────────────────────────── */}
          <div className="flex-1 flex flex-col justify-center items-center lg:items-start text-center lg:text-left mb-8 sm:mb-10 lg:mb-0">
            <AnimatedHeading
              text={"Shaping tomorrow\nwith vision and action"}
              initialDelay={150}
              charDelay={25}
              className="font-normal mb-3 sm:mb-4 md:mb-5
                         text-[1.85rem] leading-[1.18]
                         sm:text-[2.4rem]
                         md:text-[3rem]
                         lg:text-[3.2rem]
                         xl:text-[3.8rem]
                         2xl:text-[4.5rem]
                         text-white"
              style={{ letterSpacing: '-0.03em' }}
            />
            <FadeIn delay={850} duration={900}>
              <p className="text-gray-300 leading-relaxed
                            text-sm max-w-[300px]
                            sm:text-base sm:max-w-sm
                            md:text-lg md:max-w-md
                            mx-auto lg:mx-0">
                Every route optimized. Every driver empowered.
                Every rupee accounted for. This is the command center
                your fleet deserves.
              </p>
            </FadeIn>
          </div>

          {/* ── Right: Login card ─────────────────────────────────────── */}
          <div className="flex justify-center lg:justify-end shrink-0 w-full lg:w-auto pb-8 lg:pb-0">
            <FadeIn
              delay={1050}
              duration={900}
              className="w-full max-w-[340px] sm:max-w-[380px] md:max-w-[400px] lg:max-w-[360px] xl:max-w-[390px]"
            >
              <div
                id="login-card"
                className="liquid-glass border border-white/20 rounded-2xl w-full
                           p-5 sm:p-6 md:p-8"
              >
                {/* Card header */}
                <div className="mb-5 sm:mb-6 text-center">
                  <div className="inline-flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-white/10 mb-3">
                    <svg
                      className="h-4 w-4 sm:h-5 sm:w-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7h8M8 12h5m-5 5h3M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-lg sm:text-xl font-semibold text-white">Sign in</h2>
                  <p className="text-xs sm:text-sm text-white/55 mt-1">
                    Access your operations account
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                  <div className="space-y-1">
                    <label
                      htmlFor="login-email"
                      className="block text-[10px] sm:text-xs font-semibold text-white/60 uppercase tracking-widest"
                    >
                      Email
                    </label>
                    <input
                      id="login-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      className="w-full rounded-lg bg-white/10 border border-white/20
                                 px-3 py-2 sm:px-4 sm:py-2.5
                                 text-sm text-white placeholder-white/35
                                 outline-none focus:border-white/50 focus:bg-white/15
                                 transition-all duration-200"
                      placeholder="you@example.com"
                    />
                  </div>

                  <div className="space-y-1">
                    <label
                      htmlFor="login-password"
                      className="block text-[10px] sm:text-xs font-semibold text-white/60 uppercase tracking-widest"
                    >
                      Password
                    </label>
                    <input
                      id="login-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      className="w-full rounded-lg bg-white/10 border border-white/20
                                 px-3 py-2 sm:px-4 sm:py-2.5
                                 text-sm text-white placeholder-white/35
                                 outline-none focus:border-white/50 focus:bg-white/15
                                 transition-all duration-200"
                      placeholder="••••••••"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full mt-1 bg-white text-black rounded-lg
                               py-2 sm:py-2.5
                               text-sm font-semibold
                               hover:bg-gray-100 active:scale-[0.98]
                               disabled:opacity-50 disabled:cursor-not-allowed
                               transition-all duration-200"
                  >
                    {submitting ? 'Signing in…' : 'Sign in'}
                  </button>
                </form>

                {/* Demo quick-login */}
                <div className="mt-4 sm:mt-5">
                  <p className="text-center text-[10px] sm:text-xs text-white/35 mb-2 sm:mb-3">
                    Quick demo login
                  </p>
                  <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                    {DEMO_ACCOUNTS.map((a) => (
                      <button
                        key={a.email}
                        type="button"
                        onClick={() => {
                          setEmail(a.email);
                          setPassword(a.password);
                        }}
                        className="rounded-lg border border-white/15 bg-white/5
                                   px-2 sm:px-3 py-1.5 sm:py-2
                                   text-[10px] sm:text-xs text-white/65
                                   hover:bg-white/15 hover:text-white
                                   active:scale-[0.97]
                                   transition-all duration-150 text-left truncate"
                      >
                        {a.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>

        </div>
      </div>
    </div>
  );
}