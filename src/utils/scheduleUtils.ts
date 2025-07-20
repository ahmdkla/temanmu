import dayjs from 'dayjs';

export interface ScheduleOption {
  label: string;
  value: string;
  description: string;
}

export const getScheduleOptions = (): ScheduleOption[] => {
  const now = dayjs();
  
  // Today (date only, local time)
  const today = now
  const todayString = today.format('YYYY-MM-DD')
  
  // Tomorrow (date only, local time)
  const tomorrow = now.add(1, 'day')
  const tomorrowString = tomorrow.format('YYYY-MM-DD')
  
  // Next Week (date only, local time)
  const nextWeek = now.add(1, 'week')
  const nextWeekString = nextWeek.format('YYYY-MM-DD')

  // Next month, same date (date only, local time)
  const nextMonth = now.add(1, 'month')
  const nextMonthString = nextMonth.format('YYYY-MM-DD')


  return [
    {
      label: 'Today',
      value: todayString,
      description: today.format('MMM D')
    },
    {
      label: 'Tomorrow',
      value: tomorrowString,
      description: tomorrow.format('MMM D')
    },
    {
      label: 'Next Week',
      value: nextWeekString,
      description: nextWeek.format('MMM D')
    },
    {
      label: 'Next Month',
      value: nextMonthString,
      description: nextMonth.format('MMM D')
    }
  ];
};

export const getMinDate = (): string => {
  return dayjs().format('YYYY-MM-DD') // contoh: '2025-07-20'
}

export const getMinDateTime = (): string => {
  return dayjs().format('YYYY-MM-DDTHH:mm') // contoh: '2025-07-20T21:45'
}