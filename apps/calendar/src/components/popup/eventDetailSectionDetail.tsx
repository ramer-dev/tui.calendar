import { h } from 'preact';

import { Template } from '@src/components/template';
import { cls } from '@src/helpers/css';
import { useCalendarById } from '@src/hooks/calendar/useCalendarById';
import type EventModel from '@src/model/eventModel';

interface Props {
  event: EventModel;
}

const classNames = {
  detailItem: cls('detail-item'),
  detailItemIndent: cls('detail-item', 'detail-item-indent'),
  detailItemSeparate: cls('detail-item', 'detail-item-separate'),
  sectionDetail: cls('popup-section', 'section-detail'),
  content: cls('content'),
  locationIcon: cls('icon', 'ic-location-b'),
  repeatIcon: cls('icon', 'ic-repeat-b'),
  userIcon: cls('icon', 'ic-user-b'),
  stateIcon: cls('icon', 'ic-state-b'),
  alarmIcon: cls('icon', 'ic-alarm-b'),
  calendarDotIcon: cls('icon', 'calendar-dot'),
};

// Momento 확장 — event.raw.reminder를 사람이 읽을 문구로 바꾼다 (알림이 꺼져 있으면 null)
function getReminderLabel(raw: unknown): string | null {
  const reminder = (
    raw as { reminder?: { reminderEnabled?: boolean; reminderValue?: number; reminderUnit?: string } } | null
  )?.reminder;

  if (!reminder?.reminderEnabled) {
    return null;
  }

  const value = reminder.reminderValue;
  const unit = reminder.reminderUnit;
  if (typeof value !== 'number' || !unit) {
    return null;
  }

  return value > 0 ? `${value}${unit} 전 알림` : '일정 시작 시 알림';
}

// eslint-disable-next-line complexity
export function EventDetailSectionDetail({ event }: Props) {
  const { location, recurrenceRule, attendees, state, calendarId, body, raw } = event;
  const calendar = useCalendarById(calendarId);
  const reminderLabel = getReminderLabel(raw);

  return (
    <div className={classNames.sectionDetail}>
      {location && (
        <div className={classNames.detailItem}>
          <span className={classNames.locationIcon} />
          <span className={classNames.content}>
            <Template template="popupDetailLocation" param={event} as="span" />
          </span>
        </div>
      )}
      {recurrenceRule && (
        <div className={classNames.detailItem}>
          <span className={classNames.repeatIcon} />
          <span className={classNames.content}>
            <Template template="popupDetailRecurrenceRule" param={event} as="span" />
          </span>
        </div>
      )}
      {reminderLabel && (
        <div className={classNames.detailItem}>
          <span className={classNames.alarmIcon} />
          <span className={classNames.content}>{reminderLabel}</span>
        </div>
      )}
      {/* {attendees && (
        <div className={classNames.detailItemIndent}>
          <span className={classNames.userIcon} />
          <span className={classNames.content}>
            <Template template="popupDetailAttendees" param={event} as="span" />
          </span>
        </div>
      )} */}
      {state && (
        <div className={classNames.detailItem}>
          <span className={classNames.stateIcon} />
          <span className={classNames.content}>
            <Template template="popupDetailState" param={event} as="span" />
          </span>
        </div>
      )}
      {calendar && (
        <div className={classNames.detailItem}>
          <span
            className={classNames.calendarDotIcon}
            style={{
              backgroundColor: calendar?.backgroundColor ?? '',
            }}
          />
          <span className={classNames.content}>{calendar?.name ?? ''}</span>
        </div>
      )}
      {body && (
        <div className={classNames.detailItemSeparate}>
          <span className={classNames.content}>
            <Template template="popupDetailBody" param={event} as="span" />
          </span>
        </div>
      )}
    </div>
  );
}
