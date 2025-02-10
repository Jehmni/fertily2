
import { supabase } from "@/lib/supabase";

export const followQueries = {
  followUser: (userId: string) =>
    supabase
      .from('user_follows')
      .insert([{ follower_id: supabase.auth.getUser().then(({ data }) => data.user?.id), following_id: userId }]),

  unfollowUser: (userId: string) =>
    supabase
      .from('user_follows')
      .delete()
      .eq('following_id', userId)
      .eq('follower_id', supabase.auth.getUser().then(({ data }) => data.user?.id)),

  getFollowingStatus: (userId: string) =>
    supabase
      .from('user_follows')
      .select('id')
      .eq('following_id', userId)
      .eq('follower_id', supabase.auth.getUser().then(({ data }) => data.user?.id))
      .single(),

  getFollowerCount: (userId: string) =>
    supabase
      .from('user_follower_counts')
      .select('follower_count, following_count')
      .eq('user_id', userId)
      .single()
};
