import { h } from 'preact';
import { cls } from '@src/helpers/css';
import type { DayOfWeek } from '@src/types/repeat';
import { DAY_OPTIONS, WEEK_POSITION_OPTIONS } from './constants';

interface Props {
  interval: number;
  monthDay: number | null;
  weekPosition: string;
  weekDay: DayOfWeek | null;
  onIntervalChange: (interval: number) => void;
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
};

export function MonthlyRecurrenceOptions({
  interval,
  monthDay,
  weekPosition,
  weekDay,
  onIntervalChange,
  onMonthDayChange,
  onWeekPositionChange,
  onWeekDayChange,
}: Props) {
  const repeatType = weekPosition && weekDay ? 'day' : 'date';

  return (
    <>
      <div className={classNames.optionItem}>
        <label className={classNames.label}>반복 간격 (개월)</label>
        <div className={classNames.inputWrapper}>
          <input
            type="number"
            className={classNames.input}
            min="1"
            value={interval}
            onChange={(e) => onIntervalChange(parseInt(e.currentTarget.value) || 1)}
          />
          <span className={cls('recurrence-unit')}>개월마다</span>
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
              } else {
                onMonthDayChange(null);
              }
            }}
          >
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
      ) : (
        <div className={classNames.optionItem}>
          <label className={classNames.label}>날짜</label>
          <div className={classNames.inputWrapper}>
            <input
              type="number"
              className={classNames.input}
              min="-31"
              max="31"
              value={monthDay || ''}
              onChange={(e) => onMonthDayChange(parseInt(e.currentTarget.value) || null)}
              placeholder="예: 15 (15일), -1 (마지막 날)"
            />
            <span className={cls('recurrence-unit')}>일</span>
          </div>
        </div>
      )}
    </>
  );
}
