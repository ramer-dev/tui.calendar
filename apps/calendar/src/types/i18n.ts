/**
 * 다국어 지원을 위한 언어 타입 정의
 */

export type Locale = 'en' | 'ko' | string;

export interface I18nStrings {
    // Milestone & Task
    milestone: string;
    milestoneTitle: string;
    task: string;
    taskTitle: string;
    alldayTitle: string;

    // Duration
    goingDuration: string;
    comingDuration: string;

    // Grid
    monthGridHeaderExceed: string;
    weekGridFooterExceed: string;

    // Popup
    popupIsAllday: string;
    popupStateFree: string;
    popupStateBusy: string;
    popupSave: string;
    popupUpdate: string;
    popupEdit: string;
    popupDelete: string;

    // Placeholders
    titlePlaceholder: string;
    locationPlaceholder: string;
    recurrencePlaceholder: string;
    startDatePlaceholder: string;
    endDatePlaceholder: string;
}

export type I18nConfig = {
    locale?: Locale;
    strings?: Partial<I18nStrings>;
};
