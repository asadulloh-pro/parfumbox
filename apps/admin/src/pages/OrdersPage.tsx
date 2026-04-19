import {
  Alert,
  Button,
  Divider,
  Group,
  Loader,
  Modal,
  Select,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const { data, isLoading, error } = useGetOrdersQuery();
  const [updateStatus, { isLoading: updating }] = useUpdateOrderStatusMutation();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | null>(null);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);

  const filteredOrders = useMemo(() => {
    const list = data ?? [];
    let out = list;
    if (statusFilter) {
      out = out.filter((o) => o.status === statusFilter);
    }
    const from = dateRange[0];
    const to = dateRange[1];
    if (from && to) {
      const startMs = dayjs(from).startOf('day').valueOf();
      const endMs = dayjs(to).endOf('day').valueOf();
      out = out.filter((o) => {
        const tMs = dayjs(o.createdAt).valueOf();
        return tMs >= startMs && tMs <= endMs;
      });
    }
    return out;
  }, [data, statusFilter, dateRange]);

  const selectedOrder = selectedOrderId
    ? (data ?? []).find((order) => order.id === selectedOrderId) ?? null
    : null;

  const formatCurrency = (cents: number) => (cents / 100).toFixed(2);
  const renderValue = (value: string | null) => value ?? '-';

  const rows = filteredOrders.map((o) => (
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
          data={STATUSES.map((s) => ({
            value: s,
            label: t(`orderStatus.${s}` as const),
          }))}
          value={o.status}
          disabled={updating}
          onChange={(v) => {
            if (!v || v === o.status) return;
            void updateStatus({ id: o.id, status: v as OrderStatus });
          }}
        />
      </Table.Td>
      <Table.Td>
        <Text size="sm">{dayjs(o.createdAt).format('DD-MMMM-YYYY HH:mm')}</Text>
      </Table.Td>
      <Table.Td>
        <Button size="xs" variant="light" onClick={() => setSelectedOrderId(o.id)}>
          {t('common.details')}
        </Button>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Stack gap="md">
      <Title order={2}>{t('orders.title')}</Title>
      <Text size="sm" c="dimmed">
        {t('orders.subtitle')}
      </Text>

      <Group align="flex-end" wrap="wrap" gap="md">
        <Select
          label={t('orders.filterStatus')}
          placeholder={t('orders.allStatuses')}
          clearable
          data={STATUSES.map((s) => ({
            value: s,
            label: t(`orderStatus.${s}` as const),
          }))}
          value={statusFilter}
          onChange={(v) => setStatusFilter((v ?? null) as OrderStatus | null)}
          w={{ base: '100%', sm: 220 }}
        />
        <DatePickerInput
          type="range"
          label={t('orders.filterDateRange')}
          placeholder={t('orders.pickDates')}
          value={dateRange}
          onChange={setDateRange}
          clearable
          w={{ base: '100%', sm: 320 }}
        />
      </Group>

      {(data?.length ?? 0) > 0 ? (
        <Text size="xs" c="dimmed">
          {t('orders.showingCount', {
            shown: filteredOrders.length,
            total: data?.length ?? 0,
          })}
        </Text>
      ) : null}

      {error ? (
        <Alert color="red" title={t('orders.loadErrorTitle')}>
          {t('orders.loadErrorBody')}
        </Alert>
      ) : null}

      {isLoading ? (
        <Loader />
      ) : !filteredOrders.length && (data?.length ?? 0) > 0 ? (
        <Alert color="gray" title={t('orders.noMatchesTitle')}>
          {t('orders.noMatchesBody')}
        </Alert>
      ) : (
        <Table striped highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>{t('orders.colOrder')}</Table.Th>
              <Table.Th>{t('orders.colTelegramUser')}</Table.Th>
              <Table.Th>{t('orders.colLines')}</Table.Th>
              <Table.Th>{t('orders.colTotal')}</Table.Th>
              <Table.Th w={160}>{t('orders.colStatus')}</Table.Th>
              <Table.Th>{t('orders.colCreated')}</Table.Th>
              <Table.Th w={100}>{t('orders.colAction')}</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      )}

      <Modal
        opened={Boolean(selectedOrder)}
        onClose={() => setSelectedOrderId(null)}
        title={t('orders.modalTitle')}
        size="lg"
      >
        {selectedOrder ? (
          <Stack gap="sm">
            <Title order={5}>{t('orders.sectionDetails')}</Title>
            <Text size="sm">
              {t('orders.id')}: {selectedOrder.id}
            </Text>
            <Text size="sm">
              {t('orders.created')}:{' '}
              {dayjs(selectedOrder.createdAt).format('DD-MMMM-YYYY HH:mm')}
            </Text>
            <Text size="sm">
              {t('orders.status')}: {t(`orderStatus.${selectedOrder.status}` as const)}
            </Text>
            <Text size="sm">
              {t('orders.subtotal')}: {formatCurrency(selectedOrder.subtotalCents)}
            </Text>
            <Text size="sm">
              {t('orders.total')}: {formatCurrency(selectedOrder.totalCents)}
            </Text>
            <Text size="sm">
              {t('orders.deliveryFirstName')}:{' '}
              {renderValue(selectedOrder.deliveryFirstName)}
            </Text>
            <Text size="sm">
              {t('orders.deliveryLastName')}:{' '}
              {renderValue(selectedOrder.deliveryLastName)}
            </Text>
            <Text size="sm">
              {t('orders.deliveryPhone')}: {renderValue(selectedOrder.deliveryPhone)}
            </Text>

            <Divider />

            <Title order={5}>{t('orders.sectionLines')}</Title>
            <Table striped withTableBorder>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>{t('orders.colProduct')}</Table.Th>
                  <Table.Th>{t('orders.colQty')}</Table.Th>
                  <Table.Th>{t('orders.colUnitPrice')}</Table.Th>
                  <Table.Th>{t('orders.colLineTotal')}</Table.Th>
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

            <Title order={5}>{t('orders.sectionUser')}</Title>
            <Text size="sm">
              {t('orders.telegramId')}: {selectedOrder.user.telegramId}
            </Text>
            <Text size="sm">
              {t('orders.firstName')}: {renderValue(selectedOrder.user.firstName)}
            </Text>
            <Text size="sm">
              {t('orders.lastName')}: {renderValue(selectedOrder.user.lastName)}
            </Text>
            <Text size="sm">
              {t('orders.phone')}: {renderValue(selectedOrder.user.phone)}
            </Text>
            <Text size="sm">

               {t('orders.birthDate')}: {selectedOrder?.user?.birthDate ? dayjs(selectedOrder.user.birthDate).format('DD-MMMM-YYYY') : '-'}
            </Text>
          </Stack>
        ) : null}
      </Modal>
    </Stack>
  );
}
