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
      backgroundColor: 'rgba(124, 58, 237, 0.4)', // More visible purple
      borderRadius: '100%',
      color: '#4C1D95', // Dark purple for text
      fontWeight: 'bold',
    },
    periodStart: {
      backgroundColor: 'rgba(239, 68, 68, 0.4)', // More visible red
      borderRadius: '100%',
      color: '#991B1B', // Dark red for text
      fontWeight: 'bold',
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
          <div className="w-3 h-3 rounded-full bg-red-400"></div>
          <span>Period Start</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-violet-500"></div>
          <span>Fertile Window</span>
        </div>
      </div>

      {fertileWindow && (
        <div className="text-sm text-center p-4 bg-violet-50 rounded-lg border border-violet-200 animate-fadeIn">
          <p className="font-semibold text-violet-900 mb-1">Your Fertile Window</p>
          <p className="text-violet-700">
            {format(fertileWindow.start, 'MMMM d')} to {format(fertileWindow.end, 'MMMM d, yyyy')}
          </p>
          <p className="text-violet-600 text-xs mt-2">
            These are your most fertile days. Consider tracking additional symptoms during this time.
          </p>
        </div>
      )}
    </div>
  );
};