
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { CommunityService } from "@/services/CommunityService";
import type { MentionSuggestion } from "@/types/community";
import { useQuery } from "@tanstack/react-query";

interface MentionsInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const MentionsInput = ({ value, onChange, placeholder }: MentionsInputProps) => {
  const [open, setOpen] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: suggestions = [] } = useQuery({
    queryKey: ["mention-suggestions", searchTerm],
    queryFn: () => CommunityService.searchUsers(searchTerm),
    enabled: searchTerm.length > 0,
  });

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const position = e.target.selectionStart;
    setCursorPosition(position);

    // Check if we should open mentions popup
    const lastAtSymbol = newValue.lastIndexOf('@', position);
    if (lastAtSymbol !== -1) {
      const textAfterAt = newValue.slice(lastAtSymbol + 1, position);
      if (!textAfterAt.includes(' ')) {
        setSearchTerm(textAfterAt);
        setOpen(true);
        return;
      }
    }

    setOpen(false);
    onChange(newValue);
  };

  const insertMention = (user: MentionSuggestion) => {
    const lastAtSymbol = value.lastIndexOf('@', cursorPosition);
    const beforeMention = value.slice(0, lastAtSymbol);
    const afterMention = value.slice(cursorPosition);
    const newValue = `${beforeMention}@${user.display_name}${afterMention}`;
    
    onChange(newValue);
    setOpen(false);
  };

  return (
    <div className="relative w-full">
      <Textarea
        value={value}
        onChange={handleTextareaChange}
        placeholder={placeholder}
        className="min-h-[100px]"
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger className="hidden" />
        <PopoverContent className="p-0" align="start">
          <Command>
            <CommandInput placeholder="Search users..." />
            <CommandEmpty>No users found.</CommandEmpty>
            <CommandGroup>
              {suggestions.map((user) => (
                <CommandItem
                  key={user.id}
                  onSelect={() => insertMention(user)}
                >
                  {user.display_name}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

