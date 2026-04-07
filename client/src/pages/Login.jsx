import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (!formData.password) {
      setError('Password is required');
      return;
    }

    setLoading(true);
    const result = await login(formData);
    if (result.success) navigate('/');
    else setError(result.error);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[rgb(var(--color-app))] px-4 py-10">
      <div className="mx-auto grid max-w-5xl items-center gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="hidden lg:block">
          <div className="relative mx-auto aspect-[4/5] max-w-md overflow-hidden rounded-[40px] border border-white/50 bg-gradient-to-br from-orange-200 via-pink-200 to-fuchsia-200 p-6 shadow-2xl">
            <div className="absolute -right-8 top-10 h-40 w-40 rounded-full bg-white/40 blur-2xl" />
            <div className="absolute bottom-8 left-8 right-8 rounded-[32px] border border-white/60 bg-white/70 p-6 backdrop-blur-md">
              <div className="logo-script text-6xl text-black">RecipeGram</div>
              <p className="mt-4 text-sm leading-6 text-[rgb(var(--color-text-soft))]">
                Post plated shots, scroll short-form cooking reels, and keep your recipe circle feeling alive.
              </p>
            </div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-sm">
          <div className="ig-card p-8">
            <div className="text-center">
              <div className="logo-script text-6xl text-black">RecipeGram</div>
              <p className="mt-3 text-sm text-[rgb(var(--color-text-soft))]">Log in to see photos and videos from your food people.</p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-3">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
                className="input bg-[rgb(var(--color-app))]"
                placeholder="Email"
              />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
                className="input bg-[rgb(var(--color-app))]"
                placeholder="Password"
              />

              {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

              <button type="submit" disabled={loading} className="btn-primary mt-2 w-full rounded-xl">
                {loading ? 'Logging in...' : 'Log in'}
              </button>
            </form>
          </div>

          <div className="ig-card mt-4 px-6 py-5 text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-bold text-[rgb(var(--color-primary))]">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
