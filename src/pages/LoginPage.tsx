import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email.endsWith('@surrey.ac.uk')) {
      toast.error('Please use your Surrey email address.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('http://localhost:8080/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      const data = await res.json();

      if (res.ok) {
        login(
          data.user_id,
          data.user_name,
          data.profile_picture,
          data.is_admin
        );
        toast.success('Logged in successfully!');
        navigate('/friends-finder');
      } else {
        toast.error(data.detail || 'Invalid email or password');
      }
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong while logging in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-100 via-slate-50 to-blue-100 px-4">
      <Card className="w-full max-w-md rounded-3xl shadow-xl border border-black/5">
        <CardHeader className="text-center space-y-2 pt-10">
          <h1 className="text-3xl font-extrabold text-blue-500">
            Welcome back
          </h1>
          <p className="text-gray-500 text-sm">Log in to continue to Surreal</p>
        </CardHeader>

        <CardContent className="px-8 pb-10">
          <AnimatePresence mode="wait">
            <motion.form
              key="login"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="flex flex-col gap-5"
              onSubmit={(e) => {
                e.preventDefault();
                handleLogin();
              }}
            >
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">
                  Surrey email
                </label>
                <Input
                  placeholder="yourname@surrey.ac.uk"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="mt-2 h-11 text-base font-semibold bg-blue-500 text-white"
              >
                {loading ? 'Logging in…' : 'Log in'}
              </Button>

              <p className="text-sm text-gray-500 text-center">
                Don't have an account?{' '}
                <Link
                  to="/signup"
                  className="text-blue-500 font-medium hover:underline"
                >
                  Sign up
                </Link>
              </p>
            </motion.form>
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
