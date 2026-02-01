import { h } from 'preact';
import { useEffect, useState, useMemo } from 'preact/hooks';

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

interface Props {
  recurrence?: RecurrenceRule;
  formStateDispatch: FormStateDispatcher;
  isRepeat?: boolean;
  startDate?: TZDate | Date | string;
}

const classNames = {
  popupSectionItem: cls('popup-section-item', 'popup-section-location'),
  locationIcon: cls('icon', 'ic-repeat-b'),
  content: cls('content'),
  repeat: cls('popup-section-item', 'popup-section-repeat'),
  repeatOptions: cls('popup-section-item', 'popup-repeat-options'),
  select: cls('popup-select'),
  input: cls('popup-input'),
  label: cls('popup-label'),
  checkboxGroup: cls('popup-checkbox-group'),
  checkboxItem: cls('popup-checkbox-item'),
};

const FREQUENCY_OPTIONS: { value: RepeatFrequency; label: string }[] = [
  { value: 'daily', label: '일일' },
  { value: 'weekly', label: '주간' },
  { value: 'monthly', label: '월간' },
  { value: 'yearly', label: '연간' },
];

const DAY_OPTIONS: { value: DayOfWeek; label: string }[] = [
  { value: 'MO', label: '월요일' },
  { value: 'TU', label: '화요일' },
  { value: 'WE', label: '수요일' },
  { value: 'TH', label: '목요일' },
  { value: 'FR', label: '금요일' },
  { value: 'SA', label: '토요일' },
  { value: 'SU', label: '일요일' },
];

