
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useEffect, useRef } from "react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export const SearchBar = ({ value, onChange }: SearchBarProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout>();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      onChange(newValue);
    }, 300);
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  // Update input value when prop changes
  useEffect(() => {
    if (inputRef.current && inputRef.current.value !== value) {
      inputRef.current.value = value;
    }
  }, [value]);

  return (
    <div className="relative flex-1">
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        ref={inputRef}
        placeholder="Search posts..."
        className="pl-8"
        defaultValue={value}
        onChange={handleChange}
      />
    </div>
  );
};
