import { h } from 'preact';

import type { Meta, StoryObj } from '@storybook/preact';

import { GridHeader } from '@src/components/dayGridCommon/gridHeader';
import { getRowStyleInfo } from '@src/time/datetime';

import { ProviderWrapper } from '@stories/util/providerWrapper';

import type { TemplateMonthDayName } from '@t/template';

const meta: Meta<typeof GridHeader> = {
  title: 'Components/GridHeader',
  component: GridHeader,
};

export default meta;
type Story = StoryObj<typeof GridHeader>;

interface DayNamesStory {
  dayNames: TemplateMonthDayName[];
  marginLeft?: string;
}

const Template = ({ dayNames, marginLeft }: DayNamesStory) => {
  const { rowStyleInfo } = getRowStyleInfo(dayNames.length, true, 0, true);

  return (
    <ProviderWrapper>
      <GridHeader
        type="month"
        dayNames={dayNames}
        marginLeft={marginLeft}
        rowStyleInfo={rowStyleInfo}
      />
    </ProviderWrapper>
  );
};

const oneDayName = [
  {
    label: 'Mon',
    day: 1,
  },
];

const threeDayNames = [
  {
    label: 'Mon',
    day: 1,
  },
  {
    label: 'Wed',
    day: 3,
  },
  {
    label: 'Fri',
    day: 5,
  },
];

export const oneDay: Story = {
  render: Template,
  args: {
    dayNames: oneDayName,
  },
};

export const threeDays: Story = {
  render: Template,
  args: {
    dayNames: threeDayNames,
  },
};

export const oneDayWithMargin: Story = {
  render: Template,
  args: {
    dayNames: oneDayName,
    marginLeft: '60px',
  },
};

export const threeDaysWithMargin: Story = {
  render: Template,
  args: {
    dayNames: threeDayNames,
    marginLeft: '60px',
  },
};
