
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

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16" style={{ backgroundColor: avatarColor }}>
          <AvatarImage src={avatarUrl || undefined} />
          <AvatarFallback>
            {getInitials(firstName, lastName)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <Label>Choose Avatar</Label>
          <p className="text-sm text-muted-foreground">Select an avatar to represent you</p>
        </div>
      </div>

      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full flex justify-between">
            <span>Browse Avatars</span>
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4">
          <RadioGroup
            value={avatarUrl || ''}
            onValueChange={onAvatarUrlChange}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4"
          >
            {presetAvatars.map((avatar) => (
              <div key={avatar.id} className="text-center space-y-2">
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
                    <AvatarImage src={avatar.url} alt={avatar.name} />
                    <AvatarFallback>{avatar.name[0]}</AvatarFallback>
                  </Avatar>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {avatar.name}
                  </span>
                </label>
              </div>
            ))}
          </RadioGroup>
        </CollapsibleContent>
      </Collapsible>

      <div className="flex items-center gap-2">
        <input
          type="color"
          value={avatarColor}
          onChange={(e) => onAvatarColorChange(e.target.value)}
          className="w-20 h-8 p-1 rounded cursor-pointer"
        />
        <span className="text-sm text-muted-foreground">Avatar Background Color</span>
      </div>
    </div>
  );
};
