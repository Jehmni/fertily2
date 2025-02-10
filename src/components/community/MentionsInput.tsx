
import { useEffect, useState, useRef } from "react";
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
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  const { data: suggestions, isLoading } = useQuery({
    queryKey: ["mention-suggestions", searchTerm],
    queryFn: () => CommunityService.searchUsers(searchTerm),
    enabled: searchTerm.length > 0,
    initialData: [],
  });

  const calculateDropdownPosition = () => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const textBeforeCursor = value.substring(0, cursorPosition);
    const lines = textBeforeCursor.split('\n');
    const currentLineNumber = lines.length;
    const currentLineText = lines[lines.length - 1];

    const computedStyle = window.getComputedStyle(textarea);
    const lineHeight = parseInt(computedStyle.lineHeight);
    const paddingTop = parseInt(computedStyle.paddingTop);
    const paddingLeft = parseInt(computedStyle.paddingLeft);

    const span = document.createElement('span');
    span.style.font = computedStyle.font;
    span.style.visibility = 'hidden';
    span.style.whiteSpace = 'pre';
    span.textContent = currentLineText;
    document.body.appendChild(span);

    const textWidth = span.offsetWidth;
    document.body.removeChild(span);

    const rect = textarea.getBoundingClientRect();
    const scrollTop = textarea.scrollTop;

    setDropdownPosition({
      top: rect.top + (currentLineNumber * lineHeight) - scrollTop + paddingTop,
      left: rect.left + Math.min(textWidth, rect.width - 200) + paddingLeft
    });
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const newPosition = e.target.selectionStart || 0;

    // Update the value first
    onChange(newValue);
    
    // Then update cursor position and check for mentions
    setCursorPosition(newPosition);

    const lastAtSymbol = newValue.lastIndexOf('@', newPosition);
    if (lastAtSymbol !== -1) {
      const textAfterAt = newValue.slice(lastAtSymbol + 1, newPosition);
      if (!textAfterAt.includes(' ')) {
        setSearchTerm(textAfterAt);
        setOpen(true);
        calculateDropdownPosition();
        return;
      }
    }

    setOpen(false);
  };

  const insertMention = (user: MentionSuggestion) => {
    if (!textareaRef.current) return;

    const beforeMention = value.slice(0, cursorPosition);
    const lastAtPos = beforeMention.lastIndexOf('@');
    const afterMention = value.slice(cursorPosition);
    const newValue = `${value.slice(0, lastAtPos)}@${user.display_name}${afterMention}`;
    
    onChange(newValue);
    setOpen(false);

    // Set cursor position after the inserted mention
    const newCursorPosition = lastAtPos + user.display_name.length + 1;
    
    // Update cursor position after a brief delay to ensure the textarea has updated
    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
        setCursorPosition(newCursorPosition);
      }
    });
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (textareaRef.current && !textareaRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleTextareaChange}
        onSelect={(e) => {
          const target = e.target as HTMLTextAreaElement;
          setCursorPosition(target.selectionStart || 0);
          calculateDropdownPosition();
        }}
        placeholder={placeholder}
        className="min-h-[100px]"
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger className="hidden" />
        <PopoverContent 
          className="p-0 w-[200px]" 
          style={{
            position: 'fixed',
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
          }}
        >
          <Command>
            <CommandInput placeholder="Search users..." />
            <CommandEmpty>No users found.</CommandEmpty>
            <CommandGroup>
              {(suggestions || []).map((user) => (
                <CommandItem
                  key={user.id}
                  onSelect={() => insertMention(user)}
                  className="cursor-pointer"
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
