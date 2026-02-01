import type { I18nConfig, I18nStrings, Locale } from '@t/i18n';

import { en } from './locales/en';
import { ko } from './locales/ko';

/**
 * 지원되는 언어 목록
 */
const locales: Record<string, I18nStrings> = {
    en,
    ko,
};

/**
 * 기본 언어 (한국어어)
 */
const DEFAULT_LOCALE: Locale = 'ko';

/**
 * 언어 문자열을 가져옵니다.
 * @param locale - 언어 코드
 * @param customStrings - 사용자 정의 문자열 (선택적)
 * @returns 언어 문자열 객체
 */
export function getI18nStrings(
    locale: Locale = DEFAULT_LOCALE,
    customStrings?: Partial<I18nStrings>
): I18nStrings {
    const baseStrings = locales[locale] || locales[DEFAULT_LOCALE];

    return {
        ...baseStrings,
        ...customStrings,
    };
}

/**
 * i18n 설정에서 언어 문자열을 가져옵니다.
 * @param config - i18n 설정
 * @returns 언어 문자열 객체
 */
export function getI18nStringsFromConfig(config?: I18nConfig): I18nStrings {
    const locale = config?.locale || DEFAULT_LOCALE;
    const customStrings = config?.strings;

    return getI18nStrings(locale, customStrings);
}

/**
 * 지원되는 언어 목록을 반환합니다.
 * @returns 지원되는 언어 코드 배열
 */
export function getSupportedLocales(): string[] {
    return Object.keys(locales);
}
