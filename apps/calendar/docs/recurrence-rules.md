# 반복 규칙 (Recurrence Rules)

일정의 반복 패턴을 정의하기 위한 타입 시스템입니다. iCalendar RRULE 스펙을 기반으로 설계되었으며, 일일, 주간, 월간, 연간 반복을 지원합니다.

## 목차

- [기본 개념](#기본-개념)
- [타입 정의](#타입-정의)
- [반복 빈도별 옵션](#반복-빈도별-옵션)
  - [일일 반복 (Daily)](#일일-반복-daily)
  - [주간 반복 (Weekly)](#주간-반복-weekly)
  - [월간 반복 (Monthly)](#월간-반복-monthly)
  - [연간 반복 (Yearly)](#연간-반복-yearly)
- [종료 조건](#종료-조건)
- [사용 예제](#사용-예제)
- [고급 사용법](#고급-사용법)

## 기본 개념

반복 규칙은 다음 세 가지 요소로 구성됩니다:

1. **반복 옵션 (RepeatOptions)**: 반복의 빈도와 패턴을 정의
2. **시작 날짜 (startDate)**: 반복이 시작되는 날짜
3. **종료 조건 (EndCondition)**: 반복이 언제 끝나는지 정의 (선택사항)

## 타입 정의

### RepeatFrequency

반복 빈도 타입입니다.

```typescript
type RepeatFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly'
```

### DayOfWeek

요일 타입입니다. iCalendar 스펙을 따릅니다.

```typescript
type DayOfWeek = 'MO' | 'TU' | 'WE' | 'TH' | 'FR' | 'SA' | 'SU'
```

### DayOfWeekWithPosition

위치와 함께 요일을 지정하는 형식입니다.

- `'1MO'`: 첫 번째 월요일
- `'-1FR'`: 마지막 금요일
- `'3WE'`: 셋째 주 수요일
- `'WE'`: 수요일 (위치 없음)

### RecurrenceRule

완전한 반복 규칙입니다.

```typescript
interface RecurrenceRule extends RepeatEndCondition {
  repeat: RepeatOptions
  startDate: string | Date
}
```

## 반복 빈도별 옵션

### 일일 반복 (Daily)

매일 또는 N일마다 반복합니다.

#### DailyRepeatOptions

```typescript
interface DailyRepeatOptions {
  frequency: 'daily'
  interval?: number  // 기본값: 1 (매일)
}
```

#### 예제

```typescript
// 매일
const daily: RecurrenceRule = {
  repeat: { frequency: 'daily' },
  startDate: '2024-01-01',
  until: '2024-12-31'
}

// 3일마다
const every3Days: RecurrenceRule = {
  repeat: { frequency: 'daily', interval: 3 },
  startDate: '2024-01-01',
  until: '2024-12-31'
}

// 7일마다 (매주 같은 요일)
const weekly: RecurrenceRule = {
  repeat: { frequency: 'daily', interval: 7 },
  startDate: '2024-01-01',
  count: 52  // 52주 동안
}
```

### 주간 반복 (Weekly)

매주 또는 N주마다 특정 요일에 반복합니다.

#### WeeklyRepeatOptions

```typescript
interface WeeklyRepeatOptions {
  frequency: 'weekly'
  interval?: number  // 기본값: 1 (매주)
  byDay?: DayOfWeek[]  // 기본값: 시작일의 요일
}
```

#### 예제

```typescript
// 매주 월요일
const everyMonday: RecurrenceRule = {
  repeat: { frequency: 'weekly', byDay: ['MO'] },
  startDate: '2024-01-01',
  until: '2024-12-31'
}

// 매주 월요일과 금요일
const mondayAndFriday: RecurrenceRule = {
  repeat: { frequency: 'weekly', byDay: ['MO', 'FR'] },
  startDate: '2024-01-01',
  until: '2024-12-31'
}

// 2주마다 화요일
const every2WeeksTuesday: RecurrenceRule = {
  repeat: { frequency: 'weekly', interval: 2, byDay: ['TU'] },
  startDate: '2024-01-01',
  count: 26  // 26회 (1년간)
}
```

### 월간 반복 (Monthly)

매월 또는 N개월마다 특정 날짜나 요일에 반복합니다.

#### MonthlyRepeatOptions

```typescript
interface MonthlyRepeatOptions {
  frequency: 'monthly'
  interval?: number  // 기본값: 1 (매월)
  byMonthDay?: number[]  // 월의 일 (1-31 또는 -1, -2 등)
  byDay?: DayOfWeekWithPosition[]  // 요일과 위치
}
```

**주의**: `byMonthDay`와 `byDay`는 함께 사용할 수 없습니다.

#### 예제

```typescript
// 매월 15일
const monthly15th: RecurrenceRule = {
  repeat: { frequency: 'monthly', byMonthDay: [15] },
  startDate: '2024-01-01',
  count: 12
}

// 매월 마지막 날
const lastDayOfMonth: RecurrenceRule = {
  repeat: { frequency: 'monthly', byMonthDay: [-1] },
  startDate: '2024-01-01',
  count: 12
}

// 매달 셋째 주 수요일
const thirdWednesday: RecurrenceRule = {
  repeat: { frequency: 'monthly', byDay: ['3WE'] },
  startDate: '2024-01-01',
  count: 12
}

// 매월 첫 번째 월요일
const firstMonday: RecurrenceRule = {
  repeat: { frequency: 'monthly', byDay: ['1MO'] },
  startDate: '2024-01-01',
  count: 12
}

// 매월 마지막 금요일
const lastFriday: RecurrenceRule = {
  repeat: { frequency: 'monthly', byDay: ['-1FR'] },
  startDate: '2024-01-01',
  count: 12
}

// 2개월마다 첫째 주 금요일
const every2MonthsFirstFriday: RecurrenceRule = {
  repeat: { frequency: 'monthly', interval: 2, byDay: ['1FR'] },
  startDate: '2024-01-01',
  count: 6
}
```

### 연간 반복 (Yearly)

매년 또는 N년마다 특정 날짜, 월, 요일에 반복합니다.

#### YearlyRepeatOptions

```typescript
interface YearlyRepeatOptions {
  frequency: 'yearly'
  interval?: number  // 기본값: 1 (매년)
  byMonth?: number[]  // 월 (1-12)
  byMonthDay?: number[]  // 월의 일 (1-31)
  byDay?: DayOfWeekWithPosition[]  // 요일과 위치
}
```

**주의**: `byMonthDay`와 `byDay`는 함께 사용할 수 없습니다.

#### 예제

```typescript
// 매년 1월 1일
const newYear: RecurrenceRule = {
  repeat: { frequency: 'yearly', byMonth: [1], byMonthDay: [1] },
  startDate: '2024-01-01',
  count: 10
}

// 10월에만 (10월의 모든 날짜)
const octoberOnly: RecurrenceRule = {
  repeat: { frequency: 'yearly', byMonth: [10] },
  startDate: '2024-10-01',
  until: '2030-12-31'
}

// 매년 10월 15일
const october15th: RecurrenceRule = {
  repeat: { frequency: 'yearly', byMonth: [10], byMonthDay: [15] },
  startDate: '2024-10-01',
  count: 10
}

// 5년에 한번
const every5Years: RecurrenceRule = {
  repeat: { frequency: 'yearly', interval: 5 },
  startDate: '2024-01-01',
  count: 10  // 10회 (50년간)
}

// 매년 10월 셋째 주 수요일
const octoberThirdWednesday: RecurrenceRule = {
  repeat: { frequency: 'yearly', byMonth: [10], byDay: ['3WE'] },
  startDate: '2024-10-01',
  count: 10
}

// 1월, 7월, 12월에만
const specificMonths: RecurrenceRule = {
  repeat: { frequency: 'yearly', byMonth: [1, 7, 12] },
  startDate: '2024-01-01',
  until: '2030-12-31'
}
```

## 종료 조건

반복이 언제 끝나는지 정의합니다. `count`와 `until` 중 하나만 지정할 수 있습니다.

### RepeatEndCondition

```typescript
interface RepeatEndCondition {
  count?: number  // 반복 횟수
  until?: string | Date  // 종료 날짜 (ISO 8601 형식)
}
```

#### 예제

```typescript
// 10회 반복
const repeat10Times: RecurrenceRule = {
  repeat: { frequency: 'daily' },
  startDate: '2024-01-01',
  count: 10
}

// 특정 날짜까지 반복
const untilDate: RecurrenceRule = {
  repeat: { frequency: 'weekly', byDay: ['MO'] },
  startDate: '2024-01-01',
  until: '2024-12-31'
}

// 종료 조건 없음 (무한 반복)
const infinite: RecurrenceRule = {
  repeat: { frequency: 'daily' },
  startDate: '2024-01-01'
}
```

## 사용 예제

### 실전 예제 모음

```typescript
// 1. 매일 아침 운동
const morningExercise: RecurrenceRule = {
  repeat: { frequency: 'daily' },
  startDate: '2024-01-01',
  until: '2024-12-31'
}

// 2. 주 3회 운동 (월, 수, 금)
const workout3Times: RecurrenceRule = {
  repeat: { frequency: 'weekly', byDay: ['MO', 'WE', 'FR'] },
  startDate: '2024-01-01',
  until: '2024-12-31'
}

// 3. 매월 급여일 (매월 25일)
const salaryDay: RecurrenceRule = {
  repeat: { frequency: 'monthly', byMonthDay: [25] },
  startDate: '2024-01-01',
  count: 12
}

// 4. 분기별 회의 (매월 첫째 주 월요일, 3개월마다)
const quarterlyMeeting: RecurrenceRule = {
  repeat: { frequency: 'monthly', interval: 3, byDay: ['1MO'] },
  startDate: '2024-01-01',
  count: 4
}

// 5. 생일 (매년 같은 날짜)
const birthday: RecurrenceRule = {
  repeat: { frequency: 'yearly' },
  startDate: '1990-05-15',
  count: 100
}

// 6. 연말정산 (매년 1월)
const yearEndSettlement: RecurrenceRule = {
  repeat: { frequency: 'yearly', byMonth: [1] },
  startDate: '2024-01-01',
  count: 10
}

// 7. 올림픽 (4년마다)
const olympics: RecurrenceRule = {
  repeat: { frequency: 'yearly', interval: 4 },
  startDate: '2024-07-26',
  count: 10
}

// 8. 매월 마지막 금요일 (회의)
const lastFridayMeeting: RecurrenceRule = {
  repeat: { frequency: 'monthly', byDay: ['-1FR'] },
  startDate: '2024-01-01',
  count: 12
}

// 9. 격주 화요일 (2주마다)
const biweeklyTuesday: RecurrenceRule = {
  repeat: { frequency: 'weekly', interval: 2, byDay: ['TU'] },
  startDate: '2024-01-01',
  until: '2024-12-31'
}

// 10. 3일마다 약 복용
const medication: RecurrenceRule = {
  repeat: { frequency: 'daily', interval: 3 },
  startDate: '2024-01-01',
  count: 30  // 30회 (약 3개월)
}
```

## 고급 사용법

### 요일 위치 지정 상세

요일 위치는 다음과 같이 지정할 수 있습니다:

- `'1MO'`: 첫 번째 월요일
- `'2TU'`: 두 번째 화요일
- `'3WE'`: 셋째 주 수요일
- `'4TH'`: 네 번째 목요일
- `'-1FR'`: 마지막 금요일
- `'-2SA'`: 마지막에서 두 번째 토요일
- `'MO'`: 월요일 (위치 없음, 해당 월의 모든 월요일)

### 복합 조건

여러 조건을 조합하여 복잡한 반복 패턴을 만들 수 있습니다:

```typescript
// 매년 1월, 4월, 7월, 10월의 첫째 주 월요일 (분기별)
const quarterlyFirstMonday: RecurrenceRule = {
  repeat: {
    frequency: 'yearly',
    byMonth: [1, 4, 7, 10],
    byDay: ['1MO']
  },
  startDate: '2024-01-01',
  count: 20
}

// 매년 여름 (6, 7, 8월)의 마지막 금요일
const summerLastFriday: RecurrenceRule = {
  repeat: {
    frequency: 'yearly',
    byMonth: [6, 7, 8],
    byDay: ['-1FR']
  },
  startDate: '2024-06-01',
  count: 10
}
```

### 주의사항

1. **byMonthDay와 byDay는 함께 사용 불가**: 월간/연간 반복에서 `byMonthDay`와 `byDay`는 동시에 사용할 수 없습니다.

2. **count와 until은 함께 사용 불가**: 종료 조건에서 `count`와 `until` 중 하나만 지정해야 합니다.

3. **음수 인덱스**: `byMonthDay`와 `byDay`에서 음수는 끝에서부터 계산합니다.
   - `-1`: 마지막
   - `-2`: 마지막에서 두 번째

4. **기본값**: `interval`이 지정되지 않으면 기본값은 `1`입니다.

5. **요일 기본값**: 주간 반복에서 `byDay`가 지정되지 않으면 시작일의 요일이 사용됩니다.

## 타입 안정성

TypeScript의 유니온 타입을 사용하여 각 빈도별로 올바른 옵션만 사용할 수 있도록 타입 안정성을 보장합니다:

```typescript
// ✅ 올바른 사용
const daily: RecurrenceRule = {
  repeat: { frequency: 'daily', interval: 3 },
  startDate: '2024-01-01'
}

// ❌ 타입 오류: daily에는 byDay를 사용할 수 없음
const wrong: RecurrenceRule = {
  repeat: { frequency: 'daily', byDay: ['MO'] },  // 타입 오류!
  startDate: '2024-01-01'
}
```

## 참고 자료

- [iCalendar RFC 5545](https://tools.ietf.org/html/rfc5545) - 반복 규칙 스펙
- [RRULE 스펙](https://icalendar.org/rfc5545.html#section-3.3.10) - 상세 규칙 설명
