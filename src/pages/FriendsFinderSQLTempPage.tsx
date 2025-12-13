import { useEffect, useState } from "react";

const FriendsFinderTempPage = () => {
  const [message, setMessage] = useState<string>("Loading...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const insertMatches = async () => {
      try {
        const res = await fetch("/auth/insert-matched-users", {
          method: "POST",
          credentials: "include", // IMPORTANT: sends access_token cookie
        });

        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }

        const data = await res.json();
        setMessage(data.message);
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      }
    };

    insertMatches();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Insert Matched Users Test</h1>
      {error ? (
        <p className="text-red-500">Error: {error}</p>
      ) : (
        <p>{message}</p>
      )}
    </div>
  );
};

export default FriendsFinderTempPage;