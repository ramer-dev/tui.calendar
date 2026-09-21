import { h } from 'preact';
import { createPortal } from 'preact/compat';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'preact/hooks';

import type { DateRangePicker } from 'tui-date-picker';

import { CalendarSelector } from '@src/components/popup/calendarSelector';
import { ClosePopupButton } from '@src/components/popup/closePopupButton';
import { ConfirmPopupButton } from '@src/components/popup/confirmPopupButton';
import { DateSelector } from '@src/components/popup/dateSelector';
import { EventStateSelector } from '@src/components/popup/eventStateSelector';
import { LocationInputBox } from '@src/components/popup/locationInputBox';
import { RecurrenceInputBox } from '@src/components/popup/recurrenceInput';
import { ReminderInputBox } from '@src/components/popup/reminderInput';
import type { ReminderValue } from '@src/components/popup/reminderInput';
import { PopupSection } from '@src/components/popup/popupSection';
import { TitleInputBox } from '@src/components/popup/titleInputBox';
import { Template } from '@src/components/template';
import {
  BOOLEAN_KEYS_OF_EVENT_MODEL_DATA,
  FormPopupArrowDirection,
  HALF_OF_POPUP_ARROW_HEIGHT,
} from '@src/constants/popup';
import { useDispatch, useStore } from '@src/contexts/calendarStore';
import { useEventBus } from '@src/contexts/eventBus';
import { useFloatingLayer } from '@src/contexts/floatingLayer';
import { useLayoutContainer } from '@src/contexts/layoutContainer';
import { cls } from '@src/helpers/css';
import { isLeftOutOfLayout, isTopOutOfLayout } from '@src/helpers/popup';
import { FormStateActionType, useFormState } from '@src/hooks/popup/useFormState';
import type EventModel from '@src/model/eventModel';
import { calendarSelector } from '@src/selectors';
import { eventFormPopupParamSelector } from '@src/selectors/popup';
import TZDate from '@src/time/date';
import { compare } from '@src/time/datetime';
import { isNil, isPresent } from '@src/utils/type';

import type { FormEvent, StyleProp } from '@t/components/common';
import type { BooleanKeyOfEventObject, EventObject } from '@t/events';
import type { PopupArrowPointPosition, Rect } from '@t/store';

const classNames = {
  popupContainer: cls('popup-container'),
  formContainer: cls('form-container'),
  popupArrowBorder: cls('popup-arrow-border'),
  popupArrowFill: cls('popup-arrow-fill'),
};

function calculatePopupPosition(
  popupArrowPointPosition: PopupArrowPointPosition,
  layoutRect: Rect,
  popupRect: Rect
) {
  let top = popupArrowPointPosition.top - popupRect.height - HALF_OF_POPUP_ARROW_HEIGHT;
  let left = popupArrowPointPosition.left - popupRect.width / 2;
  let direction = FormPopupArrowDirection.bottom;

  if (top < layoutRect.top) {
    direction = FormPopupArrowDirection.top;
    top = popupArrowPointPosition.top + HALF_OF_POPUP_ARROW_HEIGHT;
  }

  if (isTopOutOfLayout(top, layoutRect, popupRect)) {
    top = layoutRect.top + layoutRect.height - popupRect.height;
  }

  if (isLeftOutOfLayout(left, layoutRect, popupRect)) {
    left = layoutRect.left + layoutRect.width - popupRect.width;
  }

  return {
    top: top + window.scrollY,
    left: Math.max(left, layoutRect.left) + window.scrollX,
    direction,
  };
}

function isBooleanKey(key: string): key is BooleanKeyOfEventObject {
  return BOOLEAN_KEYS_OF_EVENT_MODEL_DATA.indexOf(key as BooleanKeyOfEventObject) !== -1;
}

// Momento 확장 — 새 일정을 만들 때 "알림" 기본값. 앱(App.tsx)이 설정 화면의 값을
// window.__momentoDefaultReminder에 게시해두면 그 값을, 없으면 안전한 기본값을 사용한다.
function getDefaultReminder(): ReminderValue {
  const published = (window as any).__momentoDefaultReminder;
  if (published && typeof published.value === 'number' && typeof published.unit === 'string') {
    return { reminderEnabled: false, reminderValue: published.value, reminderUnit: published.unit };
  }
  return { reminderEnabled: false, reminderValue: 10, reminderUnit: '분' };
}

