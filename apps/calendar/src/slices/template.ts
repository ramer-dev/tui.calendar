import produce from 'immer';

import { getI18nStringsFromConfig } from '@src/i18n';
import { createTemplates } from '@src/template/default';

import type { CalendarState, CalendarStore, SetState } from '@t/store';
import type { I18nConfig } from '@t/i18n';
import type { Template, TemplateConfig } from '@t/template';

export type TemplateSlice = { template: Template };

export type TemplateDispatchers = {
    setTemplate: (template: TemplateConfig) => void;
};

export function createTemplateSlice(
    templateConfig: TemplateConfig = {},
    i18nConfig?: I18nConfig
): TemplateSlice {
    // i18n 설정에서 언어 문자열 가져오기
    const i18nStrings = i18nConfig ? getI18nStringsFromConfig(i18nConfig) : undefined;

    // i18n 문자열을 사용하여 템플릿 생성
    const baseTemplates = createTemplates(i18nStrings);

    return {
        template: {
            ...baseTemplates,
            ...templateConfig,
        },
    };
}

export function createTemplateDispatchers(set: SetState<CalendarStore>): TemplateDispatchers {
    return {
        setTemplate: (template: TemplateConfig) =>
            set(
                produce<CalendarState>((state) => {
                    state.template = {
                        ...state.template,
                        ...template,
                    };
                })
            ),
    };
}
