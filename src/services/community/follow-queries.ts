
import { supabase } from "@/lib/supabase";

export const followQueries = {
  async getCurrentUserId() {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id;
  },

  async followUser(userId: string) {
    const currentUserId = await this.getCurrentUserId();
    return supabase
      .from('user_follows')
      .insert([{ follower_id: currentUserId, following_id: userId }]);
  },

  async unfollowUser(userId: string) {
    const currentUserId = await this.getCurrentUserId();
    return supabase
      .from('user_follows')
      .delete()
      .eq('following_id', userId)
      .eq('follower_id', currentUserId);
  },

  async getFollowingStatus(userId: string) {
    const currentUserId = await this.getCurrentUserId();
    return supabase
      .from('user_follows')
      .select('id')
      .eq('following_id', userId)
      .eq('follower_id', currentUserId)
      .maybeSingle();
  },

  async getFollowerCount(userId: string) {
    return supabase
      .from('user_follower_counts')
      .select('follower_count, following_count')
      .eq('user_id', userId)
      .single();
  }
};
