
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export const SearchBar = ({ value, onChange }: SearchBarProps) => {
  const [searchTerm, setSearchTerm] = useState(value || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onChange(searchTerm);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex-1 flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchTerm}
          placeholder="Search posts..."
          className="pl-8"
          onChange={handleChange}
        />
      </div>
      <Button type="submit" size="sm">
        Search
      </Button>
    </form>
  );
};
