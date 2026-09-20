import { h } from 'preact';

import { PopupSection } from '@src/components/popup/popupSection';
import { cls } from '@src/helpers/css';

/**
 * Momento 확장 — 일정별 알림("몇 분 전에 알릴지")을 켜고 끄는 UI.
 * EventModel/EventObject의 정식 필드가 아니라 raw JSON을 통해서만 앱과 왕복하므로
 * (eventFormPopup.tsx의 onSubmit에서 eventData.raw.reminder로 병합됨), 이 컴포넌트는
 * 완전히 컨트롤드 컴포넌트로 두고 값/변경 콜백만 부모(EventFormPopup)로부터 받는다.
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
  row: cls('popup-section-item', 'popup-section-reminder'),
  options: cls('recurrence-options'),
  optionItem: cls('recurrence-option-item'),
  label: cls('recurrence-label'),
  inputWrapper: cls('recurrence-input-wrapper'),
  input: cls('recurrence-input'),
  selectWrapper: cls('recurrence-select-wrapper'),
  select: cls('recurrence-select'),
};

export function ReminderInputBox({ value, onChange }: Props) {
  const { reminderEnabled, reminderValue, reminderUnit } = value;

  const handleToggle = () => {
    onChange({ ...value, reminderEnabled: !reminderEnabled });
  };

  return (
    <>
      <PopupSection>
        <div className={classNames.row} onClick={handleToggle}>
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
            <label className={classNames.label}>몇 분 전에 알릴지</label>
            <div className={classNames.inputWrapper}>
              <input
                type="number"
                className={classNames.input}
                min="0"
                step="1"
                value={reminderValue}
                onInput={(e) => {
                  const raw = (e.target as HTMLInputElement).value;
                  const next = Math.max(0, Math.floor(Number(raw) || 0));
                  onChange({ ...value, reminderValue: next });
                }}
              />
              <div className={classNames.selectWrapper}>
                <select
                  className={classNames.select}
                  value={reminderUnit}
                  onChange={(e) => {
                    onChange({
                      ...value,
                      reminderUnit: (e.target as HTMLSelectElement).value as ReminderUnit,
                    });
                  }}
                >
                  {REMINDER_UNIT_OPTIONS.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit} 전
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
