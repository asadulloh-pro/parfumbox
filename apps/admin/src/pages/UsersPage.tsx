import { Stack, Text, Title } from '@mantine/core';

export function UsersPage() {
  return (
    <Stack gap="sm">
      <Title order={2}>Users</Title>
      <Text c="dimmed" size="sm">
        Telegram-linked customers and profile fields will list here for support
        workflows.
      </Text>
    </Stack>
  );
}
