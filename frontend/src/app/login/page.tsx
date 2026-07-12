'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import { AnimatedHeading } from '@/components/animated-heading';
import { FadeIn } from '@/components/fade-in';

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
  const [navOpen, setNavOpen] = React.useState(false);

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
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white flex flex-col">
      {/* ─── Video Background ─────────────────────────────────────── */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
        style={{ zIndex: 0 }}
      >
        <source
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260403_050628_c4e32401-fab4-4a27-b7a8-6e9291cd5959.mp4"
          type="video/mp4"
        />
      </video>

      {/* ─── Content (above video) ─────────────────────────────────── */}
      <div className="relative flex flex-col min-h-screen" style={{ zIndex: 1 }}>

        {/* ─── Navbar ──────────────────────────────────────────────── */}
        <div className="px-6 md:px-12 lg:px-16 pt-6">
          <nav className="liquid-glass rounded-xl px-4 py-2 flex items-center justify-between">
            {/* Logo */}
            <span className="text-2xl font-semibold tracking-tight text-white select-none">
              TransitOps
            </span>

            {/* Center links — hidden on mobile */}
            <div className="hidden md:flex items-center gap-8">
              {['Dashboard', 'Vehicles', 'Drivers', 'Finance'].map((link) => (
                <button
                  key={link}
                  onClick={() => router.push('/dashboard')}
                  className="text-sm text-white/80 hover:text-gray-300 transition-colors duration-200"
                >
                  {link}
                </button>
              ))}
            </div>

            {/* CTA */}
            <button
              onClick={() => {
                const el = document.getElementById('login-card');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-white text-black px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors duration-200"
            >
              Sign In
            </button>
          </nav>
        </div>

        {/* ─── Hero Content ─────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col justify-end px-6 md:px-12 lg:px-16 pb-12 lg:pb-16">
          <div className="lg:grid lg:grid-cols-2 lg:items-end gap-8">

            {/* Left Column — Hero Copy */}
            <div>
              {/* Animated Heading */}
              <AnimatedHeading
                text={"Shaping tomorrow\nwith vision and action."}
                initialDelay={200}
                charDelay={30}
                className="font-normal mb-4 text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-white"
                style={{ letterSpacing: '-0.04em' }}
              />

              {/* Subheading */}
              <FadeIn delay={800} duration={1000}>
                <p className="text-base md:text-lg text-gray-300 mb-5">
                  Digitize your fleet operations — vehicles, drivers, dispatch, maintenance and
                  expenses — all from a single, intelligent platform.
                </p>
              </FadeIn>

              {/* Buttons */}
              <FadeIn delay={1200} duration={1000}>
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={() => {
                      const el = document.getElementById('login-card');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="bg-white text-black px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors duration-200"
                  >
                    Start a Chat
                  </button>
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="liquid-glass border border-white/20 text-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-black transition-all duration-200"
                  >
                    Explore Now
                  </button>
                </div>
              </FadeIn>
            </div>

            {/* Right Column — Login Card + Tag */}
            <div className="flex flex-col items-start lg:items-end gap-6 mt-10 lg:mt-0">
              {/* Tag pill */}
              <FadeIn delay={1400} duration={1000}>
                <div className="liquid-glass border border-white/20 px-6 py-3 rounded-xl">
                  <span className="text-lg md:text-xl lg:text-2xl font-light text-white">
                    Vehicles. Drivers. Finance.
                  </span>
                </div>
              </FadeIn>

              {/* Login card */}
              <FadeIn delay={1000} duration={1000} className="w-full max-w-sm">
                <div
                  id="login-card"
                  className="liquid-glass border border-white/20 rounded-2xl p-8 w-full"
                >
                  {/* Card header */}
                  <div className="mb-6 text-center">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 mb-3">
                      <svg
                        className="h-5 w-5 text-white"
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
                    <h2 className="text-xl font-semibold text-white">Sign in</h2>
                    <p className="text-sm text-white/60 mt-1">Access your operations account</p>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                      <label htmlFor="login-email" className="text-xs font-medium text-white/70 uppercase tracking-wide">
                        Email
                      </label>
                      <input
                        id="login-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-2.5 text-sm text-white placeholder-white/40 outline-none focus:border-white/50 focus:bg-white/15 transition-all duration-200"
                        placeholder="you@example.com"
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="login-password" className="text-xs font-medium text-white/70 uppercase tracking-wide">
                        Password
                      </label>
                      <input
                        id="login-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-2.5 text-sm text-white placeholder-white/40 outline-none focus:border-white/50 focus:bg-white/15 transition-all duration-200"
                        placeholder="••••••••"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-white text-black rounded-lg py-2.5 text-sm font-medium hover:bg-gray-100 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-200 mt-2"
                    >
                      {submitting ? 'Signing in…' : 'Sign in'}
                    </button>
                  </form>

                  {/* Demo accounts */}
                  <div className="mt-5">
                    <p className="text-center text-xs text-white/40 mb-3">Quick demo login</p>
                    <div className="grid grid-cols-2 gap-2">
                      {DEMO_ACCOUNTS.map((a) => (
                        <button
                          key={a.email}
                          type="button"
                          onClick={() => {
                            setEmail(a.email);
                            setPassword(a.password);
                          }}
                          className="rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-xs text-white/70 hover:bg-white/15 hover:text-white transition-all duration-200 text-left"
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
    </div>
  );
}