import {
  Alert,
  Card,
  Grid,
  Group,
  Loader,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { AreaChart } from '@mantine/charts';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { useGetDashboardStatsQuery } from '../app/parfumApi';

export function DashboardPage() {
  const [range, setRange] = useState<[Date | null, Date | null]>([
    dayjs().subtract(13, 'day').toDate(),
    dayjs().toDate(),
  ]);

  const from = range[0] ? dayjs(range[0]).format('YYYY-MM-DD') : '';
  const to = range[1] ? dayjs(range[1]).format('YYYY-MM-DD') : '';

  const { data, isLoading, isFetching, error } = useGetDashboardStatsQuery(
    { from, to },
    { skip: !from || !to },
  );

  const chartData = useMemo(() => {
    if (!data?.series) return [];
    return data.series.map((row) => ({
      ...row,
      label: dayjs(row.date).format('MMM D'),
    }));
  }, [data?.series]);

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-end" wrap="wrap">
        <div>
          <Title order={2}>Dashboard</Title>
          <Text size="sm" c="dimmed">
            Orders and new users per day (UTC) for the selected range.
          </Text>
        </div>
        <DatePickerInput
          type="range"
          label="Date range"
          placeholder="Pick dates"
          value={range}
          onChange={setRange}
          maxDate={new Date()}
          w={{ base: '100%', sm: 320 }}
        />
      </Group>

      {error ? (
        <Alert color="red" title="Could not load stats">
          Check that the API is running and CORS allows this origin.
        </Alert>
      ) : null}

      <Grid>
        <Grid.Col span={{ base: 12, sm: 4 }}>
          <Card withBorder padding="lg" radius="md">
            <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
              Orders in range
            </Text>
            <Group gap="xs" mt={4} align="center">
              {isLoading ? <Loader size="sm" /> : null}
              <Title order={3}>{data?.totals.ordersInRange ?? '—'}</Title>
            </Group>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 4 }}>
          <Card withBorder padding="lg" radius="md">
            <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
              New users in range
            </Text>
            <Group gap="xs" mt={4} align="center">
              {isLoading ? <Loader size="sm" /> : null}
              <Title order={3}>{data?.totals.newUsersInRange ?? '—'}</Title>
            </Group>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 4 }}>
          <Card withBorder padding="lg" radius="md">
            <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
              Products (catalog)
            </Text>
            <Group gap="xs" mt={4} align="center">
              {isLoading ? <Loader size="sm" /> : null}
              <Title order={3}>{data?.totals.productCount ?? '—'}</Title>
            </Group>
            <Text size="xs" c="dimmed" mt={4}>
              Total catalog size (not filtered by date).
            </Text>
          </Card>
        </Grid.Col>
      </Grid>

      <Card withBorder padding="lg" radius="md">
        <Text size="sm" fw={600} mb="md">
          Activity
          {isFetching && !isLoading ? (
            <Text span size="xs" c="dimmed" ml="xs">
              Updating…
            </Text>
          ) : null}
        </Text>
        {chartData.length === 0 && isLoading ? (
          <Loader />
        ) : (
          <AreaChart
            h={280}
            data={chartData}
            dataKey="label"
            series={[
              { name: 'orders', color: 'parfum.6' },
              { name: 'newUsers', color: 'teal.7' },
            ]}
            curveType="monotone"
            withLegend
            withDots={false}
          />
        )}
      </Card>
    </Stack>
  );
}
