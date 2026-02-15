import { useReducer } from 'preact/hooks';

import type { EventObject, EventState } from '@t/events';
import { RecurrenceRule } from '@src/types/repeat';

export enum FormStateActionType {
  init = 'init',
  setCalendarId = 'setCalendarId',
  setTitle = 'setTitle',
  setLocation = 'setLocation',
  setPrivate = 'setPrivate',
  setAllday = 'setAllday',
  setState = 'setState',
  setRecurrenceRule = 'setRecurrenceRule',
  setRepeat = 'setRepeat',
  reset = 'reset',
}

type FormStateAction =
  | { type: FormStateActionType.init; event: EventObject }
  | { type: FormStateActionType.setCalendarId; calendarId: string }
  | { type: FormStateActionType.setTitle; title: string }
  | { type: FormStateActionType.setLocation; location: string }
  | { type: FormStateActionType.setPrivate; isPrivate: boolean }
  | { type: FormStateActionType.setAllday; isAllday: boolean }
  | { type: FormStateActionType.setState; state: EventState }
  | { type: FormStateActionType.setRecurrenceRule; recurrenceRule?: RecurrenceRule }
  | { type: FormStateActionType.setRepeat; isRepeat: boolean }
  | { type: FormStateActionType.reset };

export type FormStateDispatcher = (action: FormStateAction) => void;

const defaultFormState: EventObject = {
  title: '',
  location: '',
  isAllday: false,
  isPrivate: false,
  isRepeat: false,
  recurrenceRule: undefined,
  state: 'Busy',
};

// eslint-disable-next-line complexity
function formStateReducer(state: EventObject, action: FormStateAction): EventObject {
  switch (action.type) {
    case FormStateActionType.init:
      return { ...defaultFormState, ...action.event };
    case FormStateActionType.setCalendarId:
      return { ...state, calendarId: action.calendarId };
    case FormStateActionType.setTitle:
      return { ...state, title: action.title };
    case FormStateActionType.setLocation:
      return { ...state, location: action.location };
    case FormStateActionType.setPrivate:
      return { ...state, isPrivate: action.isPrivate };
    case FormStateActionType.setAllday:
      return { ...state, isAllday: action.isAllday };
    case FormStateActionType.setState:
      return { ...state, state: action.state };
    case FormStateActionType.setRecurrenceRule:
      return { ...state, recurrenceRule: action.recurrenceRule };
    case FormStateActionType.setRepeat:
      return { ...state, isRepeat: action.isRepeat };
    case FormStateActionType.reset:
      return { ...state, ...defaultFormState };

    default:
      return state;
  }
}

export function useFormState(initCalendarId?: string) {
  return useReducer(formStateReducer, { calendarId: initCalendarId, ...defaultFormState });
}
