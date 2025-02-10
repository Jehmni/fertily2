
import { describe, it, expect, beforeEach } from 'vitest';
import { CommunityService } from '@/services/CommunityService';
import { supabase } from '@/lib/supabase';

describe('Community Features', () => {
  // Clear test data before each test
  beforeEach(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // Clean up test data
      await supabase.from('user_follows').delete().eq('follower_id', user.id);
      await supabase.from('private_messages').delete().eq('sender_id', user.id);
    }
  });

  describe('User Following', () => {
    it('should allow following a user', async () => {
      const testUserId = 'test-user-id';
      await CommunityService.followUser(testUserId);
      const isFollowing = await CommunityService.getFollowingStatus(testUserId);
      expect(isFollowing).toBe(true);
    });

    it('should allow unfollowing a user', async () => {
      const testUserId = 'test-user-id';
      await CommunityService.followUser(testUserId);
      await CommunityService.unfollowUser(testUserId);
      const isFollowing = await CommunityService.getFollowingStatus(testUserId);
      expect(isFollowing).toBe(false);
    });

    it('should get correct follower counts', async () => {
      const testUserId = 'test-user-id';
      await CommunityService.followUser(testUserId);
      const counts = await CommunityService.getFollowerCounts(testUserId);
      expect(counts).toHaveProperty('follower_count');
      expect(counts).toHaveProperty('following_count');
      expect(typeof counts.follower_count).toBe('number');
      expect(typeof counts.following_count).toBe('number');
    });
  });
});

