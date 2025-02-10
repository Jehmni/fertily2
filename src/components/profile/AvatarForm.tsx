
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface PresetAvatar {
  id: string;
  url: string;
  name: string;
}

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
  const [presetAvatars, setPresetAvatars] = useState<PresetAvatar[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase() || 'U';
  };

  useEffect(() => {
    const fetchPresetAvatars = async () => {
      const { data, error } = await supabase
        .from('preset_avatars')
        .select('*');
      
      if (error) {
        console.error('Error fetching preset avatars:', error);
        return;
      }

      setPresetAvatars(data);
    };

    fetchPresetAvatars();
  }, []);

  const handleAvatarChange = (url: string) => {
    onAvatarUrlChange(url);
    setIsOpen(false); // Close the collapsible when an avatar is selected
  };

  return (
    <div className="space-y-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <div className="flex items-center gap-4 cursor-pointer hover:opacity-90 transition-opacity">
            <Avatar className="h-20 w-20" style={{ backgroundColor: avatarColor }}>
              <AvatarImage src={avatarUrl || undefined} />
              <AvatarFallback>
                {getInitials(firstName, lastName)}
              </AvatarFallback>
            </Avatar>
            {!avatarUrl && (
              <div className="flex-1">
                <Label>Change Avatar</Label>
                <p className="text-sm text-muted-foreground">Click to choose an avatar</p>
              </div>
            )}
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4">
          <RadioGroup
            value={avatarUrl || ''}
            onValueChange={handleAvatarChange}
            className="grid grid-cols-3 sm:grid-cols-4 gap-4"
          >
            {presetAvatars.map((avatar) => (
              <div key={avatar.id} className="text-center">
                <RadioGroupItem
                  value={avatar.url}
                  id={avatar.id}
                  className="peer sr-only"
                />
                <label
                  htmlFor={avatar.id}
                  className="block cursor-pointer rounded-lg p-2 hover:bg-muted peer-checked:ring-2 peer-checked:ring-primary"
                >
                  <Avatar className="h-16 w-16 mx-auto">
                    <AvatarImage src={avatar.url} alt="Avatar option" />
                    <AvatarFallback>Avatar</AvatarFallback>
                  </Avatar>
                </label>
              </div>
            ))}
          </RadioGroup>

          <div className="flex items-center gap-2 mt-4 pt-4 border-t">
            <input
              type="color"
              value={avatarColor}
              onChange={(e) => onAvatarColorChange(e.target.value)}
              className="w-20 h-8 p-1 rounded cursor-pointer"
            />
            <span className="text-sm text-muted-foreground">Default background color</span>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

