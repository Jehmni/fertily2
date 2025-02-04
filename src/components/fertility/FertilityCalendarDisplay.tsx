import { Calendar } from "@/components/ui/calendar";
import { format, isSameDay, isWithinInterval } from "date-fns";

interface FertilityCalendarDisplayProps {
  selectedDate: Date;
  onDateSelect: (date: Date | undefined) => void;
  fertileWindow: { start: Date; end: Date } | null;
  lastPeriodDate: Date | null;
}

export const FertilityCalendarDisplay = ({
  selectedDate,
  onDateSelect,
  fertileWindow,
  lastPeriodDate,
}: FertilityCalendarDisplayProps) => {
  const modifiers = {
    fertile: (date: Date) => {
      if (!fertileWindow) return false;
      return isWithinInterval(date, {
        start: fertileWindow.start,
        end: fertileWindow.end,
      });
    },
    periodStart: (date: Date) => {
      if (!lastPeriodDate) return false;
      return isSameDay(date, lastPeriodDate);
    },
  };

  const modifiersStyles = {
    fertile: {
      backgroundColor: 'rgba(139, 92, 246, 0.3)', // Using Vivid Purple with transparency
      borderRadius: '100%',
      color: '#4C1D95', // Darker purple for text contrast
    },
    periodStart: {
      backgroundColor: 'rgba(255, 0, 0, 0.2)',
      borderRadius: '100%',
    },
  };

  return (
    <div className="space-y-4">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={(newDate) => newDate && onDateSelect(newDate)}
        modifiers={modifiers}
        modifiersStyles={modifiersStyles}
        className="rounded-md border"
      />

      <div className="flex gap-4 text-sm justify-center">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-200"></div>
          <span>Period Start</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-purple-400"></div>
          <span>Fertile Window</span>
        </div>
      </div>

      {fertileWindow && (
        <div className="text-sm text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
          <p className="font-semibold text-purple-800">Your Fertile Window</p>
          <p className="text-purple-600">
            {format(fertileWindow.start, 'PPP')} to {format(fertileWindow.end, 'PPP')}
          </p>
        </div>
      )}
    </div>
  );
};