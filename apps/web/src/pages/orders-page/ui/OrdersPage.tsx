import { Card, Collapse, List, Spin, Typography } from 'antd';
import { useGetOrdersQuery } from '@/shared/api/parfumApi';

export function OrdersPage() {
  const { data, isLoading, isError, error } = useGetOrdersQuery();

  if (isLoading) {
    return (
      <div style={{ padding: 48, textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (isError) {
    const status =
      error && typeof error === 'object' && 'status' in error
        ? (error as { status: number }).status
        : undefined;
    return (
      <Typography.Paragraph type="danger" style={{ padding: 24 }}>
        {status === 401
          ? 'Sign in with Telegram to see your orders.'
          : 'Could not load orders.'}
      </Typography.Paragraph>
    );
  }

  if (!data?.length) {
    return (
      <div style={{ padding: 24 }}>
        <Typography.Paragraph>No orders yet.</Typography.Paragraph>
      </div>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      <Typography.Title level={4}>My orders</Typography.Title>
      <List
        dataSource={data}
        renderItem={(order) => (
          <List.Item key={order.id}>
            <Card size="small" style={{ width: '100%' }}>
              <Typography.Text strong>
                {new Date(order.createdAt).toLocaleString()} — {order.status}
              </Typography.Text>
              <div>
                Total: {order.total} ({order.paymentMethod})
              </div>
              <Collapse
                size="small"
                items={[
                  {
                    key: '1',
                    label: 'Details',
                    children: (
                      <>
                        <div>Phone: {order.deliveryPhone}</div>
                        <div>Address: {order.deliveryAddress}</div>
                        {order.deliveryComment && <div>Comment: {order.deliveryComment}</div>}
                        <List
                          size="small"
                          dataSource={order.items}
                          renderItem={(line) => (
                            <List.Item key={line.id}>
                              {line.product.name} × {line.quantity} — {line.priceSnapshot}
                            </List.Item>
                          )}
                        />
                      </>
                    ),
                  },
                ]}
              />
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
}
