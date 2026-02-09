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
  
  // endType 변경 핸들러 - 무한 루프 방지를 위한 로깅
  const handleEndTypeChange = (type: 'count' | 'until' | 'forever') => {
    console.log('[recurrenceInput] handleEndTypeChange 호출:', type, '현재 endType:', endType);
    if (type !== endType) {
      console.log('[recurrenceInput] endType 변경:', endType, '->', type);
      setEndType(type);
    } else {
      console.log('[recurrenceInput] endType이 동일하므로 변경하지 않음');
    }
  };
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
    console.log('[recurrenceInput] recurrence prop useEffect 실행');
    console.log('[recurrenceInput] recurrence:', recurrence);
    console.log('[recurrenceInput] isRepeat:', isRepeat);
    console.log('[recurrenceInput] prevRecurrenceRef.current:', prevRecurrenceRef.current);
    
    // recurrence가 실제로 변경되었는지 확인
    // Date 객체를 포함한 경우를 위해 정규화된 비교 수행
    // recurrenceId는 비교에서 제외 (편집 시 변경될 수 있음)
    const normalizeForComparison = (rec?: RecurrenceRule) => {
      if (!rec) return undefined;
      const normalized: any = {
        ...rec,
        // recurrenceId는 비교에서 제외
        recurrenceId: undefined,
      };
      
      // startDate 정규화
      if (normalized.startDate) {
        if (normalized.startDate instanceof Date) {
          normalized.startDate = normalized.startDate.toISOString();
        } else if (typeof normalized.startDate === 'string') {
          // ISO 문자열이거나 yyyy-MM-dd 형식인 경우 정규화
          const date = new Date(normalized.startDate);
          if (!isNaN(date.getTime())) {
            normalized.startDate = date.toISOString().split('T')[0] + 'T00:00:00.000Z';
          }
        }
      }
      
      // until 정규화
      if (normalized.until && normalized.until !== 'forever') {
        if (normalized.until instanceof Date) {
          normalized.until = normalized.until.toISOString();
        } else if (typeof normalized.until === 'string') {
          const date = new Date(normalized.until);
          if (!isNaN(date.getTime())) {
            normalized.until = date.toISOString().split('T')[0] + 'T00:00:00.000Z';
          }
        }
      }
      
      return normalized;
    };
    
    const prevNormalized = normalizeForComparison(prevRecurrenceRef.current);
    const currentNormalized = normalizeForComparison(recurrence);
    const prevStr = JSON.stringify(prevNormalized);
    const currentStr = JSON.stringify(currentNormalized);
    const recurrenceChanged = prevStr !== currentStr;
    
    console.log('[recurrenceInput] recurrenceChanged:', recurrenceChanged);
    console.log('[recurrenceInput] prevNormalized:', prevNormalized);
    console.log('[recurrenceInput] currentNormalized:', currentNormalized);
    
    // prevRecurrenceRef가 undefined이면 처음 전달되는 것이므로 항상 업데이트
    // 또는 recurrence가 실제로 변경된 경우에만 업데이트
    if (prevRecurrenceRef.current === undefined || recurrenceChanged) {
      console.log('[recurrenceInput] recurrence prop에서 로컬 state 업데이트 시작');
      prevRecurrenceRef.current = recurrence;
      
      if (recurrence) {
        const repeat = recurrence.repeat;
        console.log('[recurrenceInput] repeat 설정:', repeat);
        
        // frequency 설정
        setFrequency(repeat.frequency);
        
        // interval 설정
        if ('interval' in repeat) {
          setInterval(repeat.interval || 1);
        }
        
        // byDay 설정 (weekly 또는 monthly/yearly의 요일 위치)
        if ('byDay' in repeat && repeat.byDay && repeat.byDay.length > 0) {
          if (repeat.frequency === 'weekly') {
            setSelectedDays(repeat.byDay as DayOfWeek[]);
            console.log('[recurrenceInput] selectedDays 설정:', repeat.byDay);
          } else {
            const parsed = parseDayWithPosition(repeat.byDay as DayOfWeekWithPosition[]);
            setWeekPosition(parsed.position);
            setWeekDay(parsed.day);
            console.log('[recurrenceInput] weekPosition, weekDay 설정:', parsed);
          }
        } else {
          // byDay가 없으면 초기화
          if (repeat.frequency === 'weekly') {
            setSelectedDays([]);
          } else {
            setWeekPosition('');
            setWeekDay(null);
          }
        }
        
        // byMonthDay 설정
        if ('byMonthDay' in repeat && repeat.byMonthDay && repeat.byMonthDay.length > 0) {
          setMonthDay(repeat.byMonthDay[0]);
          console.log('[recurrenceInput] monthDay 설정:', repeat.byMonthDay[0]);
        } else {
          setMonthDay(null);
        }
        
        // byMonth 설정 (yearly)
        if ('byMonth' in repeat && repeat.byMonth && repeat.byMonth.length > 0) {
          setSelectedMonths(repeat.byMonth);
          console.log('[recurrenceInput] selectedMonths 설정:', repeat.byMonth);
        } else {
          setSelectedMonths([]);
        }
        
        // 종료 조건 설정
        if (recurrence.count !== undefined && recurrence.count !== null) {
          setEndType('count');
          setCount(recurrence.count);
          console.log('[recurrenceInput] endType: count, count:', recurrence.count);
        } else if (recurrence.until && recurrence.until !== 'forever') {
          setEndType('until');
          setUntil(getUntilInitialValue(recurrence.until));
          console.log('[recurrenceInput] endType: until, until:', getUntilInitialValue(recurrence.until));
        } else {
          setEndType('forever');
          console.log('[recurrenceInput] endType: forever');
        }
      } else {
        // recurrence가 없으면 기본값으로 초기화 (수정 모드에서 반복 규칙을 변경할 수 있도록)
        // 하지만 isRepeat이 true이면 초기화하지 않음 (새로 생성 중일 수 있음)
        if (!isRepeat) {
          console.log('[recurrenceInput] recurrence가 없고 isRepeat이 false이므로 기본값으로 초기화');
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
    } else {
      console.log('[recurrenceInput] recurrence prop이 변경되지 않았으므로 스킵');
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
  // 무한 루프 방지를 위해 이전 recurrenceRule과 비교
  const prevRecurrenceRuleRef = useRef<RecurrenceRule | undefined>();
  const isUpdatingRef = useRef<boolean>(false);
  
  useEffect(() => {
    console.log('[recurrenceInput] createRecurrenceRule useEffect 실행');
    console.log('[recurrenceInput] isRepeat:', isRepeat);
    console.log('[recurrenceInput] createRecurrenceRule:', createRecurrenceRule);
    console.log('[recurrenceInput] prevRecurrenceRuleRef.current:', prevRecurrenceRuleRef.current);
    console.log('[recurrenceInput] isUpdatingRef.current:', isUpdatingRef.current);
    
    // 이미 업데이트 중이면 스킵 (무한 루프 방지)
    if (isUpdatingRef.current) {
      console.log('[recurrenceInput] 이미 업데이트 중이므로 스킵');
      return;
    }
    
    // createRecurrenceRule이 실제로 변경되었는지 확인
    const normalizeForComparison = (rule?: RecurrenceRule) => {
      if (!rule) return undefined;
      return {
        ...rule,
        startDate: typeof rule.startDate === 'string' ? rule.startDate : 
                   rule.startDate instanceof Date ? rule.startDate.toISOString() : 
                   rule.startDate,
        until: rule.until && rule.until !== 'forever' && rule.until instanceof Date ? 
               rule.until.toISOString() : rule.until,
      };
    };
    
    const prevNormalized = normalizeForComparison(prevRecurrenceRuleRef.current);
    const currentNormalized = normalizeForComparison(createRecurrenceRule);
    const recurrenceRuleChanged = JSON.stringify(prevNormalized) !== JSON.stringify(currentNormalized);
    
    console.log('[recurrenceInput] recurrenceRuleChanged:', recurrenceRuleChanged);
    
    if (!recurrenceRuleChanged && prevRecurrenceRuleRef.current !== undefined) {
      // 변경되지 않았으면 업데이트하지 않음
      console.log('[recurrenceInput] recurrenceRule이 변경되지 않았으므로 스킵');
      return;
    }
    
    console.log('[recurrenceInput] recurrenceRule 업데이트 시작');
    isUpdatingRef.current = true;
    prevRecurrenceRuleRef.current = createRecurrenceRule;
    
    if (isRepeat) {
      console.log('[recurrenceInput] formStateDispatch 호출 - setRecurrenceRule:', createRecurrenceRule);
      formStateDispatch({
        type: FormStateActionType.setRecurrenceRule,
        recurrenceRule: createRecurrenceRule,
      });
    } else {
      console.log('[recurrenceInput] formStateDispatch 호출 - setRecurrenceRule: undefined');
      formStateDispatch({
        type: FormStateActionType.setRecurrenceRule,
        recurrenceRule: undefined,
      });
    }
    
    // 다음 렌더링 사이클에서 isUpdatingRef를 리셋
    setTimeout(() => {
      isUpdatingRef.current = false;
      console.log('[recurrenceInput] isUpdatingRef 리셋');
    }, 0);
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
            onEndTypeChange={handleEndTypeChange}
            onCountChange={setCount}
            onUntilChange={setUntil}
          />
        </div>
      )}
    </>
  );
}
