import { Fragment, h } from 'preact';

import { cls } from '@src/helpers/css';
import { getDayName } from '@src/helpers/dayName';
import { isSameDate, leadingZero, toFormat } from '@src/time/datetime';
import { stripTags } from '@src/utils/dom';
import { capitalize } from '@src/utils/string';
import { isNil, isPresent } from '@src/utils/type';

import type { EventObjectWithDefaultValues } from '@t/events';
import type { I18nStrings } from '@t/i18n';
import type {
    Template,
    TemplateMonthDayName,
    TemplateMonthGrid,
    TemplateMoreTitleDate,
    TemplateNow,
    TemplateTimezone,
    TemplateWeekDayName,
} from '@t/template';

import { getI18nStrings } from '@src/i18n';

const SIXTY_MINUTES = 60;

/**
 * 템플릿을 생성하는 함수
 * @param i18nStrings - 다국어 문자열 객체 (선택적)
 * @returns Template 객체
 */
export function createTemplates(i18nStrings?: I18nStrings): Template {
    // i18n 문자열이 제공되지 않으면 기본값(영어) 사용
    const t = i18nStrings || getI18nStrings('en');

    return {
        milestone(model: EventObjectWithDefaultValues) {
            const classNames = cls('icon', 'ic-milestone');

            return (
                <Fragment>
                    <span className={classNames} />
                    <span
                        style={{
                            backgroundColor: model.backgroundColor,
                        }}
                    >
                        {stripTags(model.title)}
                    </span>
                </Fragment>
            );
        },

        milestoneTitle() {
            return <span className={cls('left-content')}>{t.milestoneTitle}</span>;
        },

        task(model: EventObjectWithDefaultValues) {
            return `#${model.title}`;
        },

        taskTitle() {
            return <span className={cls('left-content')}>{t.taskTitle}</span>;
        },

        alldayTitle() {
            return <span className={cls('left-content')}>{t.alldayTitle}</span>;
        },

        allday(model: EventObjectWithDefaultValues) {
            return stripTags(model.title);
        },

        time(model: EventObjectWithDefaultValues) {
            const { start, title } = model;

            if (start) {
                return (
                    <span>
                        <strong>{toFormat(start, 'HH:mm')}</strong>&nbsp;<span>{stripTags(title)}</span>
                    </span>
                );
            }

            return stripTags(title);
        },

        goingDuration(model: EventObjectWithDefaultValues) {
            const { goingDuration } = model;
            const hour = Math.floor(goingDuration / SIXTY_MINUTES);
            const minutes = goingDuration % SIXTY_MINUTES;

            return `${t.goingDuration} ${leadingZero(hour, 2)}:${leadingZero(minutes, 2)}`;
        },

        comingDuration(model: EventObjectWithDefaultValues) {
            const { comingDuration } = model;
            const hour = Math.floor(comingDuration / SIXTY_MINUTES);
            const minutes = comingDuration % SIXTY_MINUTES;

            return `${t.comingDuration} ${leadingZero(hour, 2)}:${leadingZero(minutes, 2)}`;
        },

        monthMoreTitleDate(moreTitle: TemplateMoreTitleDate) {
            const { date, day } = moreTitle;

            const classNameDay = cls('more-title-date');
            const classNameDayLabel = cls('more-title-day');
            const dayName = capitalize(getDayName(day));

            return (
                <Fragment>
                    <span className={classNameDay}>{date}</span>
                    <span className={classNameDayLabel}>{dayName}</span>
                </Fragment>
            );
        },

        monthMoreClose() {
            return '';
        },

        monthGridHeader(model: TemplateMonthGrid) {
            const date = parseInt(model.date.split('-')[2], 10);
            const classNames = cls('weekday-grid-date', { 'weekday-grid-date-decorator': model.isToday });

            return <span className={classNames}>{date}</span>;
        },

        monthGridHeaderExceed(hiddenEvents: number) {
            const className = cls('weekday-grid-more-events');

            return <span className={className}>{hiddenEvents} {t.monthGridHeaderExceed}</span>;
        },

        monthGridFooter(_model: TemplateMonthGrid) {
            return '';
        },

        monthGridFooterExceed(_hiddenEvents: number) {
            return '';
        },

        monthDayName(model: TemplateMonthDayName) {
            return model.label;
        },

        weekDayName(model: TemplateWeekDayName) {
            const classDate = cls('day-name__date');
            const className = cls('day-name__name');

            return (
                <Fragment>
                    <span className={classDate}>{model.date}</span>&nbsp;&nbsp;
                    <span className={className}>{model.dayName}</span>
                </Fragment>
            );
        },

        weekGridFooterExceed(hiddenEvents: number) {
            return `+${hiddenEvents}`;
        },

        collapseBtnTitle() {
            const className = cls('collapse-btn-icon');

            return <span className={className} />;
        },

        timezoneDisplayLabel({ displayLabel, timezoneOffset }: TemplateTimezone) {
            if (isNil(displayLabel) && isPresent(timezoneOffset)) {
                const sign = timezoneOffset < 0 ? '-' : '+';
                const hours = Math.abs(timezoneOffset / SIXTY_MINUTES);
                const minutes = Math.abs(timezoneOffset % SIXTY_MINUTES);

                return `GMT${sign}${leadingZero(hours, 2)}:${leadingZero(minutes, 2)}`;
            }

            return displayLabel as string;
        },

        timegridDisplayPrimaryTime(props: TemplateNow) {
            const { time } = props;

            return toFormat(time, 'hh tt');
        },

        timegridDisplayTime(props: TemplateNow) {
            const { time } = props;

            return toFormat(time, 'HH:mm');
        },

        timegridNowIndicatorLabel(timezone: TemplateNow) {
            const { time, format = 'HH:mm' } = timezone;

            return toFormat(time, format);
        },

        popupIsAllday() {
            return t.popupIsAllday;
        },

        popupStateFree() {
            return t.popupStateFree;
        },

        popupStateBusy() {
            return t.popupStateBusy;
        },

        titlePlaceholder() {
            return t.titlePlaceholder;
        },

        locationPlaceholder() {
            return t.locationPlaceholder;
        },

        recurrencePlaceholder() {
            return t.recurrencePlaceholder;
        },

        startDatePlaceholder() {
            return t.startDatePlaceholder;
        },

        endDatePlaceholder() {
            return t.endDatePlaceholder;
        },

        popupSave() {
            return t.popupSave;
        },

        popupUpdate() {
            return t.popupUpdate;
        },

        popupEdit() {
            return t.popupEdit;
        },

        popupDelete() {
            return t.popupDelete;
        },

        popupDetailTitle({ title }: EventObjectWithDefaultValues) {
            return title;
        },

        popupDetailDate({ isAllday, start, end }: EventObjectWithDefaultValues) {
            const dayFormat = 'YYYY.MM.DD';
            const timeFormat = 'hh:mm tt';
            const detailFormat = `${dayFormat} ${timeFormat}`;
            const startDate = toFormat(start, isAllday ? dayFormat : timeFormat);
            const endDateFormat = isSameDate(start, end) ? timeFormat : detailFormat;

            if (isAllday) {
                return `${startDate}${isSameDate(start, end) ? '' : ` - ${toFormat(end, dayFormat)}`}`;
            }

            return `${toFormat(start, detailFormat)} - ${toFormat(end, endDateFormat)}`;
        },

        popupDetailLocation({ location }: EventObjectWithDefaultValues) {
            return location;
        },

        popupDetailAttendees({ attendees = [] }: EventObjectWithDefaultValues) {
            return attendees.join(', ');
        },

        popupDetailState({ state }: EventObjectWithDefaultValues) {
            return state || t.popupStateBusy;
        },

        popupDetailRecurrenceRule({ recurrenceRule }: EventObjectWithDefaultValues) {
            return recurrenceRule;
        },

        popupDetailBody({ body }: EventObjectWithDefaultValues) {
            return body;
        },
    };
}

/**
 * 기본 템플릿 (영어, 하위 호환성을 위해 유지)
 */
export const templates = createTemplates();

export type TemplateName = keyof Template;
