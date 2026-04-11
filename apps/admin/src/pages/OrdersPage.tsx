import { Stack, Text, Title } from '@mantine/core';

export function OrdersPage() {
  return (
    <Stack gap="sm">
      <Title order={2}>Orders</Title>
      <Text c="dimmed" size="sm">
        Server-side table, filters, and status updates will connect to the NestJS
        admin API in a later step.
      </Text>
    </Stack>
  );
}
