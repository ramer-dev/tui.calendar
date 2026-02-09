import { h } from 'preact';
import { useEffect, useState, useMemo, useRef } from 'preact/hooks';

import { PopupSection } from '@src/components/popup/popupSection';
import { cls } from '@src/helpers/css';
import type { FormStateDispatcher } from '@src/hooks/popup/useFormState';
import { FormStateActionType } from '@src/hooks/popup/useFormState';
import { useStringOnlyTemplate } from '@src/hooks/template/useStringOnlyTemplate';
import type {
  RecurrenceRule,
  RepeatFrequency,
  DayOfWeek,
  DayOfWeekWithPosition,
  DailyRepeatOptions,
  WeeklyRepeatOptions,
  MonthlyRepeatOptions,
  YearlyRepeatOptions,
} from '@src/types/repeat';
import { Template } from '../template';
import TZDate from '@src/time/date';
import { DailyRecurrenceOptions } from './recurrence/DailyRecurrenceOptions';
import { WeeklyRecurrenceOptions } from './recurrence/WeeklyRecurrenceOptions';
import { MonthlyRecurrenceOptions } from './recurrence/MonthlyRecurrenceOptions';
import { YearlyRecurrenceOptions } from './recurrence/YearlyRecurrenceOptions';
import { RecurrenceEndCondition } from './recurrence/RecurrenceEndCondition';
import { FREQUENCY_OPTIONS } from './recurrence/constants';

interface Props {
  recurrence?: RecurrenceRule;
  formStateDispatch: FormStateDispatcher;
  isRepeat?: boolean;
  startDate?: TZDate | Date | string;
}

const classNames = {
  content: cls('content'),
  repeat: cls('popup-section-item', 'popup-section-repeat'),
  repeatOptions: cls('recurrence-options'),
  frequencySelect: cls('recurrence-select-wrapper'),
  frequencySelectInput: cls('recurrence-select'),
};

