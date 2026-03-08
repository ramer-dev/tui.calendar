import type { EventObject, ExternalEventTypes, Options } from '@toast-ui/calendar';
import ToastUICalendar from '@toast-ui/calendar';
import React from 'react';

import { isEqual } from './isEqual';

type ReactCalendarOptions = Omit<Options, 'defaultView'>;
type CalendarView = Required<Options>['defaultView'];

type CalendarExternalEventNames = Extract<keyof ExternalEventTypes, string>;
type ReactCalendarEventNames = `on${Capitalize<CalendarExternalEventNames>}`;
type ReactCalendarEventHandler = ExternalEventTypes[CalendarExternalEventNames];
type ReactCalendarExternalEvents = {
  [events in ReactCalendarEventNames]: ReactCalendarEventHandler;
};

type Props = ReactCalendarOptions & {
  height: string;
  events?: Partial<EventObject>[];
  view?: CalendarView;
} & ReactCalendarExternalEvents;

const optionsProps: (keyof ReactCalendarOptions)[] = [
  'useFormPopup',
  'useDetailPopup',
  'isReadOnly',
  'week',
  'month',
  'gridSelection',
  'usageStatistics',
  'eventFilter',
  'timezone',
  'template',
];

const reactCalendarEventNames: ReactCalendarEventNames[] = [
  'onSelectDateTime',
  'onBeforeCreateEvent',
  'onBeforeUpdateEvent',
  'onBeforeDeleteEvent',
  'onAfterRenderEvent',
  'onClickDayName',
  'onClickEvent',
  'onClickMoreEventsBtn',
  'onClickTimezonesCollapseBtn',
];

export default class ToastUIReactCalendar extends React.Component<Props> {
  containerElementRef = React.createRef<HTMLDivElement>();

  calendarInstance: ToastUICalendar | null = null;

  static defaultProps = {
    height: '800px',
    view: 'week',
  };

  componentDidMount() {
    const { height, events = [], view, ...options } = this.props;
    const container = this.containerElementRef.current;

    if (container) {
      this.calendarInstance = new ToastUICalendar(container, { ...options, defaultView: view });

      container.style.height = height;
    }

    this.setEvents(events);
    this.bindEventHandlers(options);
  }

  shouldComponentUpdate(nextProps: Readonly<Props>) {
    const { calendars, height, events, theme, view } = this.props;
    const {
      calendars: nextCalendars,
      height: nextHeight,
      events: nextEvents,
      theme: nextTheme = {},
      view: nextView = 'week',
    } = nextProps;

    if (!isEqual(height, nextHeight) && this.containerElementRef.current) {
      this.containerElementRef.current.style.height = nextHeight;
    }

    if (!isEqual(calendars, nextCalendars)) {
      this.setCalendars(nextCalendars);
    }

    if (!isEqual(events, nextEvents)) {
      this.calendarInstance?.clear();
      this.setEvents(nextEvents);
    }

    if (!isEqual(theme, nextTheme)) {
      this.calendarInstance?.setTheme(nextTheme);
    }

    if (!isEqual(view, nextView)) {
      this.calendarInstance?.changeView(nextView);
    }

    const nextOptions = optionsProps.reduce((acc, key) => {
      if (!isEqual(this.props[key], nextProps[key])) {
        acc[key] = nextProps[key];
      }

      return acc;
    }, {} as Record<keyof Options, any>);

    this.calendarInstance?.setOptions(nextOptions);

    this.bindEventHandlers(nextProps);

    return false;
  }

  componentWillUnmount() {
    this.calendarInstance?.destroy();
  }

  setCalendars(calendars?: Options['calendars']) {
    if (calendars) {
      this.calendarInstance?.setCalendars(calendars);
    }
  }

  setEvents(events?: Partial<EventObject>[]) {
    if (events) {
      this.calendarInstance?.createEvents(events);
    }
  }

