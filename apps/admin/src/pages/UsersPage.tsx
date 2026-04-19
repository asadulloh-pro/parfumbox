import { Alert, Loader, Stack, Table, Text, Title } from '@mantine/core';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { useGetUsersQuery } from '../app/parfumApi';

export function UsersPage() {
  const { t } = useTranslation();
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
      <Title order={2}>{t('users.title')}</Title>
      <Text size="sm" c="dimmed">
        {t('users.subtitle')}
      </Text>

      {error ? (
        <Alert color="red" title={t('users.loadErrorTitle')}>
          {t('users.loadErrorBody')}
        </Alert>
      ) : null}

      {isLoading ? (
        <Loader />
      ) : (
        <Table striped highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>{t('users.colTelegramId')}</Table.Th>
              <Table.Th>{t('users.colUsername')}</Table.Th>
              <Table.Th>{t('users.colName')}</Table.Th>
              <Table.Th>{t('users.colPhone')}</Table.Th>
              <Table.Th>{t('users.colJoined')}</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      )}
    </Stack>
  );
}
