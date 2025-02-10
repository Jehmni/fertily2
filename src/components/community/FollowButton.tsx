
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, UserMinus } from "lucide-react";
import { CommunityService } from "@/services/CommunityService";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface FollowButtonProps {
  userId: string;
  initialIsFollowing?: boolean;
}

export const FollowButton = ({ userId, initialIsFollowing = false }: FollowButtonProps) => {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const checkFollowStatus = async () => {
      try {
        const status = await CommunityService.getFollowingStatus(userId);
        setIsFollowing(status);
      } catch (error) {
        console.error("Error checking follow status:", error);
      }
    };

    checkFollowStatus();
  }, [userId]);

  const handleToggleFollow = async () => {
    setIsLoading(true);
    try {
      if (isFollowing) {
        await CommunityService.unfollowUser(userId);
        toast({
          title: "Unfollowed successfully",
        });
      } else {
        await CommunityService.followUser(userId);
        toast({
          title: "Following successfully",
        });
      }
      setIsFollowing(!isFollowing);
      queryClient.invalidateQueries({ queryKey: ["follower-counts", userId] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={isFollowing ? "destructive" : "default"}
      size="sm"
      onClick={handleToggleFollow}
      disabled={isLoading}
    >
      {isFollowing ? (
        <>
          <UserMinus className="h-4 w-4 mr-2" />
          Unfollow
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4 mr-2" />
          Follow
        </>
      )}
    </Button>
  );
};
