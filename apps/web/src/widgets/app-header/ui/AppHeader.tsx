import { Badge, Button } from '@telegram-apps/telegram-ui';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const titles: Record<string, string> = {
  '/': 'Explore',
  '/cart': 'Cart',
  '/checkout': 'Checkout',
  '/orders': 'Orders',
  '/profile': 'Profile',
};

function titleForPath(pathname: string): string {
  if (pathname.startsWith('/product/')) return 'Product';
  return titles[pathname] ?? 'Parfumbox';
}

export function AppHeader() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const title = titleForPath(pathname);

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        padding: '10px 16px',
        borderBottom: '1px solid var(--pb-border)',
        background: 'var(--pb-surface)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      <Link
        to="/"
        style={{
          fontWeight: 700,
          fontSize: 17,
          letterSpacing: '-0.02em',
          color: 'var(--pb-text)',
        }}
      >
        {title}
      </Link>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Button mode="plain" size="s" onClick={() => navigate('/profile')}>
          Profile
        </Button>
        <Button mode="plain" size="s" onClick={() => navigate('/orders')}>
          Orders
        </Button>
        <Button
          mode="bezeled"
          size="s"
          onClick={() => navigate('/cart')}
          after={
            <Badge type="number" mode="primary">
              0
            </Badge>
          }
        >
          Cart
        </Button>
      </div>
    </header>
  );
}
