import { Stack, Text, Title } from '@mantine/core';

export function ProductsPage() {
  return (
    <Stack gap="sm">
      <Title order={2}>Products</Title>
      <Text c="dimmed" size="sm">
        CRUD, pagination, and MinIO image upload will be wired here.
      </Text>
    </Stack>
  );
}
