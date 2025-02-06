export const calculateFertileWindow = (startDate: Date, cycleLength: number) => {
  if (!startDate || cycleLength < 21 || cycleLength > 35) {
    return null;
  }
  
  const ovulationDay = new Date(startDate);
  ovulationDay.setDate(ovulationDay.getDate() + cycleLength - 14);
  
  const fertileStart = new Date(ovulationDay);
  fertileStart.setDate(fertileStart.getDate() - 5);
  
  return { start: fertileStart, end: ovulationDay };
};