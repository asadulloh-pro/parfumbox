import { Badge, Button, Layout, Space, Typography } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';

const { Header } = Layout;

export function AppHeader() {
  const count = useAppSelector((s) =>
    s.cart.items.reduce((n, i) => n + i.quantity, 0),
  );
  const location = useLocation();
  const hideBack = location.pathname === '/';

  return (
    <Header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingInline: 16,
        gap: 12,
      }}
    >
      <Space>
        {!hideBack && (
          <Button type="text" onClick={() => window.history.back()}>
            Back
          </Button>
        )}
        <Link to="/">
          <Typography.Title level={4} style={{ margin: 0, color: 'inherit' }}>
            Parfumbox
          </Typography.Title>
        </Link>
      </Space>
      <Space>
        <Link to="/orders">
          <Button type="text">Orders</Button>
        </Link>
        <Link to="/cart">
          <Badge count={count} offset={[-4, 4]}>
            <Button type="primary" icon={<ShoppingCartOutlined />}>
              Cart
            </Button>
          </Badge>
        </Link>
      </Space>
    </Header>
  );
}
