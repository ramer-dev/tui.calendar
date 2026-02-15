import { h } from 'preact';
import { cls } from '@src/helpers/css';
import type { DayOfWeek } from '@src/types/repeat';
import { DAY_OPTIONS } from './constants';

interface Props {
  interval: number;
  selectedDays: DayOfWeek[];
  onIntervalChange: (interval: number) => void;
  onDaysChange: (days: DayOfWeek[]) => void;
}

const classNames = {
  optionItem: cls('recurrence-option-item'),
  label: cls('recurrence-label'),
  input: cls('recurrence-input'),
  inputWrapper: cls('recurrence-input-wrapper'),
  checkboxGroup: cls('recurrence-checkbox-group'),
  checkboxItem: cls('recurrence-checkbox-item'),
  checkboxInput: cls('recurrence-checkbox-input'),
  checkboxLabel: cls('recurrence-checkbox-label'),
};

export function WeeklyRecurrenceOptions({
  interval,
  selectedDays,
  onIntervalChange,
  onDaysChange,
}: Props) {
  const toggleDay = (day: DayOfWeek) => {
    onDaysChange(
      selectedDays.includes(day) ? selectedDays.filter((d) => d !== day) : [...selectedDays, day]
    );
  };

  return (
    <>
      <div className={classNames.optionItem}>
        <label className={classNames.label}>반복 간격 (주)</label>
        <div className={classNames.inputWrapper}>
          <input
            type="number"
            className={classNames.input}
            min="1"
            value={interval}
            onChange={(e) => onIntervalChange(parseInt(e.currentTarget.value) || 1)}
          />
          <span className={cls('recurrence-unit')}>주마다</span>
        </div>
      </div>

      <div className={classNames.optionItem}>
        <label className={classNames.label}>반복 요일</label>
        <div className={classNames.checkboxGroup}>
          {DAY_OPTIONS.map((day) => (
            <label key={day.value} className={classNames.checkboxItem}>
              <input
                type="checkbox"
                className={classNames.checkboxInput}
                checked={selectedDays.includes(day.value)}
                onChange={() => toggleDay(day.value)}
              />
              <span className={classNames.checkboxLabel}>{day.label}</span>
            </label>
          ))}
        </div>
      </div>
    </>
  );
}
