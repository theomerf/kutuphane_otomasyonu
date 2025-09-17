export const formatDateForInput = (date: Date): string => {
  return date.toLocaleDateString('en-CA');
};

export const getTodayFormatted = (): string => {
  return formatDateForInput(new Date());
};

export const getTomorrowFormatted = (): string => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return formatDateForInput(tomorrow);
};