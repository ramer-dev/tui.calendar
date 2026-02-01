/**
 * 반복 빈도 타입
 */
export type RepeatFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly'

/**
 * 요일 타입 (iCalendar 스펙 기반)
 * MO, TU, WE, TH, FR, SA, SU 또는 숫자와 함께 사용 (예: 1MO = 첫 번째 월요일, -1MO = 마지막 월요일)
 */
export type DayOfWeek = 'MO' | 'TU' | 'WE' | 'TH' | 'FR' | 'SA' | 'SU'

/**
 * 요일 지정 형식 (위치와 함께)
 * 예: "1MO" = 첫 번째 월요일, "-1FR" = 마지막 금요일, "WE" = 수요일
 */
export type DayOfWeekWithPosition = string

/**
 * **반복 종료 조건**  
 * count : number, until : string | Date  
 * count : 반복 횟수  
 * until : 반복 종료 날짜  
 * *count와 until 중 하나만 지정 할 것*
 */
export interface RepeatEndCondition {
  /**
   * 반복 횟수 (예: 10회 반복)
   * count와 until 중 하나만 지정 가능
   */
  count?: number

  /**
   * 종료 날짜 (ISO 8601 형식 또는 Date)
   * count와 until 중 하나만 지정 가능
   */
  until?: 'forever' | Date
}

/**
 * 일일 반복 옵션
 * 예: 3일마다, 매일 등
 */
export interface DailyRepeatOptions {
  frequency: 'daily'
  /**
   * 반복 간격 (일 단위)
   * 예: 1 = 매일, 3 = 3일마다, 7 = 7일마다
   * @default 1
   */
  interval?: number
}

/**
 * 주간 반복 옵션
 * 예: 매주 월요일, 2주마다 화요일 등
 */
export interface WeeklyRepeatOptions {
  frequency: 'weekly'
  /**
   * 반복 간격 (주 단위)
   * 예: 1 = 매주, 2 = 2주마다
   * @default 1
   */
  interval?: number
  /**
   * 반복할 요일
   * 예: ['MO', 'WE', 'FR'] = 월, 수, 금요일
   * @default 시작일의 요일
   */
  byDay?: DayOfWeek[]
}

/**
 * 월간 반복 옵션
 * 예: 매월 15일, 매달 셋째 주 수요일, 2개월마다 첫째 주 금요일 등
 */
export interface MonthlyRepeatOptions {
  frequency: 'monthly'
  /**
   * 반복 간격 (월 단위)
   * 예: 1 = 매월, 2 = 2개월마다
   * @default 1
   */
  interval?: number
  /**
   * 월의 일 (1-31 또는 -1, -2 등)
   * 예: [15] = 매월 15일, [-1] = 매월 마지막 날
   * byDay와 함께 사용 불가
   */
  byMonthDay?: number[]
  /**
   * 요일과 위치
   * 예: ['1MO'] = 매월 첫 번째 월요일, ['-1FR'] = 매월 마지막 금요일, ['3WE'] = 매월 셋째 주 수요일
   * byMonthDay와 함께 사용 불가
   */
  byDay?: DayOfWeekWithPosition[]
}

/**
 * 연간 반복 옵션
 * 예: 매년 1월 1일, 매년 10월, 5년마다, 매년 10월 셋째 주 수요일 등
 */
export interface YearlyRepeatOptions {
  frequency: 'yearly'
  /**
   * 반복 간격 (년 단위)
   * 예: 1 = 매년, 5 = 5년마다
   * @default 1
   */
  interval?: number
  /**
   * 반복할 월 (1-12)
   * 예: [10] = 10월에만, [1, 7, 12] = 1월, 7월, 12월에만
   */
  byMonth?: number[]
  /**
   * 월의 일 (1-31)
   * 예: [15] = 15일
   * byDay와 함께 사용 불가
   */
  byMonthDay?: number[]
  /**
   * 요일과 위치
   * 예: ['3WE'] = 셋째 주 수요일
   * byMonthDay와 함께 사용 불가
   */
  byDay?: DayOfWeekWithPosition[]
}

/**
 * 완전한 반복 규칙 (종료 조건 포함)  
 * repeat : DailyRepeatOptions | WeeklyRepeatOptions | MonthlyRepeatOptions | YearlyRepeatOptions  
 * startDate : string | Date    
 */
export interface RecurrenceRule extends RepeatEndCondition {
  /**
   * 반복 옵션
   */
  repeat: DailyRepeatOptions | WeeklyRepeatOptions | MonthlyRepeatOptions | YearlyRepeatOptions
  /**
   * 반복 규칙의 시작 날짜 (ISO 8601 형식 또는 Date)
   * 이 날짜부터 반복이 시작됩니다
   */
  startDate: string | Date
}

/**
 * 간편한 반복 설정을 위한 헬퍼 타입
 * 복잡한 설정 없이 빠르게 반복 규칙을 만들 수 있습니다
 */
export interface SimpleRepeatConfig {
  /**
   * 반복 빈도
   */
  frequency: RepeatFrequency
  /**
   * 반복 간격 (기본값: 1)
   */
  interval?: number
  /**
   * 종료 조건
   */
  endCondition?: RepeatEndCondition
  /**
   * 추가 옵션 (frequency에 따라 다름)
   */
  options?: {
    /**
     * 일일/주간: 사용 안 함
     * 월간: byMonthDay 또는 byDay
     * 연간: byMonth, byMonthDay, byDay
     */
    days?: DayOfWeek[] | DayOfWeekWithPosition[]
    /**
     * 월간/연간: 월의 일
     */
    monthDays?: number[]
    /**
     * 연간: 월
     */
    months?: number[]
  }
}
