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
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  type OrderStatus,
  useGetAdminOrderQuery,
  useGetOrdersQuery,
  useUpdateOrderStatusMutation,
} from '../app/parfumApi';
import { formatPrice } from '../shared/lib/money';
import { useListSearchParams } from '../shared/lib/useListSearchParams';
import { paginationFromTotal } from '../shared/lib/serverPagination';
import { useTablePagination } from '../shared/lib/useTablePagination';
import { TablePaginationFooter } from '../shared/ui/TablePaginationFooter';

const STATUSES: OrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
];

export function OrdersPage() {
  const { t } = useTranslation();
  const [updateStatus, { isLoading: updating }] = useUpdateOrderStatusMutation();
  const {
    page: ordersPage,
    setPage: setOrdersPage,
    pageSize: ordersPageSize,
    setPageSize: setOrdersPageSize,
  } = useListSearchParams(25);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | null>(null);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);

  const ordersQuery = useMemo(
    () => ({
      page: ordersPage,
      pageSize: ordersPageSize,
      ...(statusFilter ? { status: statusFilter } : {}),
      ...(dateRange[0] && dateRange[1]
        ? {
            createdFrom: dayjs(dateRange[0]).format('YYYY-MM-DD'),
            createdTo: dayjs(dateRange[1]).format('YYYY-MM-DD'),
          }
        : {}),
    }),
    [ordersPage, ordersPageSize, statusFilter, dateRange],
  );

  const { data: ordersData, isLoading, error } = useGetOrdersQuery(ordersQuery);
  const { data: orderDetail, isFetching: orderDetailLoading } = useGetAdminOrderQuery(
    selectedOrderId!,
    { skip: !selectedOrderId },
  );


  const hasFilters = Boolean(
    statusFilter || (dateRange[0] && dateRange[1]),
  );
  const ordersTotal = ordersData?.total ?? 0;
  const {
    totalPages: ordersTotalPages,
    rangeStart: ordersRangeStart,
    rangeEnd: ordersRangeEnd,
    effectivePage: ordersEffectivePage,
  } = paginationFromTotal(ordersTotal, ordersPage, ordersPageSize);
  const ordersPageItems = ordersData?.items ?? [];

  useEffect(() => {
    if (ordersPage !== ordersEffectivePage) {
      setOrdersPage(ordersEffectivePage);
    }
  }, [ordersPage, ordersEffectivePage, setOrdersPage]);



  const renderValue = (value: string | null) => value ?? '-';

  const rows = useMemo(() => ordersPageItems.map((o) => (
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
      <Table.Td>{formatPrice(o.totalUzs)}</Table.Td>
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
  )), [ordersPageItems, updating, t]);

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
          onChange={(v) => {
            setStatusFilter((v ?? null) as OrderStatus | null);
            setOrdersPage(1);
          }}
          w={{ base: '100%', sm: 220 }}
        />
        <DatePickerInput
          type="range"
          label={t('orders.filterDateRange')}
          placeholder={t('orders.pickDates')}
          value={dateRange}
          onChange={(v) => {
            setDateRange(v);
            setOrdersPage(1);
          }}
          clearable
          w={{ base: '100%', sm: 320 }}
        />
      </Group>

      {error ? (
        <Alert color="red" title={t('orders.loadErrorTitle')}>
          {t('orders.loadErrorBody')}
        </Alert>
      ) : null}

      {isLoading ? (
        <Loader />
      ) : !ordersTotal && hasFilters ? (
        <Alert color="gray" title={t('orders.noMatchesTitle')}>
          {t('orders.noMatchesBody')}
        </Alert>
      ) : !ordersTotal && !hasFilters ? (
        <Text size="sm" c="dimmed">
          {t('orders.noneYet')}
        </Text>
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

      {!isLoading && ordersTotal > 0 ? (
        <TablePaginationFooter
          page={ordersEffectivePage}
          totalPages={ordersTotalPages}
          onPageChange={setOrdersPage}
          pageSize={ordersPageSize}
          onPageSizeChange={setOrdersPageSize}
          rangeStart={ordersRangeStart}
          rangeEnd={ordersRangeEnd}
          totalItems={ordersTotal}
        />
      ) : null}

      <Modal
        opened={Boolean(selectedOrderId)}
        onClose={() => setSelectedOrderId(null)}
        title={t('orders.modalTitle')}
        size="lg"
      >
        {selectedOrderId && orderDetailLoading ? (
          <Loader />
        ) : orderDetail ? (
          <Stack gap="sm">
            <Title order={5}>{t('orders.sectionDetails')}</Title>
            <Text size="sm">
              {t('orders.id')}: {orderDetail.id}
            </Text>
            <Text size="sm">
              {t('orders.created')}:{' '}
              {dayjs(orderDetail.createdAt).format('DD-MMMM-YYYY HH:mm')}
            </Text>
            <Text size="sm">
              {t('orders.status')}: {t(`orderStatus.${orderDetail.status}` as const)}
            </Text>
            <Text size="sm">
              {t('orders.subtotal')}: {formatPrice(orderDetail.subtotalUzs)}
            </Text>
            <Text size="sm">
              {t('orders.total')}: {formatPrice(orderDetail.totalUzs)}
            </Text>
            <Text size="sm">
              {t('orders.deliveryFirstName')}:{' '}
              {renderValue(orderDetail.deliveryFirstName)}
            </Text>
            <Text size="sm">
              {t('orders.deliveryLastName')}:{' '}
              {renderValue(orderDetail.deliveryLastName)}
            </Text>
            <Text size="sm">
              {t('orders.deliveryPhone')}: {renderValue(orderDetail.deliveryPhone)}
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
                {orderDetail?.items.map((item) => (
                  <Table.Tr key={item.id}>
                    <Table.Td>{item.titleSnapshot}</Table.Td>
                    <Table.Td>{item.quantity}</Table.Td>
                    <Table.Td>{formatPrice(item.unitPriceUzs)}</Table.Td>
                    <Table.Td>
                      {formatPrice(item.unitPriceUzs * item.quantity)}
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
           

            <Divider />

            <Title order={5}>{t('orders.sectionUser')}</Title>
            <Text size="sm">
              {t('orders.telegramId')}: {orderDetail.user.telegramId}
            </Text>
            <Text size="sm">
              {t('orders.firstName')}: {renderValue(orderDetail.user.firstName)}
            </Text>
            <Text size="sm">
              {t('orders.lastName')}: {renderValue(orderDetail.user.lastName)}
            </Text>
            <Text size="sm">
              {t('orders.phone')}: {renderValue(orderDetail.user.phone)}
            </Text>
            <Text size="sm">
              {t('orders.birthDate')}:{' '}
              {orderDetail.user.birthDate
                ? dayjs(orderDetail.user.birthDate).format('DD-MMMM-YYYY')
                : '-'}
            </Text>
          </Stack>
        ) : selectedOrderId ? (
          <Text size="sm" c="dimmed">
            {t('orders.loadErrorBody')}
          </Text>
        ) : null}
      </Modal>
    </Stack>
  );
}
