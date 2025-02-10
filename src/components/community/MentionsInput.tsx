
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
  const [mentionState, setMentionState] = useState({
    isOpen: false,
    searchTerm: "",
    cursorPosition: 0
  });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  const { data: suggestions } = useQuery({
    queryKey: ["mention-suggestions", mentionState.searchTerm],
    queryFn: () => CommunityService.searchUsers(mentionState.searchTerm),
    enabled: mentionState.searchTerm.length > 0,
    initialData: [],
  });

  const calculateDropdownPosition = () => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const textBeforeCursor = value.substring(0, mentionState.cursorPosition);
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
    const cursorPosition = e.target.selectionStart ?? 0;
    const lastAtSymbol = newValue.lastIndexOf('@', cursorPosition);
    
    onChange(newValue);

    if (lastAtSymbol !== -1) {
      const textAfterAt = newValue.slice(lastAtSymbol + 1, cursorPosition);
      if (!textAfterAt.includes(' ')) {
        setMentionState({
          isOpen: true,
          searchTerm: textAfterAt,
          cursorPosition
        });
        calculateDropdownPosition();
        return;
      }
    }

    setMentionState(prev => ({
      ...prev,
      isOpen: false,
      cursorPosition
    }));
  };

  const insertMention = (user: MentionSuggestion) => {
    if (!textareaRef.current) return;

    const lastAtPos = value.lastIndexOf('@', mentionState.cursorPosition);
    const newValue = `${value.slice(0, lastAtPos)}@${user.display_name}${value.slice(mentionState.cursorPosition)}`;
    const newCursorPosition = lastAtPos + user.display_name.length + 1;
    
    onChange(newValue);
    setMentionState({
      isOpen: false,
      searchTerm: "",
      cursorPosition: newCursorPosition
    });

    textareaRef.current.focus();
    textareaRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (textareaRef.current && !textareaRef.current.contains(event.target as Node)) {
        setMentionState(prev => ({ ...prev, isOpen: false }));
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
          setMentionState(prev => ({
            ...prev,
            cursorPosition: target.selectionStart ?? 0
          }));
          calculateDropdownPosition();
        }}
        placeholder={placeholder}
        className="min-h-[100px]"
      />
      <Popover open={mentionState.isOpen}>
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
              {suggestions?.map((user) => (
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
