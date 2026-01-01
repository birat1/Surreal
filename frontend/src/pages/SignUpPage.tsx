import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';

const SignUpPage = () => {
  const [step, setStep] = useState<'signup' | 'verify'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSendCode = async () => {
    if (!email.endsWith('@surrey.ac.uk')) {
      toast.error('Please use your Surrey email address.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        'http://localhost:8080/auth/send-verification-code',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        toast.success('Verification code sent!');
        setStep('verify');
      } else {
        toast.error(data.detail || 'Error sending code. Please try again.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong while sending the code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8080/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, code }),
        credentials: 'include',
      });

      const data = await res.json();

      if (res.ok) {
        login(data.user_id, data.user_name);
        toast.success('Account created successfully!');
        navigate('/user-profile');
      } else {
        toast.error(data.detail || 'Invalid or expired code.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong while verifying the code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-100 via-slate-50 to-blue-100 px-4">
      <Card className="w-full max-w-md rounded-3xl shadow-xl border border-black/5">
        <CardHeader className="text-center space-y-2 pt-10">
          <h1 className="text-3xl font-extrabold text-blue-500">
            Create your account
          </h1>
          <p className="text-gray-500 text-sm">
            Sign up using your Surrey email
          </p>
        </CardHeader>

        <CardContent className="px-8 pb-10">
          <AnimatePresence mode="wait">
            {step === 'signup' && (
              <motion.form
                key="signup"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="flex flex-col gap-5"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendCode();
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
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="mt-2 h-11 text-base font-semibold bg-blue-500 text-white"
                >
                  {loading ? 'Sending code…' : 'Continue'}
                </Button>

                <p className="text-center text-sm text-gray-500">
                  Already have an account?{' '}
                  <span
                    onClick={() => navigate('/login')}
                    className="cursor-pointer font-medium text-blue-500 hover:underline"
                  >
                    Log in
                  </span>
                </p>
              </motion.form>
            )}

            {step === 'verify' && (
              <motion.form
                key="verify"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="flex flex-col gap-5"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleVerifyCode();
                }}
              >
                <p className="text-center text-gray-600 text-sm">
                  We've sent a 6-digit code to
                  <br />
                  <span className="font-semibold text-gray-900">{email}</span>
                </p>

                <Input
                  placeholder="Enter verification code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />

                <Button
                  type="submit"
                  disabled={loading}
                  className="h-11 text-base font-semibold bg-blue-500 text-white"
                >
                  {loading ? 'Verifying…' : 'Verify & create account'}
                </Button>

                <p className="text-sm text-gray-500 text-center">
                  Didn't get the code?{' '}
                  <span
                    onClick={handleSendCode}
                    className="text-blue-500 hover:underline cursor-pointer font-medium"
                  >
                    Resend
                  </span>
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUpPage;
