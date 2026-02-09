import { h } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import type { DateRangePicker } from 'tui-date-picker';
import DatePicker from 'tui-date-picker';
import { cls } from '@src/helpers/css';
import { useStore } from '@src/contexts/calendarStore';
import { optionsSelector } from '@src/selectors';
import TZDate from '@src/time/date';

interface Props {
  endType: 'count' | 'until' | 'forever';
  count: number;
  until: string;
  onEndTypeChange: (type: 'count' | 'until' | 'forever') => void;
  onCountChange: (count: number) => void;
  onUntilChange: (until: string) => void;
}

const classNames = {
  optionItem: cls('recurrence-option-item'),
  label: cls('recurrence-label'),
  select: cls('recurrence-select'),
  input: cls('recurrence-input'),
  inputWrapper: cls('recurrence-input-wrapper'),
  selectWrapper: cls('recurrence-select-wrapper'),
  datePickerContainer: cls('datepicker-container'),
  datePickerWrapper: cls('recurrence-date-picker-wrapper'),
};

export function RecurrenceEndCondition({
  endType,
  count,
  until,
  onEndTypeChange,
  onCountChange,
  onUntilChange,
}: Props) {
  const { usageStatistics } = useStore(optionsSelector);
  const datePickerContainerRef = useRef<HTMLDivElement>(null);
  const datePickerInputRef = useRef<HTMLInputElement>(null);
  const endPickerContainerRef = useRef<HTMLDivElement>(null);
  const endPickerInputRef = useRef<HTMLInputElement>(null);
  const datePickerInstanceRef = useRef<DateRangePicker | null>(null);

  useEffect(() => {
    if (
      endType === 'until' &&
      datePickerContainerRef.current &&
      datePickerInputRef.current &&
      endPickerContainerRef.current &&
      endPickerInputRef.current
    ) {
      // 기존 DatePicker 인스턴스가 있으면 제거
      if (datePickerInstanceRef.current) {
        datePickerInstanceRef.current.destroy();
        datePickerInstanceRef.current = null;
      }

      // until 값이 있으면 파싱, 없으면 오늘 날짜 사용
      let initialDate: Date;
      if (until) {
        const parsed = new Date(until);
        initialDate = isNaN(parsed.getTime()) ? new Date() : parsed;
      } else {
        initialDate = new Date();
      }

      // DateRangePicker 생성 (단일 날짜 선택을 위해 startpicker와 endpicker를 같은 값으로 설정)
      datePickerInstanceRef.current = DatePicker.createRangePicker({
        startpicker: {
          date: initialDate,
          input: datePickerInputRef.current,
          container: datePickerContainerRef.current,
        },
        endpicker: {
          date: initialDate,
          input: endPickerInputRef.current,
          container: endPickerContainerRef.current,
        },
        format: 'yyyy-MM-dd',
        usageStatistics,
      });

      // 날짜 변경 이벤트 리스너 (startpicker의 날짜만 사용)
      datePickerInstanceRef.current.on('change:start', () => {
        const startDate = datePickerInstanceRef.current?.getStartDate();
        if (startDate) {
          try {
            // getStartDate()는 TZDate를 반환하므로 toDate()로 Date로 변환
            const date = startDate instanceof TZDate ? startDate.toDate() : startDate;
            
            // Date 객체인지 확인
            if (date instanceof Date && !isNaN(date.getTime())) {
              // yyyy-MM-dd 형식으로 변환
              const year = date.getFullYear();
              const month = String(date.getMonth() + 1).padStart(2, '0');
              const day = String(date.getDate()).padStart(2, '0');
              const dateString = `${year}-${month}-${day}`;
              console.log('날짜 선택됨:', dateString, '원본:', date);
              onUntilChange(dateString);
            } else {
              console.error('Invalid date from date picker:', startDate, date);
            }
          } catch (error) {
            console.error('날짜 변환 오류:', error, 'startDate:', startDate);
          }
        }
      });

      return () => {
        if (datePickerInstanceRef.current) {
          datePickerInstanceRef.current.destroy();
          datePickerInstanceRef.current = null;
        }
      };
    }
  }, [endType, until, onUntilChange, usageStatistics]);

  // endType이 'until'이 아닐 때 DatePicker 정리
  useEffect(() => {
    if (endType !== 'until' && datePickerInstanceRef.current) {
      datePickerInstanceRef.current.destroy();
      datePickerInstanceRef.current = null;
    }
  }, [endType]);

  return (
    <>
      <div className={classNames.optionItem}>
        <label className={classNames.label}>종료 조건</label>
        <div className={classNames.selectWrapper}>
          <select
            className={classNames.select}
            value={endType}
            onChange={(e) => onEndTypeChange(e.currentTarget.value as 'count' | 'until' | 'forever')}
          >
            <option value="forever">무한 반복</option>
            <option value="count">횟수로</option>
            <option value="until">날짜로</option>
          </select>
        </div>
      </div>

      {endType === 'count' && (
        <div className={classNames.optionItem}>
          <label className={classNames.label}>반복 횟수</label>
          <div className={classNames.inputWrapper}>
            <input
              type="number"
              className={classNames.input}
              min="1"
              value={count}
              onChange={(e) => onCountChange(parseInt(e.currentTarget.value) || 1)}
            />
            <span className={cls('recurrence-unit')}>회</span>
          </div>
        </div>
      )}

      {endType === 'until' && (
        <div className={classNames.optionItem}>
          <label className={classNames.label}>종료 날짜</label>
          <div className={classNames.datePickerWrapper}>
            <input
              ref={datePickerInputRef}
              type="text"
              className={classNames.input}
              placeholder="yyyy-MM-dd"
              value={until}
              readOnly
            />
            <div className={classNames.datePickerContainer} ref={datePickerContainerRef} />
            {/* endpicker는 숨김 처리 */}
            <input
              ref={endPickerInputRef}
              type="text"
              style={{ display: 'none' }}
            />
            <div ref={endPickerContainerRef} style={{ display: 'none' }} />
          </div>
        </div>
      )}
    </>
  );
}
