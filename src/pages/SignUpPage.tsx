import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

    const [error, setError] = useState('');

    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSendCode = async () => {
        if (!email.endsWith('@surrey.ac.uk')) {
            alert('Please use your Surrey email address.');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/auth/send-verification-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            if (res.ok) {
                setStep('verify');
            } else {
                const errorData = await res.json();
                setError(
                    errorData.detail || 'Error sending code. Please try again'
                );
            }
        } catch (err) {
            console.error(err);
            alert('Something went wrong.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async () => {
        try {
            const res = await fetch('/auth/verify-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, code }),
                credentials: 'include',
            });

            const data = await res.json();

            if (res.ok) {
                login(data.user_id, data.user_name);
                alert('Account created successfully!');
                navigate('/user-profile');
            } else {
                alert(data.detail || 'Invalid or expired code.');
            }
        } catch (err) {
            console.error(err);
            alert('Something went wrong verifying code.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader>
                    <h2 className="text-blue-600 text-2xl font-bold text-center">
                        Sign Up
                    </h2>
                </CardHeader>

                <CardContent className="flex flex-col gap-4">
                    {step === 'signup' && (
                        <div className="flex flex-col gap-4">
                            {error && (
                                <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg">
                                    {error}
                                    {error.includes('already exists') && ( // display this box specifically if the error is the 'user already exists' error
                                        <button
                                            onClick={() => navigate('/login')}
                                            className="block mt-2 text-blue-600 underline font-medium cursor-pointer"
                                        >
                                            Log in instead
                                        </button>
                                    )}
                                </div>
                            )}
                            <Input
                                placeholder="Enter your Surrey email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <Input
                                type="password"
                                placeholder="Choose a password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <Button onClick={handleSendCode} disabled={loading}>
                                {loading ? 'Sending' : 'Sign Up'}
                            </Button>
                        </div>
                    )}

                    {step === 'verify' && (
                        <div className="flex flex-col gap-4">
                            <p className="text-center text-gray-600">
                                We sent a code to{' '}
                                <span className="font-semibold">{email}</span>
                            </p>
                            <Input
                                placeholder="Enter 6-digit code"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                            />
                            <Button onClick={handleVerifyCode}>Verify</Button>
                            <p className="text-sm text-gray-500 text-center">
                                Didn't get the code?{' '}
                                <span
                                    onClick={handleSendCode}
                                    className="text-blue-600 hover:underline cursor-pointer"
                                >
                                    Resend
                                </span>
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default SignUpPage;
