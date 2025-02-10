
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Send, Upload, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { CommunityService } from "@/services/CommunityService";
import { useAuth } from "@/hooks/useAuth";
import { FollowButton } from "./FollowButton";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";

interface UserProfileProps {
  userId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const UserProfile = ({ userId, isOpen, onOpenChange }: UserProfileProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [newMessage, setNewMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [avatarColor, setAvatarColor] = useState("#E2E8F0"); // Default color

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

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/${Math.random()}.${fileExt}`;

      setUploading(true);

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      await CommunityService.updateProfile({
        avatar_url: publicUrl,
        avatar_color: avatarColor,
      });

      await refetchProfile();

      toast({
        title: "Success",
        description: "Avatar updated successfully",
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Error",
        description: "Failed to upload avatar",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleColorChange = async (color: string) => {
    try {
      setAvatarColor(color);
      await CommunityService.updateProfile({
        avatar_color: color,
      });
      await refetchProfile();
    } catch (error) {
      console.error('Error updating avatar color:', error);
      toast({
        title: "Error",
        description: "Failed to update avatar color",
        variant: "destructive",
      });
    }
  };

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

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase() || 'U';
  };

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
              <div className="space-y-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={uploading}
                />
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={avatarColor}
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="w-20 h-8 p-1"
                  />
                  <span className="text-sm text-muted-foreground">Background Color</span>
                </div>
              </div>
            </div>
          )}

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
