import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFieldErrors((prev) => ({ ...prev, [e.target.name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const errors = {};
    if (!formData.username.trim()) errors.username = 'Username is required';
    else if (formData.username.length < 3 || formData.username.length > 30) errors.username = 'Username must be between 3 and 30 characters';
    else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) errors.username = 'Username can only contain letters, numbers, and underscores';

    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Please enter a valid email address';

    if (!formData.password) errors.password = 'Password is required';
    else if (formData.password.length < 6) errors.password = 'Password must be at least 6 characters';

    if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    const { confirmPassword, ...userData } = formData;
    const result = await register(userData);
    if (result.success) navigate('/');
    else setError(result.error);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[rgb(var(--color-app))] px-4 py-10">
      <div className="mx-auto grid max-w-5xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="hidden lg:block">
          <div className="rounded-[40px] border border-white/60 bg-white/70 p-8 backdrop-blur-md shadow-2xl">
            <div className="logo-script text-6xl text-black">RecipeGram</div>
            <h1 className="mt-6 text-4xl font-extrabold text-black">Start your recipe era.</h1>
            <p className="mt-3 max-w-md text-sm leading-6 text-[rgb(var(--color-text-soft))]">
              Build your profile, collect saved dishes, post reels, and make the app feel like a real food-first social space.
            </p>
            <div className="mt-8 grid gap-3">
              {['Photo-first posts', 'Food creator profiles', 'Quick cooking reels'].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl bg-white px-4 py-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-[rgb(var(--color-primary))]">+</div>
                  <span className="font-semibold text-black">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-md">
          <div className="ig-card p-8">
            <div className="text-center">
              <div className="logo-script text-6xl text-black">RecipeGram</div>
              <p className="mt-3 text-sm text-[rgb(var(--color-text-soft))]">Sign up to share what&apos;s cooking.</p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-3">
              <div>
                <input type="text" name="username" value={formData.username} onChange={handleChange} className="input bg-[rgb(var(--color-app))]" placeholder="Username" />
                {fieldErrors.username && <p className="mt-2 text-xs font-medium text-red-600">{fieldErrors.username}</p>}
              </div>
              <div>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="input bg-[rgb(var(--color-app))]" placeholder="Email" />
                {fieldErrors.email && <p className="mt-2 text-xs font-medium text-red-600">{fieldErrors.email}</p>}
              </div>
              <div>
                <input type="password" name="password" value={formData.password} onChange={handleChange} className="input bg-[rgb(var(--color-app))]" placeholder="Password" />
                {fieldErrors.password && <p className="mt-2 text-xs font-medium text-red-600">{fieldErrors.password}</p>}
              </div>
              <div>
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="input bg-[rgb(var(--color-app))]" placeholder="Confirm password" />
                {fieldErrors.confirmPassword && <p className="mt-2 text-xs font-medium text-red-600">{fieldErrors.confirmPassword}</p>}
              </div>

              {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

              <button type="submit" disabled={loading} className="btn-primary mt-2 w-full rounded-xl">
                {loading ? 'Creating account...' : 'Sign up'}
              </button>
            </form>
          </div>

          <div className="ig-card mt-4 px-6 py-5 text-center text-sm">
            Have an account?{' '}
            <Link to="/login" className="font-bold text-[rgb(var(--color-primary))]">
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
