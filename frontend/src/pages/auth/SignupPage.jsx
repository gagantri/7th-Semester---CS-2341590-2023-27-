import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Logo } from '@/components/brand/Logo';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { useAuth } from '@/context/AuthContext';
import { humanError } from '@/lib/api';
import { TEST_IDS } from '@/constants/testIds';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [city, setCity] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signup, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/app', { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signup({
        name: name.trim(),
        email: email.trim(),
        password,
        default_city: city.trim() || null,
      });
      toast.success('Welcome to GavixaCare');
      navigate('/app', { replace: true });
    } catch (err) {
      toast.error(humanError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + '/app';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(
      redirectUrl
    )}`;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border">
        <div className="mx-auto max-w-[1240px] px-4 md:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Logo size={28} />
          </Link>
          <ThemeToggle />
        </div>
      </header>
      <main className="flex-1 grid lg:grid-cols-2">
        <div className="hidden lg:flex items-center justify-center relative hero-mesh noise-overlay overflow-hidden order-2">
          <div className="absolute inset-0 pattern-dots opacity-40" />
          <div className="relative z-10 max-w-md p-10">
            <h2 className="text-3xl font-semibold tracking-tight">
              Join 1M+ Indian families taking back healthcare clarity.
            </h2>
            <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2" />
                Free forever tier — hospital compare + emergency
              </li>
              <li className="flex gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accent mt-2" />
                Unlimited AI bill analysis on Premium (₹29/month)
              </li>
              <li className="flex gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-2" />
                Family Premium (₹79/month): up to 6 profiles
              </li>
              <li className="flex gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-2" />
                ABDM-ready. DPDP-aligned. Made in Bharat.
              </li>
            </ul>
          </div>
        </div>

        <div className="flex items-center justify-center px-4 py-12 order-1">
          <div className="w-full max-w-md">
            <div className="text-sm text-muted-foreground">Create account</div>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">
              Sign up for GavixaCare
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Free forever. No credit card. Upgrade anytime for unlimited AI
              analyses.
            </p>

            <Card className="mt-6 border-border">
              <CardContent className="pt-6 space-y-4">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-11 gap-2"
                  onClick={handleGoogle}
                >
                  <GoogleGlyph /> Sign up with Google
                </Button>
                <div className="relative py-1">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      or with email
                    </span>
                  </div>
                </div>

                <form className="space-y-3" onSubmit={handleSubmit}>
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Full name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ramesh Kumar"
                      required
                      data-testid={TEST_IDS.auth.signupName}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      data-testid={TEST_IDS.auth.signupEmail}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="password">Password (min 8 chars)</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPw ? 'text' : 'password'}
                        minLength={8}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 8 characters"
                        required
                        data-testid={TEST_IDS.auth.signupPassword}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw((v) => !v)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 inline-flex items-center justify-center text-muted-foreground hover:text-foreground rounded-md"
                        aria-label={showPw ? 'Hide password' : 'Show password'}
                      >
                        {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="city">Default city (optional)</Label>
                    <Input
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Delhi, Mumbai, Bengaluru…"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-11"
                    disabled={loading}
                    data-testid={TEST_IDS.auth.signupSubmit}
                  >
                    {loading ? 'Creating account…' : (<>Create account <ArrowRight className="ml-1.5 h-4 w-4" /></>)}
                  </Button>
                </form>

                <div className="text-xs text-muted-foreground text-center">
                  Already have an account?{' '}
                  <Link to="/login" className="text-primary font-medium hover:underline">
                    Log in
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

function GoogleGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.4c-.3 1.6-1.2 2.9-2.5 3.8v3.2h4c2.3-2.2 3.6-5.3 3.6-9.2z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.3 0 6-1.1 8-2.9l-4-3.2c-1.1.7-2.4 1.1-4 1.1-3.1 0-5.7-2.1-6.6-4.9H1.3v3.1C3.3 21.3 7.3 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.4 14.1c-.2-.7-.4-1.5-.4-2.1s.1-1.4.4-2.1V6.8H1.3C.5 8.3 0 10.1 0 12s.5 3.7 1.3 5.2l4.1-3.1z"
      />
      <path
        fill="#EA4335"
        d="M12 4.8c1.8 0 3.4.6 4.6 1.8l3.5-3.5C18 1.1 15.3 0 12 0 7.3 0 3.3 2.7 1.3 6.8l4.1 3.1C6.3 6.9 8.9 4.8 12 4.8z"
      />
    </svg>
  );
}