// event.raw에 저장된 개별 알림 설정을 읽는다 (없으면 새 기본값)
function getReminderFromRaw(raw: unknown): ReminderValue {
  const reminder = (raw as any)?.reminder;
  if (reminder && typeof reminder === 'object') {
    return {
      reminderEnabled: !!reminder.reminderEnabled,
      reminderValue:
        typeof reminder.reminderValue === 'number' ? reminder.reminderValue : 10,
      reminderUnit:
        reminder.reminderUnit === '초' ||
        reminder.reminderUnit === '분' ||
        reminder.reminderUnit === '시간' ||
        reminder.reminderUnit === '일'
          ? reminder.reminderUnit
          : '분',
    };
  }
  return getDefaultReminder();
}

function getChanges(event: EventModel, eventObject: EventObject) {
  return Object.entries(eventObject).reduce((changes, [key, value]) => {
    const eventObjectKey = key as keyof EventObject;

    if (event[eventObjectKey] instanceof TZDate) {
      // NOTE: handle TZDate
      if (compare(event[eventObjectKey], value) !== 0) {
        changes[eventObjectKey] = value;
      }
    } else if (eventObjectKey === 'recurrenceRule') {
      // recurrenceRule은 객체이므로 깊은 비교 필요
      // event.isRepeat이 false이거나 recurrenceRule이 실제로 없으면 undefined로 처리
      const eventRecurrenceRule = event.isRepeat ? event[eventObjectKey] : undefined;
      const newRecurrenceRule = (eventObject as any).isRepeat ? value : undefined;
      
      // 둘 다 undefined이거나 null이면 변경 없음
      if (!eventRecurrenceRule && !newRecurrenceRule) {
        // 변경 없음
      } else if (!eventRecurrenceRule || !newRecurrenceRule) {
        // 하나만 있으면 변경
        changes[eventObjectKey] = value;
      } else {
        // 둘 다 있으면 JSON 비교
        try {
          // Date 객체를 ISO 문자열로 변환하여 비교
          const normalizeRule = (rule: any) => {
            if (!rule) return rule;
            const normalized = { ...rule };
            if (normalized.startDate instanceof Date) {
              normalized.startDate = normalized.startDate.toISOString();
            } else if (typeof normalized.startDate === 'string') {
              // 이미 문자열이면 그대로 사용
            }
            if (normalized.until instanceof Date) {
              normalized.until = normalized.until.toISOString();
            } else if (normalized.until === 'forever' || normalized.until === undefined) {
              // forever나 undefined는 그대로 사용
            }
            return normalized;
          };
          
          const eventRuleStr = JSON.stringify(normalizeRule(eventRecurrenceRule));
          const newRuleStr = JSON.stringify(normalizeRule(newRecurrenceRule));
          if (eventRuleStr !== newRuleStr) {
            changes[eventObjectKey] = value;
          }
        } catch (e) {
          // JSON 변환 실패 시 변경된 것으로 간주
          console.error('recurrenceRule 비교 중 오류:', e);
          changes[eventObjectKey] = value;
        }
      }
    } else if (event[eventObjectKey] !== value) {
      changes[eventObjectKey] = value;
    }

    return changes;
  }, {} as EventObject);
}

