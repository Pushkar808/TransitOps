'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { AnimatedHeading } from '@/components/animated-heading';
import { FadeIn } from '@/components/fade-in';
import { ChevronRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DEMO_ACCOUNTS = [
  { label: 'Admin', email: 'admin@transitops.com', password: 'Admin@123' },
  { label: 'Fleet Mgr', email: 'fleet@transitops.com', password: 'Fleet@123' },
  { label: 'Driver', email: 'driver@transitops.com', password: 'Driver@123' },
  { label: 'Safety', email: 'safety@transitops.com', password: 'Safety@123' },
  { label: 'Finance', email: 'finance@transitops.com', password: 'Finance@123' },
];

const ROLES = [
  { value: 'FLEET_MANAGER', label: 'Fleet Manager' },
  { value: 'DRIVER', label: 'Driver' },
  { value: 'SAFETY_OFFICER', label: 'Safety Officer' },
  { value: 'FINANCIAL_ANALYST', label: 'Financial Analyst' },
];

type Mode = 'login' | 'signup';

export default function LoginPage() {
  const { user, login, loading } = useAuth();
  const router = useRouter();

  const [mode, setMode] = React.useState<Mode>('login');
  const [signupDone, setSignupDone] = React.useState(false);

  // Login form
  const [email, setEmail] = React.useState('admin@transitops.com');
  const [password, setPassword] = React.useState('Admin@123');
  const [submitting, setSubmitting] = React.useState(false);

  // Signup form
  const [sig, setSig] = React.useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'DRIVER',
    // Driver extras
    licenseNo: '',
    licenseCategory: 'LGV',
    licenseExpiry: '',
    contact: '',
  });

  React.useEffect(() => {
    if (!loading && user) router.replace('/dashboard');
  }, [user, loading, router]);

  const handleLogin = async (e: React.FormEvent) => {
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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sig.password !== sig.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setSubmitting(true);
    try {
      const payload: Record<string, string> = {
        name: sig.name,
        email: sig.email,
        password: sig.password,
        role: sig.role,
      };
      if (sig.role === 'DRIVER') {
        if (sig.licenseNo) payload.licenseNo = sig.licenseNo;
        if (sig.licenseCategory) payload.licenseCategory = sig.licenseCategory;
        if (sig.licenseExpiry) payload.licenseExpiry = sig.licenseExpiry;
        if (sig.contact) payload.contact = sig.contact;
      }
      await api.post('/auth/signup', payload, false);
      setSignupDone(true);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setSignupDone(false);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white flex flex-col">
      {/* ─── Video Background ─────────────────────────────────── */}
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

      <div className="relative flex flex-col min-h-screen" style={{ zIndex: 1 }}>
        {/* ─── Navbar ────────────────────────────────────────── */}
        <div className="px-6 md:px-12 lg:px-16 pt-6">
          <nav className="liquid-glass rounded-xl px-4 py-2 flex items-center justify-between">
            <span className="text-2xl font-semibold tracking-tight text-white select-none">
              TransitOps
            </span>
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
            <button
              onClick={() => switchMode('login')}
              className="bg-white text-black px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors duration-200"
            >
              Sign In
            </button>
          </nav>
        </div>

        {/* ─── Hero + Card ───────────────────────────────────── */}
        <div className="flex-1 flex flex-col justify-end px-6 md:px-12 lg:px-16 pb-12 lg:pb-16">
          <div className="lg:grid lg:grid-cols-2 lg:items-end gap-8">
            {/* Left Column */}
            <div>
              <AnimatedHeading
                text={"Shaping tomorrow\nwith vision and action."}
                initialDelay={200}
                charDelay={30}
                className="font-normal mb-4 text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-white"
                style={{ letterSpacing: '-0.04em' }}
              />
              <FadeIn delay={800} duration={1000}>
                <p className="text-base md:text-lg text-gray-300 mb-5">
                  Digitize your fleet operations — vehicles, drivers, dispatch, maintenance and
                  expenses — all from a single, intelligent platform.
                </p>
              </FadeIn>
              <FadeIn delay={1200} duration={1000}>
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={() => switchMode('signup')}
                    className="bg-white text-black px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors duration-200 flex items-center gap-2"
                  >
                    Request Access <ChevronRight className="h-4 w-4" />
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

            {/* Right Column */}
            <div className="flex flex-col items-start lg:items-end gap-6 mt-10 lg:mt-0">
              {/* Tag pill */}
              <FadeIn delay={1400} duration={1000}>
                <div className="liquid-glass border border-white/20 px-6 py-3 rounded-xl">
                  <span className="text-lg md:text-xl lg:text-2xl font-light text-white">
                    Vehicles. Drivers. Finance.
                  </span>
                </div>
              </FadeIn>

              {/* Auth Card */}
              <FadeIn delay={1000} duration={1000} className="w-full max-w-sm">
                <div
                  id="auth-card"
                  className="liquid-glass border border-white/20 rounded-2xl p-8 w-full"
                >
                  {/* Mode Switcher */}
                  {!signupDone && (
                    <div
                      className="flex rounded-xl p-1 mb-6"
                      style={{ background: 'rgba(255,255,255,0.07)' }}
                    >
                      {(['login', 'signup'] as Mode[]).map((m) => (
                        <button
                          key={m}
                          onClick={() => switchMode(m)}
                          className="flex-1 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
                          style={
                            mode === m
                              ? { background: 'rgba(255,255,255,0.15)', color: 'white' }
                              : { color: 'rgba(255,255,255,0.45)' }
                          }
                        >
                          {m === 'login' ? 'Sign In' : 'Request Access'}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* ── LOGIN FORM ── */}
                  {mode === 'login' && (
                    <>
                      <div className="mb-5 text-center">
                        <h2 className="text-lg font-semibold text-white">Sign in</h2>
                        <p className="text-xs text-white/40 mt-1">Access your operations account</p>
                      </div>
                      <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-1">
                          <label htmlFor="login-email" className="text-[11px] font-semibold uppercase tracking-wide text-white/45">Email</label>
                          <input
                            id="login-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-white/40 transition-all duration-200"
                            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
                            placeholder="you@example.com"
                          />
                        </div>
                        <div className="space-y-1">
                          <label htmlFor="login-password" className="text-[11px] font-semibold uppercase tracking-wide text-white/45">Password</label>
                          <input
                            id="login-password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-white/40 transition-all duration-200"
                            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
                            placeholder="••••••••"
                          />
                        </div>
                        <Button
                          type="submit"
                          disabled={submitting}
                          className="w-full bg-white text-black rounded-lg py-2.5 text-sm font-medium hover:bg-gray-100 disabled:opacity-50 transition-colors duration-200 mt-2"
                        >
                          {submitting ? 'Signing in…' : 'Sign in'}
                        </Button>
                      </form>

                      <div className="mt-5">
                        <p className="text-center text-[11px] text-white/30 mb-3">Quick demo login</p>
                        <div className="grid grid-cols-3 gap-1.5">
                          {DEMO_ACCOUNTS.map((a) => (
                            <button
                              key={a.email}
                              type="button"
                              onClick={() => { setEmail(a.email); setPassword(a.password); }}
                              className="rounded-lg py-1.5 text-[11px] text-white/55 hover:bg-white/10 hover:text-white transition-all duration-200"
                              style={{ border: '1px solid rgba(255,255,255,0.10)' }}
                            >
                              {a.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* ── SIGNUP SUCCESS ── */}
                  {mode === 'signup' && signupDone && (
                    <div className="text-center py-4">
                      <div className="flex justify-center mb-4">
                        <CheckCircle2 className="h-12 w-12 text-emerald-400" />
                      </div>
                      <h2 className="text-lg font-semibold text-white mb-2">Request Submitted!</h2>
                      <p className="text-sm text-white/50 mb-6">
                        Your access request is pending admin approval. You'll be able to sign in once approved.
                      </p>
                      <button
                        onClick={() => switchMode('login')}
                        className="w-full bg-white text-black rounded-lg py-2.5 text-sm font-medium hover:bg-gray-100 transition-colors duration-200"
                      >
                        Back to Sign In
                      </button>
                    </div>
                  )}

                  {/* ── SIGNUP FORM ── */}
                  {mode === 'signup' && !signupDone && (
                    <>
                      <div className="mb-5 text-center">
                        <h2 className="text-lg font-semibold text-white">Request Access</h2>
                        <p className="text-xs text-white/40 mt-1">Submit your details for admin approval</p>
                      </div>
                      <form onSubmit={handleSignup} className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                        {/* Name */}
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold uppercase tracking-wide text-white/45">Full Name</label>
                          <input
                            type="text"
                            value={sig.name}
                            onChange={(e) => setSig({ ...sig, name: e.target.value })}
                            required
                            placeholder="John Smith"
                            className="w-full rounded-lg px-3 py-2 text-sm text-white placeholder-white/25 outline-none transition-all duration-200"
                            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
                          />
                        </div>
                        {/* Email */}
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold uppercase tracking-wide text-white/45">Email</label>
                          <input
                            type="email"
                            value={sig.email}
                            onChange={(e) => setSig({ ...sig, email: e.target.value })}
                            required
                            placeholder="you@example.com"
                            className="w-full rounded-lg px-3 py-2 text-sm text-white placeholder-white/25 outline-none transition-all duration-200"
                            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
                          />
                        </div>
                        {/* Role */}
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold uppercase tracking-wide text-white/45">Role Requested</label>
                          <select
                            value={sig.role}
                            onChange={(e) => setSig({ ...sig, role: e.target.value })}
                            required
                            className="w-full rounded-lg px-3 py-2 text-sm text-white/80 outline-none transition-all duration-200 cursor-pointer"
                            style={{ background: 'rgba(20,20,20,0.95)', border: '1px solid rgba(255,255,255,0.12)' }}
                          >
                            {ROLES.map((r) => (
                              <option key={r.value} value={r.value}>{r.label}</option>
                            ))}
                          </select>
                        </div>
                        {/* Password */}
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold uppercase tracking-wide text-white/45">Password</label>
                            <input
                              type="password"
                              value={sig.password}
                              onChange={(e) => setSig({ ...sig, password: e.target.value })}
                              required
                              minLength={6}
                              placeholder="Min 6 chars"
                              className="w-full rounded-lg px-3 py-2 text-sm text-white placeholder-white/25 outline-none transition-all duration-200"
                              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold uppercase tracking-wide text-white/45">Confirm</label>
                            <input
                              type="password"
                              value={sig.confirmPassword}
                              onChange={(e) => setSig({ ...sig, confirmPassword: e.target.value })}
                              required
                              placeholder="Repeat"
                              className="w-full rounded-lg px-3 py-2 text-sm text-white placeholder-white/25 outline-none transition-all duration-200"
                              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
                            />
                          </div>
                        </div>

                        {/* ── DRIVER EXTRA FIELDS ── */}
                        {sig.role === 'DRIVER' && (
                          <div
                            className="rounded-xl p-3 space-y-3"
                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                          >
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-white/35">
                              Driver Details
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <label className="text-[11px] text-white/40">License No</label>
                                <input
                                  type="text"
                                  value={sig.licenseNo}
                                  onChange={(e) => setSig({ ...sig, licenseNo: e.target.value })}
                                  placeholder="DL-1234567"
                                  className="w-full rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 outline-none transition-all duration-200"
                                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[11px] text-white/40">Category</label>
                                <select
                                  value={sig.licenseCategory}
                                  onChange={(e) => setSig({ ...sig, licenseCategory: e.target.value })}
                                  className="w-full rounded-lg px-3 py-2 text-sm text-white/80 outline-none cursor-pointer"
                                  style={{ background: 'rgba(20,20,20,0.95)', border: '1px solid rgba(255,255,255,0.10)' }}
                                >
                                  <option value="LGV">LGV</option>
                                  <option value="HGV">HGV</option>
                                  <option value="PCV">PCV</option>
                                  <option value="Car">Car</option>
                                </select>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <label className="text-[11px] text-white/40">Expiry Date</label>
                                <input
                                  type="date"
                                  value={sig.licenseExpiry}
                                  onChange={(e) => setSig({ ...sig, licenseExpiry: e.target.value })}
                                  className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none transition-all duration-200"
                                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[11px] text-white/40">Contact No.</label>
                                <input
                                  type="tel"
                                  value={sig.contact}
                                  onChange={(e) => setSig({ ...sig, contact: e.target.value })}
                                  placeholder="+91 9876543210"
                                  className="w-full rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 outline-none transition-all duration-200"
                                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        <Button
                          type="submit"
                          disabled={submitting}
                          className="w-full bg-white text-black rounded-lg py-2.5 text-sm font-medium hover:bg-gray-100 disabled:opacity-50 transition-colors duration-200 mt-1"
                        >
                          {submitting ? 'Submitting…' : 'Submit Request'}
                        </Button>
                      </form>
                    </>
                  )}
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}