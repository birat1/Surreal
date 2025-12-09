import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const navigate = useNavigate();

    const { login } = useAuth();

    const handleLogin = async () => {
        try {
            const res = await fetch('/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
                credentials: 'include',
            });

            if (res.ok) {
                const data = await res.json();
                login(data.user_id, data.user_name);
                navigate('/friends-finder');
            } else {
                const errorData = await res.json();
                alert(errorData.detail);
            }
        } catch (err) {
            console.error(err);
            alert('Something went wrong while logging in');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader>
                    <h2 className="text-blue-600 text-2xl font-bold text-center">
                        Log In
                    </h2>
                </CardHeader>

                <CardContent className="flex flex-col gap-4">
                    <Input
                        placeholder="Enter your Surrey email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <Input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button onClick={handleLogin}>Login</Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default LoginPage;
