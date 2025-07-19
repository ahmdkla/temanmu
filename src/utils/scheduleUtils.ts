export interface ScheduleOption {
  label: string;
  value: string;
  description: string;
}

export const getScheduleOptions = (): ScheduleOption[] => {
  const now = new Date();
  
  // Today at 5 PM
  const today = new Date(now);
  today.setHours(17, 0, 0, 0);
  
  // Tomorrow at 9 AM
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);
  
  // Next Monday at 9 AM
  const nextMonday = new Date(now);
  const daysUntilMonday = (1 + 7 - nextMonday.getDay()) % 7 || 7;
  nextMonday.setDate(nextMonday.getDate() + daysUntilMonday);
  nextMonday.setHours(9, 0, 0, 0);
  
  // Next month, same date at 9 AM
  const nextMonth = new Date(now);
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  nextMonth.setHours(9, 0, 0, 0);
  
  const formatDateTime = (date: Date) => {
    return date.toISOString().slice(0, 16);
  };

  return [
    {
      label: 'Today',
      value: formatDateTime(today),
      description: 'Today at 5:00 PM'
    },
    {
      label: 'Tomorrow',
      value: formatDateTime(tomorrow),
      description: 'Tomorrow at 9:00 AM'
    },
    {
      label: 'Next Week',
      value: formatDateTime(nextMonday),
      description: 'Next Monday at 9:00 AM'
    },
    {
      label: 'Next Month',
      value: formatDateTime(nextMonth),
      description: `${nextMonth.toLocaleDateString([], { month: 'short', day: 'numeric' })} at 9:00 AM`
    }
  ];
};

export const getMinDateTime = (): string => {
  const now = new Date();
  return now.toISOString().slice(0, 16);
};