const MONTH_OPTIONS = [
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

const WEEK_POSITION_OPTIONS = [
  { value: '1', label: '첫째 주' },
  { value: '2', label: '둘째 주' },
  { value: '3', label: '셋째 주' },
  { value: '4', label: '넷째 주' },
  { value: '-1', label: '마지막 주' },
];

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
  const [until, setUntil] = useState<string>(
    recurrence?.until && recurrence.until !== 'forever'
      ? new TZDate(recurrence.until).toString().split('T')[0]
      : ''
  );

  // recurrence가 변경되면 상태 업데이트
  useEffect(() => {
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
          setUntil(new TZDate(recurrence.until).toString().split('T')[0]);
        }
      } else {
        setEndType('forever');
      }
    }
  }, [recurrence]);

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

    const rule: RecurrenceRule = {
      repeat,
      startDate: typeof startDate === 'string' ? startDate : new TZDate(startDate).toString().split('T')[0],
    };

    if (endType === 'count') {
      rule.count = count;
    } else if (endType === 'until') {
      rule.until = until ? new Date(until) : 'forever';
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

  const toggleDay = (day: DayOfWeek) => {
    setSelectedDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  };

  const toggleMonth = (month: number) => {
    setSelectedMonths((prev) =>
      prev.includes(month) ? prev.filter((m) => m !== month) : [...prev, month]
    );
  };

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
          <div className={classNames.popupSectionItem}>
            <label className={classNames.label}>반복 빈도</label>
            <select
              className={classNames.select}
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

          {/* Interval 입력 */}
          <div className={classNames.popupSectionItem}>
            <label className={classNames.label}>
              반복 간격 ({frequency === 'daily' ? '일' : frequency === 'weekly' ? '주' : frequency === 'monthly' ? '개월' : '년'})
            </label>
            <input
              type="number"
              className={classNames.input}
              min="1"
              value={interval}
              onChange={(e) => setInterval(parseInt(e.currentTarget.value) || 1)}
            />
          </div>

          {/* 주간: 요일 선택 */}
          {frequency === 'weekly' && (
            <div className={classNames.popupSectionItem}>
              <label className={classNames.label}>반복 요일</label>
              <div className={classNames.checkboxGroup}>
                {DAY_OPTIONS.map((day) => (
                  <label key={day.value} className={classNames.checkboxItem}>
                    <input
                      type="checkbox"
                      checked={selectedDays.includes(day.value)}
                      onChange={() => toggleDay(day.value)}
                    />
                    <span>{day.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* 월간: 날짜 또는 요일 선택 */}
          {frequency === 'monthly' && (
            <>
              <div className={classNames.popupSectionItem}>
                <label className={classNames.label}>반복 방식</label>
                <select
                  className={classNames.select}
                  value={weekPosition && weekDay ? 'day' : 'date'}
                  onChange={(e) => {
                    if (e.currentTarget.value === 'date') {
                      setWeekPosition('');
                      setWeekDay(null);
                    } else {
                      setMonthDay(null);
                    }
                  }}
                >
                  <option value="date">날짜로</option>
                  <option value="day">요일로</option>
                </select>
              </div>

              {weekPosition && weekDay ? (
                <>
                  <div className={classNames.popupSectionItem}>
                    <label className={classNames.label}>주</label>
                    <select
                      className={classNames.select}
                      value={weekPosition}
                      onChange={(e) => setWeekPosition(e.currentTarget.value)}
                    >
                      {WEEK_POSITION_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className={classNames.popupSectionItem}>
                    <label className={classNames.label}>요일</label>
                    <select
                      className={classNames.select}
                      value={weekDay}
                      onChange={(e) => setWeekDay(e.currentTarget.value as DayOfWeek)}
                    >
                      {DAY_OPTIONS.map((day) => (
                        <option key={day.value} value={day.value}>
                          {day.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              ) : (
                <div className={classNames.popupSectionItem}>
                  <label className={classNames.label}>날짜</label>
                  <input
                    type="number"
                    className={classNames.input}
                    min="-31"
                    max="31"
                    value={monthDay || ''}
                    onChange={(e) => setMonthDay(parseInt(e.currentTarget.value) || null)}
                    placeholder="예: 15 (15일), -1 (마지막 날)"
                  />
                </div>
              )}
            </>
          )}

          {/* 연간: 월, 날짜/요일 선택 */}
          {frequency === 'yearly' && (
            <>
              <div className={classNames.popupSectionItem}>
                <label className={classNames.label}>반복 월</label>
                <div className={classNames.checkboxGroup}>
                  {MONTH_OPTIONS.map((month) => (
                    <label key={month.value} className={classNames.checkboxItem}>
                      <input
                        type="checkbox"
                        checked={selectedMonths.includes(month.value)}
                        onChange={() => toggleMonth(month.value)}
                      />
                      <span>{month.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className={classNames.popupSectionItem}>
                <label className={classNames.label}>반복 방식</label>
                <select
                  className={classNames.select}
                  value={weekPosition && weekDay ? 'day' : monthDay !== null ? 'date' : 'none'}
                  onChange={(e) => {
                    if (e.currentTarget.value === 'date') {
                      setWeekPosition('');
                      setWeekDay(null);
                    } else if (e.currentTarget.value === 'day') {
                      setMonthDay(null);
                    } else {
                      setWeekPosition('');
                      setWeekDay(null);
                      setMonthDay(null);
                    }
                  }}
                >
                  <option value="none">없음</option>
                  <option value="date">날짜로</option>
                  <option value="day">요일로</option>
                </select>
              </div>

              {weekPosition && weekDay ? (
                <>
                  <div className={classNames.popupSectionItem}>
                    <label className={classNames.label}>주</label>
                    <select
                      className={classNames.select}
                      value={weekPosition}
                      onChange={(e) => setWeekPosition(e.currentTarget.value)}
                    >
                      {WEEK_POSITION_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className={classNames.popupSectionItem}>
                    <label className={classNames.label}>요일</label>
                    <select
                      className={classNames.select}
                      value={weekDay}
                      onChange={(e) => setWeekDay(e.currentTarget.value as DayOfWeek)}
                    >
                      {DAY_OPTIONS.map((day) => (
                        <option key={day.value} value={day.value}>
                          {day.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              ) : monthDay !== null ? (
                <div className={classNames.popupSectionItem}>
                  <label className={classNames.label}>날짜</label>
                  <input
                    type="number"
                    className={classNames.input}
                    min="1"
                    max="31"
                    value={monthDay}
                    onChange={(e) => setMonthDay(parseInt(e.currentTarget.value) || null)}
                  />
                </div>
              ) : null}
            </>
          )}

          {/* 종료 조건 */}
          <div className={classNames.popupSectionItem}>
            <label className={classNames.label}>종료 조건</label>
            <select
              className={classNames.select}
              value={endType}
              onChange={(e) => setEndType(e.currentTarget.value as 'count' | 'until' | 'forever')}
            >
              <option value="forever">무한 반복</option>
              <option value="count">횟수로</option>
              <option value="until">날짜로</option>
            </select>
          </div>

          {endType === 'count' && (
            <div className={classNames.popupSectionItem}>
              <label className={classNames.label}>반복 횟수</label>
              <input
                type="number"
                className={classNames.input}
                min="1"
                value={count}
                onChange={(e) => setCount(parseInt(e.currentTarget.value) || 1)}
              />
            </div>
          )}

          {endType === 'until' && (
            <div className={classNames.popupSectionItem}>
              <label className={classNames.label}>종료 날짜</label>
              <input
                type="date"
                className={classNames.input}
                value={until}
                onChange={(e) => setUntil(e.currentTarget.value)}
              />
            </div>
          )}
        </div>
      )}
    </>
  );
}
