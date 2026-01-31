import { h } from 'preact';

import type { Meta, StoryObj } from '@storybook/preact';

import { Week } from '@src/components/view/week';
import EventModel from '@src/model/eventModel';
import TZDate from '@src/time/date';
import { addDate, Day } from '@src/time/datetime';

import { ProviderWrapper } from '@stories/util/providerWrapper';
import { createRandomEventModelsForMonth, createRandomEvents } from '@stories/util/randomEvents';

const meta: Meta<typeof Week> = {
  title: 'Views/WeekView',
  component: Week,
};

export default meta;
type Story = StoryObj<typeof Week>;

function createTimeGridEvents() {
  const today = new TZDate();
  const start = addDate(new TZDate(), -today.getDay());
  const end = addDate(start, 6);

  return createRandomEvents('week', start, end).map((event) => new EventModel(event));
}

const Template = (args: any) => (
  <ProviderWrapper options={args.options} events={args.events}>
    <Week />
  </ProviderWrapper>
);

export const basic: Story = {
  render: Template,
};

export const MondayStart: Story = {
  render: Template,
  args: {
    options: {
      week: {
        startDayOfWeek: Day.MON,
      },
    },
  },
};

export const WorkWeek: Story = {
  render: Template,
  args: {
    options: {
      week: {
        workweek: true,
      },
    },
  },
};

export const RandomEvents: Story = {
  render: Template,
  args: {
    events: [...createRandomEventModelsForMonth(40), ...createTimeGridEvents()],
  },
};