  bindEventHandlers(externalEvents: ReactCalendarExternalEvents) {
    const eventNames = Object.keys(externalEvents).filter((key) =>
      reactCalendarEventNames.includes(key as ReactCalendarEventNames)
    );

    eventNames.forEach((key) => {
      const eventName = key[2].toLowerCase() + key.slice(3);
      const originalHandler = externalEvents[key as ReactCalendarEventNames] as any;

      if (this.calendarInstance) {
        this.calendarInstance.off(eventName);
        // NOTE:
        // - TUI Calendar의 before* 이벤트는 기본 동작(생성/수정/삭제)을 자동으로 수행하지 않는다.
        // - 앱(호스트)에서 DB/서버에 저장을 비동기 처리하는 경우가 많으므로,
        //   포크에서는 handler 완료 후(throw 없이) 기본 동작을 자동 적용하는 래퍼를 제공한다.
        // - 반복 이벤트(series) 편집/삭제는 앱마다 전략이 달라서 자동 적용을 건너뛴다.
        this.calendarInstance.on(eventName, async (...args: any[]) => {
          try {
            const result = originalHandler?.(...args);
            if (result && typeof (result as Promise<any>).then === 'function') {
              await result;
            }

            if (!this.calendarInstance) return;

            if (eventName === 'beforeCreateEvent') {
              const eventObj = args[0] as any;
              // handler가 eventObj.id를 세팅한 경우를 포함해 그대로 사용
              // 이미 존재하면 중복 생성 방지
              if (eventObj?.id && eventObj?.calendarId) {
                const existing = this.calendarInstance.getEvent(eventObj.id, eventObj.calendarId);
                if (!existing) {
                  this.calendarInstance.createEvents([eventObj]);
                }
              } else if (eventObj) {
                this.calendarInstance.createEvents([eventObj]);
              }
            }

            if (eventName === 'beforeUpdateEvent') {
              const info = args[0] as any;
              const eventObj = info?.event;
              const changes = info?.changes;
              const recurrenceActionOption = eventObj?.recurrenceActionOption;
              const isRecurring = !!eventObj?.recurrenceRule?.recurrenceId;

              // series 편집은 호스트가 처리 (this/thisAndFuture/all)
              if (!isRecurring && !recurrenceActionOption && eventObj?.id && eventObj?.calendarId) {
                // changes와 eventObj를 합쳐서 완전한 업데이트 데이터 생성
                const mergedChanges = {
                  ...eventObj,
                  ...changes,
                  // changes에 명시적으로 포함된 속성 우선
                  start: changes?.start ?? eventObj?.start,
                  end: changes?.end ?? eventObj?.end,
                  title: changes?.title ?? eventObj?.title,
                  isAllday: changes?.isAllday ?? eventObj?.isAllday,
                  location: changes?.location ?? eventObj?.location,
                  body: changes?.body ?? eventObj?.body,
                  color: changes?.color ?? eventObj?.color,
                  backgroundColor: changes?.backgroundColor ?? eventObj?.backgroundColor,
                  borderColor: changes?.borderColor ?? eventObj?.borderColor,
                };
                this.calendarInstance.updateEvent(eventObj.id, eventObj.calendarId, mergedChanges);
              }
            }

            if (eventName === 'beforeDeleteEvent') {
              const eventObj = args[0] as any;
              const recurrenceActionOption = eventObj?.recurrenceActionOption;
              const isRecurring = !!eventObj?.recurrenceRule?.recurrenceId;

              // series 삭제는 호스트가 처리
              if (!isRecurring && !recurrenceActionOption && eventObj?.id && eventObj?.calendarId) {
                this.calendarInstance.deleteEvent(eventObj.id, eventObj.calendarId);
              }
            }
          } catch (e) {
            // handler가 실패하면 UI에 기본 동작을 적용하지 않음
            // (호스트가 토스트/모달 등으로 에러 UX 제공 가능)
            // eslint-disable-next-line no-console
            console.error(`[toast-ui/react-calendar] ${eventName} handler failed`, e);
          }
        });
      }
    });
  }

  getInstance() {
    return this.calendarInstance;
  }

  getRootElement() {
    return this.containerElementRef.current;
  }

  render() {
    return <div className="container" ref={this.containerElementRef} />;
  }
}
