import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface CycleInfoFormProps {
  cycleLength: string;
  lastPeriodDate: Date | undefined;
  onCycleLengthChange: (value: string) => void;
  onLastPeriodDateChange: (date: Date | undefined) => void;
}

export const CycleInfoForm = ({
  cycleLength,
  lastPeriodDate,
  onCycleLengthChange,
  onLastPeriodDateChange,
}: CycleInfoFormProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="cycleLength">Average Cycle Length (days)</Label>
        <Input
          id="cycleLength"
          type="number"
          value={cycleLength}
          onChange={(e) => onCycleLengthChange(e.target.value)}
          placeholder="28"
          min="20"
          max="45"
        />
      </div>

      <div className="space-y-2">
        <Label>Last Period Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !lastPeriodDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {lastPeriodDate ? (
                format(lastPeriodDate, "PPP")
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={lastPeriodDate}
              onSelect={onLastPeriodDateChange}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};