export function EventFormPopup() {
  const { calendars } = useStore(calendarSelector);
  const { hideAllPopup } = useDispatch('popup');
  const popupParams = useStore(eventFormPopupParamSelector);
  const { start, end, popupArrowPointPosition, close, isCreationPopup, event } = popupParams ?? {};
  const eventBus = useEventBus();
  const formPopupSlot = useFloatingLayer('formPopupSlot');
  const [formState, formStateDispatch] = useFormState(calendars[0]?.id);
  // Momento 확장 — 일정별 알림. EventObject/EventModel의 정식 필드가 아니라서 formState
  // reducer를 거치지 않고 별도 로컬 상태로 관리한 뒤, 제출 시 eventData.raw에 병합한다.
  const [reminder, setReminder] = useState<ReminderValue>(getDefaultReminder());

  const datePickerRef = useRef<DateRangePicker>(null);
  const popupContainerRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<StyleProp>({});
  const [arrowLeft, setArrowLeft] = useState<number>(0);
  const [arrowDirection, setArrowDirection] = useState<FormPopupArrowDirection>(
    FormPopupArrowDirection.bottom
  );

  const layoutContainer = useLayoutContainer();

  const popupArrowClassName = useMemo(() => {
    const top = arrowDirection === FormPopupArrowDirection.top;
    const bottom = arrowDirection === FormPopupArrowDirection.bottom;

    return cls('popup-arrow', { top, bottom });
  }, [arrowDirection]);

  useLayoutEffect(() => {
    if (popupContainerRef.current && popupArrowPointPosition && layoutContainer) {
      const layoutRect = layoutContainer.getBoundingClientRect();
      const popupRect = popupContainerRef.current.getBoundingClientRect();

      const { top, left, direction } = calculatePopupPosition(
        popupArrowPointPosition,
        layoutRect,
        popupRect
      );
      const arrowLeftPosition = popupArrowPointPosition.left - left;

      setStyle({ left, top });
      setArrowLeft(arrowLeftPosition);
      setArrowDirection(direction);
    }
  }, [layoutContainer, popupArrowPointPosition, formState.isRepeat, reminder.reminderEnabled]); // isRepeat/reminderEnabled: 옵션 영역이 펼쳐질 때 위치 재계산

  // Sync store's popupParams with formState when editing event
  useEffect(() => {
    if (isPresent(popupParams) && isPresent(event)) {
      const eventObject = event.toEventObject();
      
      // recurrenceRule 확인: event.recurrenceRule 또는 event.raw에서 가져오기
      let recurrenceRule = eventObject.recurrenceRule;
      
      // event.raw가 있고 recurrenceRule이 있으면 raw에서 가져오기 (더 정확할 수 있음)
      if (event.raw && (event.raw as any).recurrenceRule) {
        recurrenceRule = (event.raw as any).recurrenceRule;
      }
      
      // event.isRepeat가 true이거나 recurrenceRule이 있으면 반복 이벤트로 간주
      const isRepeat = event.isRepeat || !!recurrenceRule;
      
      // recurrenceRule이 있으면 상세 정보 로깅
      if (recurrenceRule) {
        console.log('[eventFormPopup] 수정 시 formState 초기화 - recurrenceRule 상세:', {
          eventId: event.id,
          isRepeat: event.isRepeat,
          hasRecurrenceRule: !!recurrenceRule,
          recurrenceRule: recurrenceRule,
          repeat: recurrenceRule.repeat,
          frequency: recurrenceRule.repeat?.frequency,
          interval: (recurrenceRule.repeat as any)?.interval,
          byDay: (recurrenceRule.repeat as any)?.byDay,
          byMonthDay: (recurrenceRule.repeat as any)?.byMonthDay,
          byMonth: (recurrenceRule.repeat as any)?.byMonth,
          count: recurrenceRule.count,
          until: recurrenceRule.until,
          startDate: recurrenceRule.startDate,
          eventRaw: event.raw
        });
      } else {
        console.log('[eventFormPopup] 수정 시 formState 초기화:', {
          eventId: event.id,
          isRepeat: event.isRepeat,
          hasRecurrenceRule: !!recurrenceRule,
          recurrenceRule: recurrenceRule,
          eventRaw: event.raw
        });
      }
      
      formStateDispatch({
        type: FormStateActionType.init,
        event: {
          title: popupParams.title,
          location: popupParams.location,
          isAllday: popupParams.isAllday,
          isPrivate: popupParams.isPrivate,
          calendarId: event.calendarId,
          state: popupParams.eventState,
          isRepeat: isRepeat,
          recurrenceRule: isRepeat ? recurrenceRule : undefined,
        },
      });
      
      console.log('[eventFormPopup] formState 초기화 완료 - isRepeat:', isRepeat, 'recurrenceRule:', isRepeat ? recurrenceRule : undefined);

      // Momento 확장 — 이 일정에 저장된 알림 설정을 raw에서 읽어온다 (없으면 기본값)
      setReminder(getReminderFromRaw(event.raw));
    } else if (isPresent(popupParams) && isNil(event)) {
      // 새 일정 생성 팝업이 열릴 때마다 설정 화면의 최신 기본값으로 갱신
      setReminder(getDefaultReminder());
    }
  }, [calendars, event, formStateDispatch, popupParams]);

  // Reset form states when closing the popup
  useEffect(() => {
    if (isNil(popupParams)) {
      formStateDispatch({ type: FormStateActionType.reset });
      setReminder(getDefaultReminder());
    }
  }, [formStateDispatch, popupParams]);

  if (isNil(start) || isNil(end) || isNil(formPopupSlot)) {
    return null;
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();

    const formData = new FormData(e.target as HTMLFormElement);
    const eventData: EventObject = { ...formState };

    formData.forEach((data, key) => {
      eventData[key as keyof EventObject] = isBooleanKey(key) ? data === 'true' : data;
    });

    eventData.start = new TZDate(datePickerRef.current?.getStartDate());
    eventData.end = new TZDate(datePickerRef.current?.getEndDate());

    // formState에서 recurrenceRule과 isRepeat 명시적으로 설정
    eventData.isRepeat = formState.isRepeat;
    eventData.recurrenceRule = formState.isRepeat ? formState.recurrenceRule : undefined;

    // Momento 확장 — 알림 설정을 raw에 병합 (기존 raw의 다른 값은 보존)
    const existingRaw =
      event && event.raw && typeof event.raw === 'object' ? (event.raw as Record<string, unknown>) : {};
    eventData.raw = { ...existingRaw, reminder };

    console.log('[eventFormPopup] onSubmit - eventData:', {
      isRepeat: eventData.isRepeat,
      hasRecurrenceRule: !!eventData.recurrenceRule,
      recurrenceRule: eventData.recurrenceRule,
      formStateIsRepeat: formState.isRepeat,
      formStateRecurrenceRule: formState.recurrenceRule
    });

    if (isCreationPopup) {
      eventBus.fire('beforeCreateEvent', eventData);
    } else if (event) {
      const changes = getChanges(event, eventData);
      const eventObject = event.toEventObject();
      
      // recurrenceActionOption이 있으면 이벤트 객체에 추가
      if (popupParams?.recurrenceActionOption) {
        (eventObject as any).recurrenceActionOption = popupParams.recurrenceActionOption;
      }

      // recurrenceRule 변경사항이 명시적으로 포함되도록 확인
      // formState에서 recurrenceRule이 변경되었는지 확인
      if (eventData.recurrenceRule !== undefined || eventData.isRepeat !== undefined) {
        // isRepeat이 false이면 recurrenceRule을 undefined로 설정
        if (!eventData.isRepeat) {
          changes.recurrenceRule = undefined;
        } else if (eventData.recurrenceRule !== undefined) {
          changes.recurrenceRule = eventData.recurrenceRule;
        }
      }
      eventBus.fire('beforeUpdateEvent', { event: eventObject, changes });
    }
    hideAllPopup();
  };

  return createPortal(
    <div role="dialog" className={classNames.popupContainer} ref={popupContainerRef} style={style}>
      <form onSubmit={onSubmit}>
        <div className={classNames.formContainer}>
          <div className={cls('form-container-scrollable')}>
            {calendars?.length ? (
              <div className={cls('form-container-scrollable-item')}>
                <CalendarSelector
                  selectedCalendarId={formState.calendarId}
                  calendars={calendars}
                  formStateDispatch={formStateDispatch}
                />
                <EventStateSelector eventState={formState.state} formStateDispatch={formStateDispatch} /> </div>
            ) : (
              <PopupSection />
            )}
            <TitleInputBox
              title={formState.title}
              isPrivate={formState.isPrivate}
              formStateDispatch={formStateDispatch}
            />
            <LocationInputBox location={formState.location} formStateDispatch={formStateDispatch} />
            <DateSelector
              start={start}
              end={end}
              isAllday={formState.isAllday}
              formStateDispatch={formStateDispatch}
              ref={datePickerRef}
            />
            <div className={cls('popup-section-toggle-row')}>
              <RecurrenceInputBox
                recurrence={formState.recurrenceRule}
                formStateDispatch={formStateDispatch}
                isRepeat={formState.isRepeat}
                startDate={start}
              />
              <ReminderInputBox value={reminder} onChange={setReminder} />
            </div>
            <ClosePopupButton type="form" close={close} />
          </div>
          <div className={cls('form-container-footer')}>
            <PopupSection>
              <ConfirmPopupButton>
                {isCreationPopup ? (
                  <Template template="popupSave" />
                ) : (
                  <Template template="popupUpdate" />
                )}
              </ConfirmPopupButton>
            </PopupSection>
          </div>
        </div>
        <div className={popupArrowClassName}>
          <div className={classNames.popupArrowBorder} style={{ left: arrowLeft }}>
            <div className={classNames.popupArrowFill} />
          </div>
        </div>
      </form>
    </div>,
    formPopupSlot
  );
}
