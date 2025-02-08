
export interface Profile {
  first_name: string;
  last_name: string;
}

export interface CommunityPost {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: string;
  anonymous: boolean;
  created_at: string;
  updated_at: string;
  profile?: Profile;
  reactions_count?: number;
  comments_count?: number;
  user_reaction?: string;
}

export interface PostComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  anonymous: boolean;
  created_at: string;
  profile?: Profile;
}

export interface PostReaction {
  id: string;
  post_id: string;
  user_id: string;
  reaction_type: string;
  created_at: string;
}
