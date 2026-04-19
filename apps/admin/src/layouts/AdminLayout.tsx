import {
  AppShell,
  Burger,
  Button,
  Group,
  ScrollArea,
  Text,
  Title,
} from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import {
  IconLayoutDashboard,
  IconPackage,
  IconScale,
  IconShoppingCart,
  IconUsers,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../app/hooks';
import { logout } from '../features/auth/authSlice';
import { LanguageSwitcher } from '../features/i18n/LanguageSwitcher';
import { NotificationsBell } from '../features/notifications/NotificationsBell';
import { useAdminOrdersRealtime } from '../features/orders/useAdminOrdersRealtime';

export function AdminLayout() {
  useAdminOrdersRealtime();
  const { t } = useTranslation();
  const nav = [
    { to: '/dashboard', label: t('nav.dashboard'), icon: IconLayoutDashboard },
    { to: '/orders', label: t('nav.orders'), icon: IconShoppingCart },
    { to: '/products', label: t('nav.products'), icon: IconPackage },
    { to: '/size-presets', label: t('nav.sizePresets'), icon: IconScale },
    { to: '/users', label: t('nav.users'), icon: IconUsers },
  ];
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [opened, { toggle }] = useDisclosure();
  const isMobile = useMediaQuery('(max-width: 47.99em)');
  const { pathname } = useLocation();

  return (
    <AppShell
      header={{ height: 56 }}
      navbar={{
        width: 260,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Title order={4} c="parfum.8">
              {t('layout.brand')}
            </Title>
          </Group>
          <Group gap="sm">
            <NotificationsBell />
            <LanguageSwitcher />
            <Text size="sm" c="dimmed" visibleFrom="sm">
              {pathname}
            </Text>
            <Button
              size="xs"
              variant="light"
              color="parfum"
              onClick={() => {
                dispatch(logout());
                navigate('/login', { replace: true });
              }}
            >
              {t('common.signOut')}
            </Button>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <ScrollArea type="never" style={{ height: 'calc(100% - 32px)' }}>
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => {
                if (isMobile && opened) toggle();
              }}
              style={{ textDecoration: 'none' }}
            >
              {({ isActive }) => (
                <Group
                  gap="sm"
                  px="sm"
                  py={10}
                  mb={4}
                  style={{
                    borderRadius: 8,
                    backgroundColor: isActive
                      ? 'var(--mantine-color-parfum-0)'
                      : undefined,
                    color: isActive
                      ? 'var(--mantine-color-parfum-8)'
                      : 'var(--mantine-color-dark-6)',
                    fontWeight: isActive ? 600 : 500,
                  }}
                >
                  <Icon size={18} stroke={1.75} />
                  <Text size="sm">{label}</Text>
                </Group>
              )}
            </NavLink>
          ))}
        </ScrollArea>
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
