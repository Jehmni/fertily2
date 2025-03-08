
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format, parse, isValid } from "date-fns";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface PersonalInfoFormProps {
  firstName: string;
  lastName: string;
  dateOfBirth?: Date;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onDateOfBirthChange: (date?: Date) => void;
}

export const PersonalInfoForm = ({
  firstName,
  lastName,
  dateOfBirth,
  onFirstNameChange,
  onLastNameChange,
  onDateOfBirthChange,
}: PersonalInfoFormProps) => {
  const [dateInput, setDateInput] = useState(dateOfBirth ? format(dateOfBirth, "yyyy-MM-dd") : "");

  const handleDateInput = (value: string) => {
    setDateInput(value);
    const parsedDate = parse(value, "yyyy-MM-dd", new Date());
    if (isValid(parsedDate)) {
      onDateOfBirthChange(parsedDate);
    }
  };

  const handleCalendarSelect = (date?: Date) => {
    onDateOfBirthChange(date);
    if (date) {
      setDateInput(format(date, "yyyy-MM-dd"));
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            value={firstName}
            onChange={(e) => onFirstNameChange(e.target.value)}
            placeholder="Enter your first name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={lastName}
            onChange={(e) => onLastNameChange(e.target.value)}
            placeholder="Enter your last name"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dateOfBirth">Date of Birth</Label>
        <div className="flex gap-2">
          <Input
            type="date"
            id="dateOfBirth"
            value={dateInput}
            onChange={(e) => handleDateInput(e.target.value)}
            className="flex-1"
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-10 p-0",
                  !dateOfBirth && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={dateOfBirth}
                onSelect={handleCalendarSelect}
                disabled={(date) =>
                  date > new Date() || date < new Date("1900-01-01")
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
};
