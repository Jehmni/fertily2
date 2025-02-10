
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabase";

interface AvatarFormProps {
  avatarUrl?: string | null;
  avatarColor?: string;
  firstName?: string;
  lastName?: string;
  onAvatarUrlChange: (url: string) => void;
  onAvatarColorChange: (color: string) => void;
}

export const AvatarForm = ({
  avatarUrl,
  avatarColor = "#E2E8F0",
  firstName = "",
  lastName = "",
  onAvatarUrlChange,
  onAvatarColorChange,
}: AvatarFormProps) => {
  const [uploading, setUploading] = useState(false);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase() || 'U';
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${Math.random()}.${fileExt}`;

      setUploading(true);

      const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      onAvatarUrlChange(publicUrl);
    } catch (error) {
      console.error('Error uploading avatar:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16" style={{ backgroundColor: avatarColor }}>
          <AvatarImage src={avatarUrl || undefined} />
          <AvatarFallback>
            {getInitials(firstName, lastName)}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-2">
          <Label>Profile Picture</Label>
          <Input
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            disabled={uploading}
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Input
          type="color"
          value={avatarColor}
          onChange={(e) => onAvatarColorChange(e.target.value)}
          className="w-20 h-8 p-1"
        />
        <span className="text-sm text-muted-foreground">Avatar Background Color</span>
      </div>
    </div>
  );
};
