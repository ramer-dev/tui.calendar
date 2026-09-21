import { h } from 'preact';

import { PopupSection } from '@src/components/popup/popupSection';
import { cls } from '@src/helpers/css';

/**
 * Momento 확장 — 일정별 알림("몇 분 전에 알릴지") 입력 UI.
 * recurrenceInput.tsx와 같은 구조(체크박스 행 + 펼쳐지는 옵션 영역)이며, 같은 CSS 클래스를 쓴다.
 * EventModel의 정식 필드가 아니라 raw JSON(event.raw.reminder)으로만 앱과 왕복하므로
 * formState reducer를 거치지 않는 컨트롤드 컴포넌트로 두고, 값/변경 콜백은 EventFormPopup이 관리한다.
 */
export type ReminderUnit = '초' | '분' | '시간' | '일';

export interface ReminderValue {
  reminderEnabled: boolean;
  reminderValue: number;
  reminderUnit: ReminderUnit;
}

interface Props {
  value: ReminderValue;
  onChange: (value: ReminderValue) => void;
}

const REMINDER_UNIT_OPTIONS: ReminderUnit[] = ['분', '시간', '일', '초'];

const classNames = {
  content: cls('content'),
  reminder: cls('popup-section-item', 'popup-section-reminder', 'popup-section-toggle'),
  options: cls('recurrence-options'),
  optionItem: cls('recurrence-option-item'),
  label: cls('recurrence-label'),
  input: cls('recurrence-input'),
  inputWrapper: cls('recurrence-input-wrapper'),
  unit: cls('recurrence-unit'),
  selectWrapper: cls('recurrence-select-wrapper'),
  select: cls('recurrence-select'),
};

export function ReminderInputBox({ value, onChange }: Props) {
  const { reminderEnabled, reminderValue, reminderUnit } = value;

  return (
    <>
      <PopupSection>
        <div
          className={classNames.reminder}
          onClick={() => onChange({ ...value, reminderEnabled: !reminderEnabled })}
        >
          <span
            className={cls('icon', {
              'ic-checkbox-normal': !reminderEnabled,
              'ic-checkbox-checked': reminderEnabled,
            })}
          />
          <span className={classNames.content}>알림</span>
          <input
            name="reminderEnabled"
            type="checkbox"
            className={cls('hidden-input')}
            value={reminderEnabled ? 'true' : 'false'}
            checked={reminderEnabled}
          />
        </div>
      </PopupSection>

      {reminderEnabled && (
        <div className={classNames.options}>
          <div className={classNames.optionItem}>
            <label className={classNames.label}>알림 시점</label>
            <div className={classNames.inputWrapper}>
              <input
                type="number"
                className={classNames.input}
                min="0"
                value={reminderValue}
                onChange={(e) =>
                  onChange({
                    ...value,
                    reminderValue: Math.max(0, parseInt(e.currentTarget.value) || 0),
                  })
                }
              />
              <span className={classNames.unit}>{reminderUnit} 전에 알림</span>
            </div>
          </div>
          <div className={classNames.optionItem}>
            <label className={classNames.label}>단위</label>
            <div className={classNames.selectWrapper}>
              <select
                className={classNames.select}
                value={reminderUnit}
                onChange={(e) =>
                  onChange({ ...value, reminderUnit: e.currentTarget.value as ReminderUnit })
                }
              >
                {REMINDER_UNIT_OPTIONS.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
