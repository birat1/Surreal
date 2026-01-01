import type { UserProfileFriendsFinderPreview } from '@/types/types';

import defaultProfile from '../assets/default_profile.jpeg';

import { Card, CardContent, CardHeader } from './ui/card';

interface FriendsFinderCardPreviewProps {
  profile: UserProfileFriendsFinderPreview;
}

const FriendsFinderCardPreview = ({
  profile,
}: FriendsFinderCardPreviewProps) => {
  let imageSrc = defaultProfile;

  if (profile.profile_picture) {
    // File preview (before upload)

    if (profile.profile_picture instanceof File) {
      imageSrc = URL.createObjectURL(profile.profile_picture);
    } else if (typeof profile.profile_picture === 'string') {
      const pic = profile.profile_picture.trim();
      if (pic && pic !== 'null' && pic !== 'undefined') {
        if (pic.startsWith('http')) {
          imageSrc = pic;
        }
      }
    }
  }

  return (
    <Card className="relative bg-blue-50 rounded-xl shadow-md flex flex-col">
      <CardHeader className="flex flex-col items-center gap-2 pb-1 pt-4">
        <img
          src={imageSrc}
          alt={profile.full_name}
          className="w-14 h-14 rounded-full object-cover"
        />
        <h2 className="text-lg font-semibold">
          {profile.full_name || 'Your Name'}
        </h2>
      </CardHeader>

      <CardContent className="px-4 pb-4 pt-0 space-y-1 flex flex-col">
        <p>Age: {profile.age || '—'}</p>
        <p>Course: {profile.course || '—'}</p>
        <p>Fun Fact: {profile.fun_fact || '—'}</p>
      </CardContent>
    </Card>
  );
};

export default FriendsFinderCardPreview;
