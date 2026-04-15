import {
  Alert,
  Button,
  Divider,
  Loader,
  Modal,
  Select,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core';
import dayjs from 'dayjs';
import { useState } from 'react';
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
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const selectedOrder = selectedOrderId
    ? (data ?? []).find((order) => order.id === selectedOrderId) ?? null
    : null;

  const formatCurrency = (cents: number) => (cents / 100).toFixed(2);
  const renderValue = (value: string | null) => value ?? '-';

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
      <Table.Td>{formatCurrency(o.totalCents)}</Table.Td>
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
      <Table.Td>
        <Button size="xs" variant="light" onClick={() => setSelectedOrderId(o.id)}>
          Details
        </Button>
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
              <Table.Th w={100}>Action</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      )}

      <Modal
        opened={Boolean(selectedOrder)}
        onClose={() => setSelectedOrderId(null)}
        title="Order details"
        size="lg"
      >
        {selectedOrder ? (
          <Stack gap="sm">
            <Title order={5}>Order details</Title>
            <Text size="sm">ID: {selectedOrder.id}</Text>
            <Text size="sm">
              Created: {dayjs(selectedOrder.createdAt).format('YYYY-MM-DD HH:mm')}
            </Text>
            <Text size="sm">Status: {selectedOrder.status}</Text>
            <Text size="sm">Subtotal: {formatCurrency(selectedOrder.subtotalCents)}</Text>
            <Text size="sm">Total: {formatCurrency(selectedOrder.totalCents)}</Text>
            <Text size="sm">
              Delivery first name: {renderValue(selectedOrder.deliveryFirstName)}
            </Text>
            <Text size="sm">
              Delivery last name: {renderValue(selectedOrder.deliveryLastName)}
            </Text>
            <Text size="sm">Delivery phone: {renderValue(selectedOrder.deliveryPhone)}</Text>

            <Divider />

            <Title order={5}>Order lines</Title>
            <Table striped withTableBorder>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Product</Table.Th>
                  <Table.Th>Qty</Table.Th>
                  <Table.Th>Unit price</Table.Th>
                  <Table.Th>Line total</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {selectedOrder.items.map((item) => (
                  <Table.Tr key={item.id}>
                    <Table.Td>{item.titleSnapshot}</Table.Td>
                    <Table.Td>{item.quantity}</Table.Td>
                    <Table.Td>{formatCurrency(item.unitPriceCents)}</Table.Td>
                    <Table.Td>
                      {formatCurrency(item.unitPriceCents * item.quantity)}
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>

            <Divider />

            <Title order={5}>User profile</Title>
            <Text size="sm">Telegram ID: {selectedOrder.user.telegramId}</Text>
            <Text size="sm">First name: {renderValue(selectedOrder.user.firstName)}</Text>
            <Text size="sm">Last name: {renderValue(selectedOrder.user.lastName)}</Text>
            <Text size="sm">Phone: {renderValue(selectedOrder.user.phone)}</Text>
            <Text size="sm">Birth date: {renderValue(selectedOrder.user.birthDate)}</Text>
          </Stack>
        ) : null}
      </Modal>
    </Stack>
  );
}
