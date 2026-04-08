import {
  LogoutOutlined,
  ShoppingOutlined,
  TeamOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import { Layout, Menu, theme } from 'antd';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@/app/hooks';
import { setToken } from '@/entities/session/model/sessionSlice';

const { Header, Sider, Content } = Layout;

const menuItems = [
  { key: '/orders', icon: <ShoppingOutlined />, label: <Link to="/orders">Orders</Link> },
  { key: '/clients', icon: <TeamOutlined />, label: <Link to="/clients">Clients</Link> },
  { key: '/products', icon: <AppstoreOutlined />, label: <Link to="/products">Products</Link> },
];

export function AdminLayout() {
  const loc = useLocation();
  const nav = useNavigate();
  const dispatch = useAppDispatch();
  const { token } = theme.useToken();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider breakpoint="lg" collapsedWidth={0}>
        <div
          style={{
            height: 48,
            margin: 16,
            color: '#fff',
            fontWeight: 700,
            fontSize: 16,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          Parfumbox
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[menuItems.find((m) => loc.pathname.startsWith(m.key))?.key ?? '/orders']}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: '0 24px',
            background: token.colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
          }}
        >
          <Menu
            mode="horizontal"
            selectable={false}
            style={{ border: 'none', minWidth: 120 }}
            items={[
              {
                key: 'out',
                icon: <LogoutOutlined />,
                label: 'Sign out',
                onClick: () => {
                  dispatch(setToken(null));
                  nav('/login');
                },
              },
            ]}
          />
        </Header>
        <Content style={{ margin: 24 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
