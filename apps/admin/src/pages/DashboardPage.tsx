import { Card, Grid, Stack, Text, Title } from '@mantine/core';
import { AreaChart } from '@mantine/charts';

const ordersSeries = [
  { date: 'Mon', orders: 12 },
  { date: 'Tue', orders: 18 },
  { date: 'Wed', orders: 9 },
  { date: 'Thu', orders: 22 },
  { date: 'Fri', orders: 16 },
  { date: 'Sat', orders: 28 },
  { date: 'Sun', orders: 21 },
];

export function DashboardPage() {
  return (
    <Stack gap="lg">
      <div>
        <Title order={2}>Dashboard</Title>
        <Text size="sm" c="dimmed">
          KPIs and charts will use live API data with a date range filter.
        </Text>
      </div>

      <Grid>
        <Grid.Col span={{ base: 12, sm: 4 }}>
          <Card withBorder padding="lg" radius="md">
            <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
              Orders (demo)
            </Text>
            <Title order={3} mt={4}>
              126
            </Title>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 4 }}>
          <Card withBorder padding="lg" radius="md">
            <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
              New users (demo)
            </Text>
            <Title order={3} mt={4}>
              34
            </Title>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 4 }}>
          <Card withBorder padding="lg" radius="md">
            <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
              Products
            </Text>
            <Title order={3} mt={4}>
              48
            </Title>
          </Card>
        </Grid.Col>
      </Grid>

      <Card withBorder padding="lg" radius="md">
        <Text size="sm" fw={600} mb="md">
          Orders volume (sample)
        </Text>
        <AreaChart
          h={280}
          data={ordersSeries}
          dataKey="date"
          series={[{ name: 'orders', color: 'parfum.6' }]}
          curveType="monotone"
          withLegend={false}
          withDots={false}
        />
      </Card>
    </Stack>
  );
}
