export type ProfilePicture = File | string | null | undefined;

export interface ProfilePreviewUser {
  full_name: string;
  nickname?: string;
  age: number | string;
  bio?: string;
  course: string;
  accommodation?: string;
  university_year?: string;
  languages?: string[];
  ethnicities?: string[];
  home_area?: string;
  fun_fact?: string;
  societies?: string[];
  sports?: string[];
  gym_goer?: string;
  profile_picture?: ProfilePicture;
}

export interface ProfilePreviewProps {
  user_data: ProfilePreviewUser;
}

export interface UserProfileFormData {
  full_name: string;
  nickname: string;
  age: number | string;
  bio: string;
  course: string;
  accommodation?: string;
  university_year?: string;
  languages: string[];
  ethnicities: string[];
  home_area: string;
  fun_fact: string;
  societies: string[];
  sports: string[];
  gym_goer: string;
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
    type?: string;
    message?: string;
    created_at?: string;
}

export interface MessageBubbleProps {
    msg: Message;
    isMe: boolean;
}