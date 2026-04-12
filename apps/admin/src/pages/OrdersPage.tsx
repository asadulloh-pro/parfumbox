import {
  Alert,
  Loader,
  Select,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core';
import dayjs from 'dayjs';
import {
  type OrderStatus,
  useGetOrdersQuery,
  useUpdateOrderStatusMutation,
} from '../app/parfumApi';

const STATUSES: OrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
];

export function OrdersPage() {
  const { data, isLoading, error } = useGetOrdersQuery();
  const [updateStatus, { isLoading: updating }] = useUpdateOrderStatusMutation();

  const rows = (data ?? []).map((o) => (
    <Table.Tr key={o.id}>
      <Table.Td>
        <Text size="xs" ff="monospace">
          {o.id.slice(0, 8)}…
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{o.user.telegramId}</Text>
      </Table.Td>
      <Table.Td>{o.items.length}</Table.Td>
      <Table.Td>{(o.totalCents / 100).toFixed(2)}</Table.Td>
      <Table.Td>
        <Select
          size="xs"
          data={STATUSES.map((s) => ({ value: s, label: s }))}
          value={o.status}
          disabled={updating}
          onChange={(v) => {
            if (!v || v === o.status) return;
            void updateStatus({ id: o.id, status: v as OrderStatus });
          }}
        />
      </Table.Td>
      <Table.Td>
        <Text size="sm">{dayjs(o.createdAt).format('YYYY-MM-DD HH:mm')}</Text>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Stack gap="md">
      <Title order={2}>Orders</Title>
      <Text size="sm" c="dimmed">
        Update fulfillment status as orders progress.
      </Text>

      {error ? (
        <Alert color="red" title="Could not load orders">
          Ensure you are logged in and the API is reachable.
        </Alert>
      ) : null}

      {isLoading ? (
        <Loader />
      ) : (
        <Table striped highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Order</Table.Th>
              <Table.Th>Telegram user</Table.Th>
              <Table.Th>Lines</Table.Th>
              <Table.Th>Total</Table.Th>
              <Table.Th w={160}>Status</Table.Th>
              <Table.Th>Created</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      )}
    </Stack>
  );
}
