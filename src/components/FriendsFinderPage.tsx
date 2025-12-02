import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type UserProfile = {
  id: number;
  user_id: number;
  full_name: string;
  bio?: string;
  course?: string;
};

const PAGE_SIZE = 6;

const FriendsFinderPage = () => {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const res = await fetch("http://localhost:8000/user-profiles");
        const data: UserProfile[] = await res.json();
        setProfiles(data);
      } catch (err) {
        console.error("Failed to fetch profiles:", err);
      }
    };

    fetchProfiles();
  }, []);

  const visibleProfiles = profiles.slice(0, visibleCount);

  return (
    <div className="p-6 space-y-4">
      <div className="grid grid-cols-4 gap-6">
        {visibleProfiles.map((user) => (
          <Card key={user.user_id} className="h-40">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{user.full_name}</CardTitle>
              <p className="text-xs text-muted-foreground">
                {user.course || ""}
              </p>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {user.bio || ""}
            </CardContent>
          </Card>
        ))}
      </div>

      {profiles.length > visibleCount && (
        <Button
          variant="outline"
          onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
        >
          Show more…
        </Button>
      )}
    </div>
  );
};

export default FriendsFinderPage;
