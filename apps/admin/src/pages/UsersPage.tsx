import { Alert, Loader, Stack, Table, Text, Title } from '@mantine/core';
import dayjs from 'dayjs';
import { useGetUsersQuery } from '../app/parfumApi';

export function UsersPage() {
  const { data, isLoading, error } = useGetUsersQuery();

  const rows = (data ?? []).map((u) => (
    <Table.Tr key={u.id}>
      <Table.Td>
        <Text size="sm" ff="monospace">
          {u.telegramId}
        </Text>
      </Table.Td>
      <Table.Td>{u.telegramUsername ?? '—'}</Table.Td>
      <Table.Td>
        {[u.firstName, u.lastName].filter(Boolean).join(' ') || '—'}
      </Table.Td>
      <Table.Td>{u.phone ?? '—'}</Table.Td>
      <Table.Td>{dayjs(u.createdAt).format('YYYY-MM-DD')}</Table.Td>
    </Table.Tr>
  ));

  return (
    <Stack gap="md">
      <Title order={2}>Users</Title>
      <Text size="sm" c="dimmed">
        Telegram-linked customers (read-only).
      </Text>

      {error ? (
        <Alert color="red" title="Could not load users">
          Ensure you are logged in and the API is reachable.
        </Alert>
      ) : null}

      {isLoading ? (
        <Loader />
      ) : (
        <Table striped highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Telegram ID</Table.Th>
              <Table.Th>Username</Table.Th>
              <Table.Th>Name</Table.Th>
              <Table.Th>Phone</Table.Th>
              <Table.Th>Joined</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      )}
    </Stack>
  );
}
