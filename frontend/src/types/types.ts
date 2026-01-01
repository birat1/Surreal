export type ProfilePicture = File | string | null | undefined;

export interface UserProfile {
  user_id?: number;
  profile_picture?: ProfilePicture;
  is_admin?: boolean;
  full_name: string;
  username: string;
  age: number | string;
  bio?: string;
  course: string;
  accommodation?: string;
  university_year: string;
  languages: string[];
  ethnicities: string[];
  home_area?: string;
  fun_fact: string;
  societies: string[];
  sports: string[];
  gym_goer: string;

  show_bio: boolean;
  show_accommodation: boolean;
  show_languages: boolean;
  show_ethnicities: boolean;
  show_home_area: boolean;
  show_societies: boolean;
  show_sports: boolean;
  show_gym_goer: boolean;
}

export interface ProfilePreviewProps {
  user_data: UserProfile;
}

export interface UserProfileFormData extends UserProfile {}

export interface UserProfileFormProps {
  formData: UserProfileFormData;
  setFormData: React.Dispatch<React.SetStateAction<UserProfileFormData>>;
  mode?: 'create' | 'edit';
}

export interface VisibilityToggleProps {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}

export interface Message {
  id?: string;
  conversation_id?: string;
  sender_id: string;
  recipient_id: string;
  body: string;
  type?: string;
  created_at?: string;
  read_at?: string | null;
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
  isAuthenticated: boolean;
}

export interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export interface UserProfileFriendsFinder extends UserProfile {
  id: number;
  user_id: number;
}

export interface UserProfileFriendsFinderProps {
  profile: UserProfileFriendsFinder;
  onMaximise?: () => void;
}

export interface UserProfileFriendsFinderPreview {
  user_id?: number;
  full_name: string;
  age: number | string;
  course: string;
  fun_fact: string;
  profile_picture?: ProfilePicture | null;
}

export interface Event {
  id: number;
  name_of_event: string;
  event_date: string;
  event_time: string;
  event_location: string;
  event_organiser: string;
  attendees?: Attendee[];
}

export interface EventsPageProps {
  event: Event;
  children?: React.ReactNode;
  onRsvp: (eventId: number) => void;
}

export interface CreateEventFormData {
  name_of_event: string;
  event_date: string;
  event_time: string;
  event_location: string;
  event_organiser: string;
}

export interface CreateEventFormProps {
  formData: CreateEventFormData;
  setFormData: React.Dispatch<React.SetStateAction<CreateEventFormData>>;
}

export interface Attendee {
  user_id: number;
  username: string;
}
