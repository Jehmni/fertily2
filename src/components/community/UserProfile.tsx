
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { CommunityService } from "@/services/CommunityService";
import { useAuth } from "@/hooks/useAuth";
import { FollowButton } from "./FollowButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AvatarUpload } from "../profile/AvatarUpload";
import { MessageForm } from "../profile/MessageForm";

interface UserProfileProps {
  userId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const UserProfile = ({ userId, isOpen, onOpenChange }: UserProfileProps) => {
  const { user } = useAuth();

  const { data: profile, refetch: refetchProfile } = useQuery({
    queryKey: ["user-profile", userId],
    queryFn: () => CommunityService.getUserProfile(userId),
    enabled: !!userId,
  });

  const { data: followerCounts } = useQuery({
    queryKey: ["follower-counts", userId],
    queryFn: () => CommunityService.getFollowerCounts(userId),
    enabled: !!userId,
  });

  const { data: followingStatus } = useQuery({
    queryKey: ["following-status", userId],
    queryFn: () => CommunityService.getFollowingStatus(userId),
    enabled: !!userId && !!user && userId !== user.id,
  });

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase() || 'U';
  };

  if (!profile) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>User Profile</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16" style={{ backgroundColor: profile.avatar_color || '#E2E8F0' }}>
              <AvatarImage src={profile.avatar_url} />
              <AvatarFallback>
                {getInitials(profile.first_name, profile.last_name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold">
                {profile.first_name} {profile.last_name}
              </h3>
              {followerCounts && (
                <p className="text-sm text-muted-foreground">
                  {followerCounts.follower_count} followers · {followerCounts.following_count} following
                </p>
              )}
            </div>
          </div>

          {user && userId === user.id && (
            <div className="space-y-4 border rounded-lg p-4">
              <h4 className="font-medium">Customize Avatar</h4>
              <AvatarUpload userId={userId} onSuccess={refetchProfile} />
            </div>
          )}

          {user && userId !== user.id && (
            <div className="space-y-4">
              <FollowButton userId={userId} />
              
              {followingStatus ? (
                <MessageForm recipientId={userId} onSuccess={() => onOpenChange(false)} />
              ) : (
                <p className="text-sm text-muted-foreground">
                  Follow this user to send them messages
                </p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
