import { h } from 'preact';

import type { Meta, StoryObj } from '@storybook/preact-vite';

import { OtherGridRow } from '@src/components/dayGridWeek/otherGridRow';
import { Layout } from '@src/components/layout';
import { Panel } from '@src/components/panel';
import { createEventCollection } from '@src/controller/base';
import { getWeekDates, getWeekViewEvents } from '@src/helpers/grid';
import TZDate from '@src/time/date';
import { Day, getRowStyleInfo } from '@src/time/datetime';
import { first, last } from '@src/utils/array';

import { ProviderWrapper } from '@stories/util/providerWrapper';
import { createRandomEventModelsForMonth } from '@stories/util/randomEvents';

import type { CalendarData } from '@t/events';

const meta: Meta<typeof OtherGridRow> = {
  title: 'Components/WeekGridRow',
  component: OtherGridRow,
  args: { primary: true },
};

export default meta;
type Story = StoryObj<typeof OtherGridRow>;

const events = createRandomEventModelsForMonth(40);

const weekDates = getWeekDates(new TZDate(), { startDayOfWeek: Day.SUN, workweek: false });
const calendarData: CalendarData = {
  calendars: [],
  events: createEventCollection(...events),
  idsOfDay: {},
};
const dayGridEvents = getWeekViewEvents(weekDates, calendarData, {
  narrowWeekend: false,
  weekStartDate: first(weekDates),
  weekEndDate: last(weekDates),
});

const Template = (args: any) => {
  const { cellWidthMap } = getRowStyleInfo(weekDates.length, true, 0, true);

  return (
    <ProviderWrapper options={args.options} events={events}>
      <Layout height={500}>
        <Panel name="milestone" resizable minHeight={20} maxHeight={args.maxHeight}>
          <OtherGridRow
            weekDates={weekDates}
            events={dayGridEvents.milestone}
            category="milestone"
            options={{ narrowWeekend: false }}
            gridColWidthMap={cellWidthMap}
          />
        </Panel>
      </Layout>
    </ProviderWrapper>
  );
};

export const milestone: Story = {
  render: Template,
  name: 'random events milestone',
};
