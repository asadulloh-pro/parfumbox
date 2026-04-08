import { Table, Select, Tag, Typography, Space } from 'antd';
import type { TableProps } from 'antd';
import { useState } from 'react';
import {
  useGetOrdersQuery,
  usePatchOrderMutation,
  type AdminOrderRow,
} from '@/api/adminApi';

const STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'] as const;

export function OrdersPage() {
  const [page, setPage] = useState(0);
  const pageSize = 20;
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const { data, isLoading, refetch } = useGetOrdersQuery({
    skip: page * pageSize,
    take: pageSize,
    status: statusFilter,
  });
  const [patch, { isLoading: patching }] = usePatchOrderMutation();

  const columns: TableProps<AdminOrderRow>['columns'] = [
    {
      title: 'Created',
      dataIndex: 'createdAt',
      render: (v: string) => new Date(v).toLocaleString(),
      width: 180,
    },
    {
      title: 'Client',
      key: 'user',
      render: (_, row) => (
        <span>
          {row.user.firstName ?? ''} {row.user.lastName ?? ''}
          <Typography.Text type="secondary" style={{ display: 'block', fontSize: 12 }}>
            @{row.user.username ?? '—'} · tg:{row.user.telegramId}
          </Typography.Text>
        </span>
      ),
    },
    {
      title: 'Total',
      dataIndex: 'total',
      width: 100,
    },
    {
      title: 'Payment',
      dataIndex: 'paymentMethod',
      width: 120,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 200,
      render: (status: string, row) => (
        <Select
          value={status}
          loading={patching}
          style={{ width: 160 }}
          options={STATUSES.map((s) => ({ label: s, value: s }))}
          onChange={async (v) => {
            await patch({ id: row.id, status: v });
            void refetch();
          }}
        />
      ),
    },
  ];

  return (
    <div>
      <Typography.Title level={4} style={{ marginTop: 0 }}>
        Orders
      </Typography.Title>
      <Space style={{ marginBottom: 16 }}>
        <span>Filter:</span>
        <Select
          allowClear
          placeholder="All statuses"
          style={{ width: 180 }}
          value={statusFilter}
          onChange={(v) => {
            setStatusFilter(v);
            setPage(0);
          }}
          options={STATUSES.map((s) => ({ label: s, value: s }))}
        />
      </Space>
      <Table<AdminOrderRow>
        rowKey="id"
        loading={isLoading}
        columns={columns}
        dataSource={data?.items}
        expandable={{
          expandedRowRender: (row) => (
            <div>
              <div>
                <strong>Address:</strong> {row.deliveryAddress}
              </div>
              <div>
                <strong>Phone:</strong> {row.deliveryPhone}
              </div>
              {row.deliveryComment && (
                <div>
                  <strong>Comment:</strong> {row.deliveryComment}
                </div>
              )}
              <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                {row.items.map((i) => (
                  <li key={i.id}>
                    {i.product.name} × {i.quantity} @ {i.priceSnapshot}
                  </li>
                ))}
              </ul>
            </div>
          ),
        }}
        pagination={{
          current: page + 1,
          pageSize,
          total: data?.total ?? 0,
          showSizeChanger: false,
          onChange: (p) => setPage(p - 1),
        }}
      />
    </div>
  );
}
