import { h } from 'preact';

import type { Meta, StoryObj } from '@storybook/preact';

import { Month } from '@src/components/view/month';

import { ProviderWrapper } from '@stories/util/providerWrapper';
import { createRandomEventModelsForMonth } from '@stories/util/randomEvents';

const meta: Meta<typeof Month> = {
  title: 'Views/MonthView',
  component: Month,
};

export default meta;
type Story = StoryObj<typeof Month>;

const Template = (args: any) => (
  <ProviderWrapper options={args.options} events={args.events}>
    <Month />
  </ProviderWrapper>
);

export const basic: Story = {
  render: Template,
};

export const narrowWeekend: Story = {
  render: Template,
  args: {
    options: { month: { narrowWeekend: true } },
  },
};

export const startDayOfWeek: Story = {
  render: Template,
  args: {
    options: { month: { startDayOfWeek: 3 } },
  },
};

export const dayNames: Story = {
  render: Template,
  args: {
    options: {
      month: {
        dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      },
    },
  },
};

export const workweek: Story = {
  render: Template,
  args: {
    options: { month: { workweek: true } },
  },
};

export const twoWeeks: Story = {
  render: Template,
  args: {
    options: { month: { visibleWeeksCount: 2 } },
  },
};

export const randomEvents: Story = {
  render: Template,
  args: {
    options: { month: { narrowWeekend: true } },
    events: createRandomEventModelsForMonth(40),
  },
};
