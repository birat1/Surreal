export type ProfilePicture = File | string | null | undefined;

export interface ProfilePreviewUser {
    full_name: string;
    username: string;
    age: number | string;
    bio?: string;
    course: string;
    accommodation?: string;
    university_year: string;
    languages?: string[];
    ethnicities?: string[];
    home_area?: string;
    fun_fact: string;
    societies?: string[];
    sports?: string[];
    gym_goer?: string;
    profile_picture: ProfilePicture;
    show_full_name: boolean;
    show_username: boolean;
    show_age: boolean;
    show_bio: boolean;
    show_course: boolean;
    show_accommodation: boolean;
    show_university_year: boolean;
    show_languages: boolean;
    show_ethnicities: boolean;
    show_home_area: boolean;
    show_fun_fact: boolean;
    show_societies: boolean;
    show_sports: boolean;
    show_gym_goer: boolean;
}

export interface ProfilePreviewProps {
    user_data: ProfilePreviewUser;
}

export interface UserProfileFormData {
    full_name: string;
    username: string;
    age: number | string;
    bio: string;
    course: string;
    accommodation?: string;
    university_year: string;
    languages: string[];
    ethnicities: string[];
    home_area: string;
    fun_fact: string;
    societies: string[];
    sports: string[];
    gym_goer: string;
    profile_picture: ProfilePicture;

    show_full_name: boolean;
    show_username: boolean;
    show_age: boolean;
    show_bio: boolean;
    show_course: boolean;
    show_accommodation: boolean;
    show_university_year: boolean;
    show_languages: boolean;
    show_ethnicities: boolean;
    show_home_area: boolean;
    show_fun_fact: boolean;
    show_societies: boolean;
    show_sports: boolean;
    show_gym_goer: boolean;
}

export interface UserProfileFormProps {
    formData: UserProfileFormData;
    setFormData: React.Dispatch<React.SetStateAction<UserProfileFormData>>;
}

export interface Message {
    id?: string;
    conversation_id?: string;
    sender_id: string;
    recipient_id: string;
    body: string;
    type?: string;
    created_at?: string;
}

export interface MessageBubbleProps {
    msg: Message;
    isMe: boolean;
    senderName: string;
}

export interface Conversation {
    id: string;
    recipient_id: string;
    recipient_name?: string;
    last_message: string;
    last_sender_id: string;
    updated_at: string;
}

export interface ConversationInboxProps {
    conversations: Conversation[];
    currentRecipientId: string;
    currentUserId: string;
    currentUserName: string;
    onSelect: (recipientId: string, recipientName?: string) => void;
    token: string;
}

<<<<<<< HEAD
export interface UserProfileFriendsFinder {
  id: number;
  user_id: number;
  full_name: string;
  age: number;
  nickname?: string;
  bio: string;
  course: string;
  accommodation?: string;
  university_year: string;
  languages?: string[];
  ethnicities?: string[];
  home_area?: string;
  fun_fact?: string;
  societies?: string[];
  sports?: string[];
  gym_goer?: boolean;
  profile_picture: ProfilePicture;
}

export interface UserProfileFriendsFinderProps {
  profile: UserProfileFriendsFinder;
=======
export interface ChatInputProps {
    onSend: (message: string) => void;
    disabled?: boolean;
}

export interface UserProfileFriendsFinder {
    id: number;
    user_id: number;
    full_name: string;
    age: number;
    username: string;
    bio: string;
    course: string;
    accommodation?: string;
    university_year: string;
    languages?: string[];
    ethnicities?: string[];
    home_area?: string;
    fun_fact?: string;
    societies?: string[];
    sports?: string[];
    gym_goer?: boolean;
}

export interface UserProfileFriendsFinderProps {
    profile: UserProfileFriendsFinder;
>>>>>>> ef528d6d76084c1effca5282d178ea61fd79eafd
}
