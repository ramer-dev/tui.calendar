import type { DeepPartial } from 'ts-essentials';

import { DEFAULT_MONTH_THEME } from '@src/constants/theme';
import { clonePlainObject, mergeObject } from '@src/utils/object';

import type { MonthTheme, ThemeState } from '@t/theme';

export function createMonthTheme(monthTheme: DeepPartial<MonthTheme> = {}): {
  month: Required<ThemeState>['month'];
} {
  return {
    month: mergeObject(clonePlainObject(DEFAULT_MONTH_THEME), monthTheme),
  };
}
