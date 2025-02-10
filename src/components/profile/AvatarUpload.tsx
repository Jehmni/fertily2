
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { CommunityService } from "@/services/CommunityService";

interface AvatarUploadProps {
  userId: string;
  onSuccess: () => Promise<void>;
}

export const AvatarUpload = ({ userId, onSuccess }: AvatarUploadProps) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [avatarColor, setAvatarColor] = useState("#E2E8F0");

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

      await onSuccess();

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
      await onSuccess();
    } catch (error) {
      console.error('Error updating avatar color:', error);
      toast({
        title: "Error",
        description: "Failed to update avatar color",
        variant: "destructive",
      });
    }
  };

  return (
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
  );
};
