
export interface Profile {
  first_name: string;
  last_name: string;
}

export interface CommunityPost {
  id: string;
  user_id: string;
  title: string;
  content: string;
  content_format?: 'plain' | 'rich';
  formatted_content?: any;
  category: string;
  anonymous: boolean;
  anonymous_alias?: string;
  created_at: string;
  updated_at: string;
  profile?: Profile;
  reactions_count?: { emoji_type: string; count: number }[];
  comments_count?: { count: number }[];
  user_reactions?: string[];
  is_bookmarked?: boolean;
  image_urls?: string[];
}

export interface PostComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  anonymous: boolean;
  anonymous_alias?: string;
  created_at: string;
  profile?: Profile;
}

export interface PostReaction {
  id: string;
  post_id: string;
  user_id: string;
  emoji_type: string;
  created_at: string;
}

export interface PostCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  created_at: string;
}

export interface PostBookmark {
  id: string;
  user_id: string;
  post_id: string;
  created_at: string;
}

export interface UserMention {
  id: string;
  post_id?: string;
  comment_id?: string;
  mentioned_user_id: string;
  mentioning_user_id: string;
  created_at: string;
}

export interface MentionSuggestion {
  id: string;
  display_name: string;
  first_name: string;
  last_name: string;
}