export function RecurrenceInputBox({
  recurrence,
  formStateDispatch,
  isRepeat = false,
  startDate,
}: Props) {
  const locationPlaceholder = useStringOnlyTemplate({
    template: 'recurrencePlaceholder',
    defaultValue: 'Recurrence',
  });

  const [frequency, setFrequency] = useState<RepeatFrequency>(
    recurrence?.repeat?.frequency || 'daily'
  );
  const [interval, setInterval] = useState<number>(
    (recurrence?.repeat as DailyRepeatOptions | WeeklyRepeatOptions | MonthlyRepeatOptions | YearlyRepeatOptions)?.interval || 1
  );
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>(
    (recurrence?.repeat as WeeklyRepeatOptions)?.byDay || []
  );
  const [monthDay, setMonthDay] = useState<number | null>(
    (recurrence?.repeat as MonthlyRepeatOptions | YearlyRepeatOptions)?.byMonthDay?.[0] || null
  );
  // 월간/연간의 요일 위치 파싱
  const parseDayWithPosition = (byDay?: DayOfWeekWithPosition[]): { position: string; day: DayOfWeek | null } => {
    if (!byDay || byDay.length === 0) {
      return { position: '', day: null };
    }
    const dayStr = byDay[0];
    const match = dayStr.match(/^(-?\d+)?([A-Z]{2})$/);
    if (match) {
      return { position: match[1] || '', day: match[2] as DayOfWeek };
    }
    return { position: '', day: null };
  };

  const initialDayPosition = parseDayWithPosition(
    (recurrence?.repeat as MonthlyRepeatOptions | YearlyRepeatOptions)?.byDay
  );
  const [weekPosition, setWeekPosition] = useState<string>(initialDayPosition.position);
  const [weekDay, setWeekDay] = useState<DayOfWeek | null>(initialDayPosition.day);
  const [selectedMonths, setSelectedMonths] = useState<number[]>(
    (recurrence?.repeat as YearlyRepeatOptions)?.byMonth || []
  );
  const [endType, setEndType] = useState<'count' | 'until' | 'forever'>(
    recurrence?.count ? 'count' : recurrence?.until ? 'until' : 'forever'
  );
  const [count, setCount] = useState<number>(recurrence?.count || 10);
  // until 초기값 설정 함수
  const getUntilInitialValue = (untilValue: string | Date | 'forever' | undefined): string => {
    if (!untilValue || untilValue === 'forever') {
      return '';
    }
    
    try {
      let date: Date;
      if (untilValue instanceof Date) {
        date = untilValue;
      } else if (typeof untilValue === 'string') {
        // ISO 문자열이거나 yyyy-MM-dd 형식
        date = new Date(untilValue);
        if (isNaN(date.getTime())) {
          // yyyy-MM-dd 형식인 경우 시간 추가
          date = new Date(untilValue + 'T00:00:00');
        }
      } else {
        return '';
      }
      
      if (isNaN(date.getTime())) {
        console.warn('Invalid until date:', untilValue);
        return '';
      }
      
      // yyyy-MM-dd 형식으로 변환
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error('Error parsing until date:', error, untilValue);
      return '';
    }
  };

  const [until, setUntil] = useState<string>(
    getUntilInitialValue(recurrence?.until)
  );

  // recurrence가 변경되면 상태 업데이트
  // 무한 루프 방지를 위해 이전 recurrence와 비교
  const prevRecurrenceRef = useRef<typeof recurrence>();
  useEffect(() => {
    // recurrence가 실제로 변경되었는지 확인
    const recurrenceChanged = JSON.stringify(prevRecurrenceRef.current) !== JSON.stringify(recurrence);
    
    if (!recurrenceChanged && prevRecurrenceRef.current !== undefined) {
      // 변경되지 않았으면 업데이트하지 않음
      return;
    }
    
    prevRecurrenceRef.current = recurrence;
    
    if (recurrence) {
      const repeat = recurrence.repeat;
      setFrequency(repeat.frequency);
      if ('interval' in repeat) {
        setInterval(repeat.interval || 1);
      }
      if ('byDay' in repeat && repeat.byDay) {
        if (repeat.frequency === 'weekly') {
          setSelectedDays(repeat.byDay as DayOfWeek[]);
        } else {
          const parsed = parseDayWithPosition(repeat.byDay as DayOfWeekWithPosition[]);
          setWeekPosition(parsed.position);
          setWeekDay(parsed.day);
        }
      }
      if ('byMonthDay' in repeat && repeat.byMonthDay) {
        setMonthDay(repeat.byMonthDay[0]);
      }
      if ('byMonth' in repeat && repeat.byMonth) {
        setSelectedMonths(repeat.byMonth);
      }
      if (recurrence.count) {
        setEndType('count');
        setCount(recurrence.count);
      } else if (recurrence.until) {
        setEndType('until');
        if (recurrence.until !== 'forever') {
          setUntil(getUntilInitialValue(recurrence.until));
        } else {
          setUntil('');
        }
      } else {
        setEndType('forever');
      }
    } else {
      // recurrence가 없으면 기본값으로 초기화 (수정 모드에서 반복 규칙을 변경할 수 있도록)
      // 하지만 isRepeat이 true이면 초기화하지 않음 (새로 생성 중일 수 있음)
      if (!isRepeat) {
        setFrequency('daily');
        setInterval(1);
        setSelectedDays([]);
        setMonthDay(null);
        setWeekPosition('');
        setWeekDay(null);
        setSelectedMonths([]);
        setEndType('forever');
        setCount(10);
        setUntil('');
      }
    }
  }, [recurrence, isRepeat]);

  // frequency가 변경되면 관련 상태 초기화
  useEffect(() => {
    if (frequency === 'daily') {
      setSelectedDays([]);
      setMonthDay(null);
      setWeekPosition('');
      setWeekDay(null);
      setSelectedMonths([]);
    } else if (frequency === 'weekly') {
      setMonthDay(null);
      setWeekPosition('');
      setWeekDay(null);
      setSelectedMonths([]);
    } else if (frequency === 'monthly') {
      setSelectedDays([]);
      setSelectedMonths([]);
    } else if (frequency === 'yearly') {
      setSelectedDays([]);
    }
  }, [frequency]);

  // recurrence rule 생성
  const createRecurrenceRule = useMemo((): RecurrenceRule | undefined => {
    if (!isRepeat || !startDate) {
      return undefined;
    }

    let repeat: DailyRepeatOptions | WeeklyRepeatOptions | MonthlyRepeatOptions | YearlyRepeatOptions;

    switch (frequency) {
      case 'daily':
        repeat = {
          frequency: 'daily',
          interval: interval || 1,
        };
        break;
      case 'weekly':
        repeat = {
          frequency: 'weekly',
          interval: interval || 1,
          byDay: selectedDays.length > 0 ? selectedDays : undefined,
        };
        break;
      case 'monthly':
        if (weekPosition && weekDay) {
          repeat = {
            frequency: 'monthly',
            interval: interval || 1,
            byDay: [`${weekPosition}${weekDay}`],
          };
        } else if (monthDay !== null) {
          repeat = {
            frequency: 'monthly',
            interval: interval || 1,
            byMonthDay: [monthDay],
          };
        } else {
          repeat = {
            frequency: 'monthly',
            interval: interval || 1,
          };
        }
        break;
      case 'yearly':
        const yearlyRepeat: YearlyRepeatOptions = {
          frequency: 'yearly',
          interval: interval || 1,
        };
        if (selectedMonths.length > 0) {
          yearlyRepeat.byMonth = selectedMonths;
        }
        if (weekPosition && weekDay) {
          yearlyRepeat.byDay = [`${weekPosition}${weekDay}`];
        } else if (monthDay !== null) {
          yearlyRepeat.byMonthDay = [monthDay];
        }
        repeat = yearlyRepeat;
        break;
    }

    // startDate를 ISO 문자열로 변환 (전체 날짜/시간 정보 유지)
    let ruleStartDate: string | Date;
    if (!startDate) {
      ruleStartDate = new TZDate().toDate().toISOString();
    } else if (typeof startDate === 'string') {
      ruleStartDate = startDate;
    } else if (startDate instanceof TZDate) {
      ruleStartDate = startDate.toDate().toISOString();
    } else if (startDate instanceof Date) {
      ruleStartDate = startDate.toISOString();
    } else {
      ruleStartDate = new TZDate(startDate).toDate().toISOString();
    }

    const rule: RecurrenceRule = {
      repeat,
      startDate: ruleStartDate,
    };

    if (endType === 'count') {
      rule.count = count;
    } else if (endType === 'until') {
      if (until) {
        // until이 yyyy-MM-dd 형식의 문자열인 경우 Date로 변환
        // 시간대 문제를 피하기 위해 명시적으로 시간 추가
        let parsedDate: Date;
        if (until.includes('T') || until.includes(' ')) {
          // 이미 시간 정보가 포함된 경우
          parsedDate = new Date(until);
        } else {
          // yyyy-MM-dd 형식인 경우 로컬 시간으로 해석
          // 시간을 00:00:00으로 설정하여 날짜만 사용
          parsedDate = new Date(until + 'T00:00:00');
        }
        
        if (isNaN(parsedDate.getTime())) {
          console.error('Invalid until date:', until);
          rule.until = 'forever';
        } else {
          console.log('until 날짜 변환 성공:', until, '->', parsedDate);
          rule.until = parsedDate;
        }
      } else {
        rule.until = 'forever';
      }
    }

    return rule;
  }, [
    isRepeat,
    startDate,
    frequency,
    interval,
    selectedDays,
    monthDay,
    weekPosition,
    weekDay,
    selectedMonths,
    endType,
    count,
    until,
  ]);

  // recurrence rule 업데이트
  useEffect(() => {
    if (isRepeat) {
      formStateDispatch({
        type: FormStateActionType.setRecurrenceRule,
        recurrenceRule: createRecurrenceRule,
      });
    } else {
      formStateDispatch({
        type: FormStateActionType.setRecurrenceRule,
        recurrenceRule: undefined,
      });
    }
  }, [isRepeat, createRecurrenceRule, formStateDispatch]);

  const handleRecurrenceChange = () =>
    formStateDispatch({ type: FormStateActionType.setRepeat, isRepeat: !isRepeat });

  return (
    <>
      <PopupSection>
        <div className={classNames.repeat} onClick={handleRecurrenceChange}>
          <span
            className={cls('icon', {
              'ic-checkbox-normal': !isRepeat,
              'ic-checkbox-checked': isRepeat,
            })}
          />
          <span className={classNames.content}>
            <Template template="recurrencePlaceholder" />
          </span>
          <input
            name="isRepeat"
            type="checkbox"
            className={cls('hidden-input')}
            value={isRepeat ? 'true' : 'false'}
            checked={isRepeat}
          />
        </div>
      </PopupSection>

      {isRepeat && (
        <div className={classNames.repeatOptions}>
          {/* Frequency 선택 */}
          <div className={cls('recurrence-option-item')}>
            <label className={cls('recurrence-label')}>반복 빈도</label>
            <div className={classNames.frequencySelect}>
              <select
                className={classNames.frequencySelectInput}
                value={frequency}
                onChange={(e) => setFrequency(e.currentTarget.value as RepeatFrequency)}
              >
                {FREQUENCY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 빈도별 옵션 컴포넌트 */}
          {frequency === 'daily' && (
            <DailyRecurrenceOptions interval={interval} onIntervalChange={setInterval} />
          )}

          {frequency === 'weekly' && (
            <WeeklyRecurrenceOptions
              interval={interval}
              selectedDays={selectedDays}
              onIntervalChange={setInterval}
              onDaysChange={setSelectedDays}
            />
          )}

          {frequency === 'monthly' && (
            <MonthlyRecurrenceOptions
              interval={interval}
              monthDay={monthDay}
              weekPosition={weekPosition}
              weekDay={weekDay}
              onIntervalChange={setInterval}
              onMonthDayChange={setMonthDay}
              onWeekPositionChange={setWeekPosition}
              onWeekDayChange={setWeekDay}
            />
          )}

          {frequency === 'yearly' && (
            <YearlyRecurrenceOptions
              interval={interval}
              selectedMonths={selectedMonths}
              monthDay={monthDay}
              weekPosition={weekPosition}
              weekDay={weekDay}
              onIntervalChange={setInterval}
              onMonthsChange={setSelectedMonths}
              onMonthDayChange={setMonthDay}
              onWeekPositionChange={setWeekPosition}
              onWeekDayChange={setWeekDay}
            />
          )}

          {/* 종료 조건 */}
          <RecurrenceEndCondition
            endType={endType}
            count={count}
            until={until}
            onEndTypeChange={setEndType}
            onCountChange={setCount}
            onUntilChange={setUntil}
          />
        </div>
      )}
    </>
  );
}
