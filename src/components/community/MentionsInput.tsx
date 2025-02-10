
import { useEffect, useState, useRef } from "react";
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [triggerPosition, setTriggerPosition] = useState({ top: 0, left: 0 });

  const { data: suggestions = [] } = useQuery({
    queryKey: ["mention-suggestions", searchTerm],
    queryFn: () => CommunityService.searchUsers(searchTerm),
    enabled: searchTerm.length > 0,
  });

  const updateCursorPosition = (element: HTMLTextAreaElement) => {
    const position = element.selectionStart;
    setCursorPosition(position);
    
    // Calculate dropdown position based on cursor
    const cursorCoords = getCaretCoordinates(element, position);
    if (cursorCoords) {
      const rect = element.getBoundingClientRect();
      setTriggerPosition({
        top: cursorCoords.top + rect.top,
        left: cursorCoords.left + rect.left
      });
    }
  };

  const getCaretCoordinates = (element: HTMLTextAreaElement, position: number) => {
    const { offsetHeight: textHeight } = element;
    const div = document.createElement('div');
    const copyStyle = getComputedStyle(element);
    
    for (const prop of copyStyle) {
      div.style[prop as any] = copyStyle.getPropertyValue(prop);
    }
    
    div.style.position = 'absolute';
    div.style.visibility = 'hidden';
    div.style.height = 'auto';
    div.style.width = element.offsetWidth + 'px';
    
    const text = value.substring(0, position);
    div.textContent = text;
    
    document.body.appendChild(div);
    const lineHeight = parseInt(copyStyle.lineHeight);
    const lines = Math.floor(div.offsetHeight / lineHeight);
    const top = lines * lineHeight;
    const left = div.offsetWidth;
    
    document.body.removeChild(div);
    
    return { top, left };
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const position = e.target.selectionStart;
    
    updateCursorPosition(e.target);

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
    
    // Restore focus and set cursor position after mention
    if (textareaRef.current) {
      const newCursorPosition = lastAtSymbol + user.display_name.length + 1;
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
      updateCursorPosition(textareaRef.current);
    }
  };

  return (
    <div className="relative w-full">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleTextareaChange}
        onSelect={(e) => updateCursorPosition(e.target as HTMLTextAreaElement)}
        placeholder={placeholder}
        className="min-h-[100px]"
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger className="hidden" />
        <PopoverContent 
          className="p-0" 
          style={{
            position: 'absolute',
            top: `${triggerPosition.top}px`,
            left: `${triggerPosition.left}px`,
          }}
        >
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
