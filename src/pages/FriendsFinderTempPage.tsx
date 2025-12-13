import { useEffect, useState } from 'react';

const FriendsFinderTempPage = () => {
    const [result, setResult] = useState<any>(null);

    useEffect(() => {
        const getCompareProfiles = async () => {
            try {
                // Hit the new backend route you created
                const res = await fetch('/auth/compare-profiles', {
                    method: 'GET',
                    credentials: 'include', // important if using cookies/JWT
                });

                if (!res.ok) {
                    throw new Error(`Error: ${res.status}`);
                }

                const data = await res.json();
                setResult(data);
            } catch (err) {
                console.error('Failed to fetch compare profiles', err);
            }
        };

        getCompareProfiles();
    }, []);

    return (
        <div className="flex flex-col items-center mt-10 px-6">
            <h1 className="text-xl font-bold mb-4">Friends Finder Test Page</h1>

            {result ? (
                <pre className="bg-gray-100 p-4 rounded w-full max-w-2xl overflow-auto">
                    {JSON.stringify(result, null, 2)}
                </pre>
            ) : (
                <p>Loading... hi there</p>
            )}
        </div>
    );
};

export default FriendsFinderTempPage;
