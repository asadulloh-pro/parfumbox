import { Table, Typography } from 'antd';
import type { TableProps } from 'antd';
import { useState } from 'react';
import { useGetClientsQuery, type ClientRow } from '@/api/adminApi';

export function ClientsPage() {
  const [page, setPage] = useState(0);
  const pageSize = 20;
  const { data, isLoading } = useGetClientsQuery({
    skip: page * pageSize,
    take: pageSize,
  });

  const columns: TableProps<ClientRow>['columns'] = [
    {
      title: 'Telegram ID',
      dataIndex: 'telegramId',
      width: 140,
    },
    {
      title: 'Username',
      dataIndex: 'username',
      render: (v: string | null) => v ?? '—',
    },
    {
      title: 'Name',
      key: 'name',
      render: (_, row) =>
        [row.firstName, row.lastName].filter(Boolean).join(' ') || '—',
    },
    {
      title: 'Orders',
      dataIndex: 'orderCount',
      width: 90,
    },
    {
      title: 'Joined',
      dataIndex: 'createdAt',
      render: (v: string) => new Date(v).toLocaleString(),
      width: 180,
    },
  ];

  return (
    <div>
      <Typography.Title level={4} style={{ marginTop: 0 }}>
        Clients
      </Typography.Title>
      <Table<ClientRow>
        rowKey="id"
        loading={isLoading}
        columns={columns}
        dataSource={data?.items}
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
