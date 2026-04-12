import { Spinner } from '@telegram-apps/telegram-ui';
import { Link } from 'react-router-dom';
import { useListOrdersQuery, type OrderStatus } from '../../../app/parfumApi';
import { useAppSelector } from '../../../app/hooks';
import { formatPrice } from '../../../shared/lib/money';

const statusLabels: Record<OrderStatus, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

function formatWhen(iso: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso));
}

export function OrdersPage() {
  const token = useAppSelector((s) => s.auth.accessToken);
  const { data: orders, isLoading, isError } = useListOrdersQuery(undefined, {
    skip: !token,
  });

  if (!token) {
    return (
      <div className="tma-page">
        <h1 className="page-title">Orders</h1>
        <p className="page-placeholder">
          Sign in via Telegram to see your orders.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="tma-page tma-page--centered">
        <Spinner size="l" />
      </div>
    );
  }

  if (isError || !orders) {
    return (
      <div className="tma-page">
        <h1 className="page-title">Orders</h1>
        <p className="page-placeholder">Could not load orders.</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="tma-page">
        <h1 className="page-title">Orders</h1>
        <p className="page-placeholder">No orders yet.</p>
      </div>
    );
  }

  return (
    <div className="tma-page">
      <h1 className="page-title">Orders</h1>
      <ul className="orders-list">
        {orders.map((o) => (
          <li key={o.id}>
            <Link to={`/orders/${o.id}`} className="orders-row">
              <div className="orders-row__meta">
                <span className="orders-row__id">{formatWhen(o.createdAt)}</span>
                <span className="order-status">{statusLabels[o.status]}</span>
              </div>
              <div style={{ marginTop: 8, fontWeight: 600 }}>
                {formatPrice(o.totalCents)}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
