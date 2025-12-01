export type ProfilePicture = File | string | null | undefined;

export interface ProfilePreviewUser {
  full_name: string;
  nickname?: string;
  age: number | string;
  bio?: string;
  course: string;
  accomodation?: string;
  university_year?: number | string;
  languages?: string;
  ethnicity?: string;
  home_area?: string;
  fun_fact?: string;
  societies?: string[];
  sports?: string[];
  gym_goer?: boolean;
  profile_picture?: ProfilePicture;
}

export interface ProfilePreviewProps {
  user_data: ProfilePreviewUser;
}

export interface UserProfileFormData {
  full_name: string;
  nickname: string;
  age: string | number;
  bio: string;
  course: string;
  accomodation: string;
  university_year: string | number;
  languages: string;
  ethnicity: string;
  home_area: string;
  fun_fact: string;
  societies: string[];
  sports: string[];
  gym_goer: boolean;
  profile_picture: ProfilePicture;
}

export interface UserProfileFormProps {
  formData: UserProfileFormData;
  setFormData: React.Dispatch<React.SetStateAction<UserProfileFormData>>;
}

export interface Message {
    id?: string;
    sender: string;
    recipient: string;
    body: string;
    side: 'left' | 'right';
    type?: string;
    message?: string;
    created_at?: string;
}