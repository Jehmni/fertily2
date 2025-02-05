import { addDays, subDays } from "date-fns";

export const calculateFertileWindow = (startDate: Date, length: number) => {
  if (!startDate || length < 21 || length > 35) {
    return null;
  }
  const ovulationDay = addDays(startDate, length - 14);
  const fertileStart = subDays(ovulationDay, 5);
  const fertileEnd = ovulationDay;
  return { start: fertileStart, end: fertileEnd };
};