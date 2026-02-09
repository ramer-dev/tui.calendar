import { h } from 'preact';
import { cls } from '@src/helpers/css';

interface Props {
  interval: number;
  onIntervalChange: (interval: number) => void;
}

const classNames = {
  optionItem: cls('recurrence-option-item'),
  label: cls('recurrence-label'),
  input: cls('recurrence-input'),
  inputWrapper: cls('recurrence-input-wrapper'),
};

export function DailyRecurrenceOptions({ interval, onIntervalChange }: Props) {
  return (
    <div className={classNames.optionItem}>
      <label className={classNames.label}>반복 간격 (일)</label>
      <div className={classNames.inputWrapper}>
        <input
          type="number"
          className={classNames.input}
          min="1"
          value={interval}
          onChange={(e) => onIntervalChange(parseInt(e.currentTarget.value) || 1)}
        />
        <span className={cls('recurrence-unit')}>일마다</span>
      </div>
    </div>
  );
}
