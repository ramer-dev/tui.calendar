import type { RepeatFrequency, DayOfWeek } from '@src/types/repeat';

export const FREQUENCY_OPTIONS: { value: RepeatFrequency; label: string }[] = [
  { value: 'daily', label: '일일' },
  { value: 'weekly', label: '주간' },
  { value: 'monthly', label: '월간' },
  { value: 'yearly', label: '연간' },
];

export const DAY_OPTIONS: { value: DayOfWeek; label: string }[] = [
  { value: 'MO', label: '월요일' },
  { value: 'TU', label: '화요일' },
  { value: 'WE', label: '수요일' },
  { value: 'TH', label: '목요일' },
  { value: 'FR', label: '금요일' },
  { value: 'SA', label: '토요일' },
  { value: 'SU', label: '일요일' },
];

export const MONTH_OPTIONS = [
  { value: 1, label: '1월' },
  { value: 2, label: '2월' },
  { value: 3, label: '3월' },
  { value: 4, label: '4월' },
  { value: 5, label: '5월' },
  { value: 6, label: '6월' },
  { value: 7, label: '7월' },
  { value: 8, label: '8월' },
  { value: 9, label: '9월' },
  { value: 10, label: '10월' },
  { value: 11, label: '11월' },
  { value: 12, label: '12월' },
];

export const WEEK_POSITION_OPTIONS = [
  { value: '1', label: '첫째 주' },
  { value: '2', label: '둘째 주' },
  { value: '3', label: '셋째 주' },
  { value: '4', label: '넷째 주' },
  { value: '-1', label: '마지막 주' },
];
