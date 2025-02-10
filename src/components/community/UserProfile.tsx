
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { CommunityService } from "@/services/CommunityService";
import { useAuth } from "@/hooks/useAuth";
import { FollowButton } from "./FollowButton";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface UserProfileProps {
  userId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const UserProfile = ({ userId, isOpen, onOpenChange }: UserProfileProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [newMessage, setNewMessage] = useState("");

  const { data: profile } = useQuery({
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

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    try {
      await CommunityService.sendPrivateMessage(userId, newMessage.trim());
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully.",
      });
      setNewMessage("");
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!profile) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>User Profile</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
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

          {user && userId !== user.id && (
            <div className="space-y-4">
              <FollowButton userId={userId} />
              
              {followingStatus && (
                <div className="space-y-2">
                  <Textarea
                    placeholder="Write a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="min-h-[100px]"
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="w-full"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                </div>
              )}
              
              {!followingStatus && (
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
