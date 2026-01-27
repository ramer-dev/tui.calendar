import { h } from 'preact';
import type { ChangeEventHandler } from 'preact/compat';

import { PopupSection } from '@src/components/popup/popupSection';
import { cls } from '@src/helpers/css';
import type { FormStateDispatcher } from '@src/hooks/popup/useFormState';
import { FormStateActionType } from '@src/hooks/popup/useFormState';
import { useStringOnlyTemplate } from '@src/hooks/template/useStringOnlyTemplate';

interface Props {
  recurrence?: string;
  formStateDispatch: FormStateDispatcher;
}

const classNames = {
  popupSectionItem: cls('popup-section-item', 'popup-section-location'),
  locationIcon: cls('icon', 'ic-location'),
  content: cls('content'),
};

export function recurrenceInputBox({ recurrence, formStateDispatch }: Props) {
  const locationPlaceholder = useStringOnlyTemplate({
    template: 'locationPlaceholder',
    defaultValue: 'Location',
  });

  const handleRecurrenceChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    formStateDispatch({ type: FormStateActionType.setLocation, recurrence: e.currentTarget.value });
  };

  return (
    <PopupSection>
      <div className={classNames.popupSectionItem}>
        <span className={classNames.locationIcon} />
        <input
          name="recurrence"
          className={classNames.content}
          placeholder={locationPlaceholder}
          value={recurrence}
          onChange={handleLocationChange}
        />
      </div>
    </PopupSection>
  );
}
