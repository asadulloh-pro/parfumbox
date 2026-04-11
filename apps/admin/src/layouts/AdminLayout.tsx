import { AppShell, Burger, Group, ScrollArea, Text, Title } from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import {
  IconLayoutDashboard,
  IconPackage,
  IconShoppingCart,
  IconUsers,
} from '@tabler/icons-react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';

const nav = [
  { to: '/dashboard', label: 'Dashboard', icon: IconLayoutDashboard },
  { to: '/orders', label: 'Orders', icon: IconShoppingCart },
  { to: '/products', label: 'Products', icon: IconPackage },
  { to: '/users', label: 'Users', icon: IconUsers },
];

export function AdminLayout() {
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
              Parfumbox Admin
            </Title>
          </Group>
          <Text size="sm" c="dimmed" visibleFrom="sm">
            {pathname}
          </Text>
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
