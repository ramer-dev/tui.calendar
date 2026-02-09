import { h } from 'preact';
import { cls } from '@src/helpers/css';
import type { DayOfWeek } from '@src/types/repeat';
import { DAY_OPTIONS, MONTH_OPTIONS, WEEK_POSITION_OPTIONS } from './constants';

interface Props {
  interval: number;
  selectedMonths: number[];
  monthDay: number | null;
  weekPosition: string;
  weekDay: DayOfWeek | null;
  onIntervalChange: (interval: number) => void;
  onMonthsChange: (months: number[]) => void;
  onMonthDayChange: (day: number | null) => void;
  onWeekPositionChange: (position: string) => void;
  onWeekDayChange: (day: DayOfWeek | null) => void;
}

const classNames = {
  optionItem: cls('recurrence-option-item'),
  label: cls('recurrence-label'),
  select: cls('recurrence-select'),
  input: cls('recurrence-input'),
  inputWrapper: cls('recurrence-input-wrapper'),
  selectWrapper: cls('recurrence-select-wrapper'),
  checkboxGroup: cls('recurrence-checkbox-group'),
  checkboxItem: cls('recurrence-checkbox-item'),
  checkboxInput: cls('recurrence-checkbox-input'),
  checkboxLabel: cls('recurrence-checkbox-label'),
};

export function YearlyRecurrenceOptions({
  interval,
  selectedMonths,
  monthDay,
  weekPosition,
  weekDay,
  onIntervalChange,
  onMonthsChange,
  onMonthDayChange,
  onWeekPositionChange,
  onWeekDayChange,
}: Props) {
  const toggleMonth = (month: number) => {
    onMonthsChange(
      selectedMonths.includes(month)
        ? selectedMonths.filter((m) => m !== month)
        : [...selectedMonths, month]
    );
  };

  const repeatType = weekPosition && weekDay ? 'day' : monthDay !== null ? 'date' : 'none';

  return (
    <>
      <div className={classNames.optionItem}>
        <label className={classNames.label}>반복 간격 (년)</label>
        <div className={classNames.inputWrapper}>
          <input
            type="number"
            className={classNames.input}
            min="1"
            value={interval}
            onChange={(e) => onIntervalChange(parseInt(e.currentTarget.value) || 1)}
          />
          <span className={cls('recurrence-unit')}>년마다</span>
        </div>
      </div>

      <div className={classNames.optionItem}>
        <label className={classNames.label}>반복 월</label>
        <div className={classNames.checkboxGroup}>
          {MONTH_OPTIONS.map((month) => (
            <label key={month.value} className={classNames.checkboxItem}>
              <input
                type="checkbox"
                className={classNames.checkboxInput}
                checked={selectedMonths.includes(month.value)}
                onChange={() => toggleMonth(month.value)}
              />
              <span className={classNames.checkboxLabel}>{month.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className={classNames.optionItem}>
        <label className={classNames.label}>반복 방식</label>
        <div className={classNames.selectWrapper}>
          <select
            className={classNames.select}
            value={repeatType}
            onChange={(e) => {
              if (e.currentTarget.value === 'date') {
                onWeekPositionChange('');
                onWeekDayChange(null);
              } else if (e.currentTarget.value === 'day') {
                onMonthDayChange(null);
              } else {
                onWeekPositionChange('');
                onWeekDayChange(null);
                onMonthDayChange(null);
              }
            }}
          >
            <option value="none">없음</option>
            <option value="date">날짜로</option>
            <option value="day">요일로</option>
          </select>
        </div>
      </div>

      {repeatType === 'day' ? (
        <>
          <div className={classNames.optionItem}>
            <label className={classNames.label}>주</label>
            <div className={classNames.selectWrapper}>
              <select
                className={classNames.select}
                value={weekPosition}
                onChange={(e) => onWeekPositionChange(e.currentTarget.value)}
              >
                {WEEK_POSITION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className={classNames.optionItem}>
            <label className={classNames.label}>요일</label>
            <div className={classNames.selectWrapper}>
              <select
                className={classNames.select}
                value={weekDay || ''}
                onChange={(e) => onWeekDayChange(e.currentTarget.value as DayOfWeek)}
              >
                {DAY_OPTIONS.map((day) => (
                  <option key={day.value} value={day.value}>
                    {day.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </>
      ) : repeatType === 'date' ? (
        <div className={classNames.optionItem}>
          <label className={classNames.label}>날짜</label>
          <div className={classNames.inputWrapper}>
            <input
              type="number"
              className={classNames.input}
              min="1"
              max="31"
              value={monthDay || ''}
              onChange={(e) => onMonthDayChange(parseInt(e.currentTarget.value) || null)}
            />
            <span className={cls('recurrence-unit')}>일</span>
          </div>
        </div>
      ) : null}
    </>
  );
}
