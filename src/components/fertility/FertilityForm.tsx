import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";

interface FertilityFormProps {
  cycleLength: number;
  lastPeriodDate: Date | null;
  onCycleLengthChange: (value: number) => void;
  onLastPeriodDateChange: (date: Date | null) => void;
  onCalculate: () => void;
  isLoading?: boolean;
}

export const FertilityForm = ({
  cycleLength,
  lastPeriodDate,
  onCycleLengthChange,
  onLastPeriodDateChange,
  onCalculate,
  isLoading
}: FertilityFormProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="cycleLength">Cycle Length (days)</Label>
        <Input
          id="cycleLength"
          type="number"
          min="21"
          max="35"
          value={cycleLength}
          onChange={(e) => onCycleLengthChange(parseInt(e.target.value))}
        />
      </div>
      <div className="space-y-2">
        <Label>Last Period Start Date</Label>
        <Calendar
          mode="single"
          selected={lastPeriodDate}
          onSelect={onLastPeriodDateChange}
          className="rounded-md border"
        />
      </div>
      <Button onClick={onCalculate} className="w-full md:col-span-2" disabled={isLoading}>
        {isLoading ? "Calculating..." : "Calculate Fertility Window"}
      </Button>
    </div>
  );
};