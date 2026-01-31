import { Fragment, h } from 'preact';

import type { Meta, StoryObj } from '@storybook/preact';

import { EventFormPopup } from '@src/components/popup/eventFormPopup';
import { useDispatch } from '@src/contexts/calendarStore';
import TZDate from '@src/time/date';

import { calendars as mockCalendars } from '@stories/util/mockCalendars';
import { ProviderWrapper } from '@stories/util/providerWrapper';

import type { PropsWithChildren } from '@t/components/common';
import type { CalendarInfo } from '@t/options';
import type { EventFormPopupParam } from '@t/store';

const meta: Meta<typeof EventFormPopup> = {
  component: EventFormPopup,
  title: 'Popups/EventFormPopup',
};

export default meta;
type Story = StoryObj<typeof EventFormPopup>;

interface EventFormPopupStoryProps extends EventFormPopupParam {
  calendars?: CalendarInfo[];
}

function Wrapper({
  children,
  title,
  location,
  start,
  end,
  isAllday,
  isPrivate,
  isCreationPopup,
}: PropsWithChildren<EventFormPopupParam>) {
  const { showFormPopup } = useDispatch('popup');
  showFormPopup({
    isCreationPopup,
    title,
    location,
    start,
    end,
    isAllday,
    isPrivate,
  });

  return <Fragment>{children}</Fragment>;
}

const Template = ({
  calendars,
  title,
  location,
  start,
  end,
  isAllday = false,
  isPrivate = false,
}: EventFormPopupStoryProps) => (
  <ProviderWrapper options={{ calendars }}>
    <Wrapper
      title={title}
      location={location}
      start={start}
      end={end}
      isAllday={isAllday}
      isPrivate={isPrivate}
      isCreationPopup={true}
    >
      <EventFormPopup />
    </Wrapper>
  </ProviderWrapper>
);

export const EventFormPopupWithCalendars: Story = {
  render: Template,
  args: {
    start: new TZDate(),
    end: new TZDate(),
    calendars: mockCalendars,
  },
};

export const EventFormPopupWithoutCalendars: Story = {
  render: Template,
  args: {
    start: new TZDate(),
    end: new TZDate(),
  },
};
