
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useEffect, useState, useCallback } from "react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export const SearchBar = ({ value, onChange }: SearchBarProps) => {
  const [localValue, setLocalValue] = useState(value);

  // Memoize the debounced onChange handler
  const debouncedOnChange = useCallback(() => {
    if (localValue !== value) {
      onChange(localValue);
    }
  }, [localValue, onChange, value]);

  useEffect(() => {
    const timer = setTimeout(debouncedOnChange, 300);
    return () => clearTimeout(timer);
  }, [debouncedOnChange]);

  // Sync local value when prop value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  return (
    <div className="relative flex-1">
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search posts..."
        className="pl-8"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
      />
    </div>
  );
};
