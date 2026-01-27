import { h } from 'preact';

import type { Meta, StoryObj } from '@storybook/preact';

import { Day } from '@src/components/view/day';
import EventModel from '@src/model/eventModel';
import TZDate from '@src/time/date';
import { addDate } from '@src/time/datetime';

import { ProviderWrapper } from '@stories/util/providerWrapper';
import { createRandomEventModelsForMonth, createRandomEvents } from '@stories/util/randomEvents';

const meta: Meta<typeof Day> = {
  title: 'Views/DayView',
  component: Day,
};

export default meta;
type Story = StoryObj<typeof Day>;

function createTimeGridEvents() {
  const today = new TZDate();
  const start = addDate(new TZDate(), -today.getDay());
  const end = addDate(start, 6);

  return createRandomEvents('week', start, end).map((event) => new EventModel(event));
}

const Template = (args: any) => (
  <ProviderWrapper options={args.options} events={args.events}>
    <Day />
  </ProviderWrapper>
);

export const basic: Story = {
  render: Template,
};

export const randomEvents: Story = {
  render: Template,
  args: {
    events: [...createRandomEventModelsForMonth(40), ...createTimeGridEvents()],
    options: { useFormPopup: true, useDetailPopup: true },
  },
};
