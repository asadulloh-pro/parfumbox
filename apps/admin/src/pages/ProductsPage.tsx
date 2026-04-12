import {
  ActionIcon,
  Alert,
  Button,
  Group,
  Image,
  Loader,
  Modal,
  NumberInput,
  Stack,
  Table,
  Text,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPencil, IconPlus, IconTrash } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import {
  type Product,
  useCreateProductMutation,
  useDeleteProductMutation,
  useGetProductsQuery,
  useUpdateProductMutation,
} from '../app/parfumApi';

function parseImageList(raw: string): string[] {
  return raw
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function ProductFormFields({
  initial,
  onCancel,
  onSubmit,
  submitting,
}: {
  initial: Product | null;
  submitting: boolean;
  onCancel: () => void;
  onSubmit: (values: {
    title: string;
    description: string;
    priceCents: number;
    images: string[];
    stock: number | null | undefined;
  }) => void;
}) {
  const [formTitle, setFormTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [priceCents, setPriceCents] = useState<number | string>(
    initial?.priceCents ?? '',
  );
  const [imagesRaw, setImagesRaw] = useState(
    (initial?.images ?? []).join('\n'),
  );
  const [stock, setStock] = useState<number | string | ''>(
    initial?.stock ?? '',
  );

  useEffect(() => {
    setFormTitle(initial?.title ?? '');
    setDescription(initial?.description ?? '');
    setPriceCents(initial?.priceCents ?? '');
    setImagesRaw((initial?.images ?? []).join('\n'));
    setStock(initial?.stock ?? '');
  }, [initial]);

  return (
    <Stack gap="md">
      <TextInput
        label="Title"
        value={formTitle}
        onChange={(e) => setFormTitle(e.currentTarget.value)}
        required
      />
      <Textarea
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.currentTarget.value)}
        minRows={3}
      />
      <NumberInput
        label="Price (minor units, e.g. cents)"
        value={priceCents}
        onChange={(v) => setPriceCents(v)}
        min={0}
        required
      />
      <Textarea
        label="Image URLs"
        description="One per line or comma-separated"
        value={imagesRaw}
        onChange={(e) => setImagesRaw(e.currentTarget.value)}
        minRows={2}
      />
      <NumberInput
        label="Stock"
        description="Leave empty for untracked inventory"
        value={stock}
        onChange={(v) => setStock(v === '' ? '' : v)}
        min={0}
        allowDecimal={false}
      />
      <Group justify="flex-end" mt="md">
        <Button variant="default" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          color="parfum"
          loading={submitting}
          onClick={() => {
            const pc =
              typeof priceCents === 'number'
                ? priceCents
                : Number(priceCents);
            if (!formTitle.trim() || Number.isNaN(pc) || pc < 0) return;
            let stockVal: number | null | undefined;
            if (stock === '' || stock === undefined) {
              stockVal = initial ? null : undefined;
            } else if (typeof stock === 'number') {
              stockVal = stock;
            } else {
              stockVal = Number(stock);
            }
            onSubmit({
              title: formTitle.trim(),
              description,
              priceCents: pc,
              images: parseImageList(imagesRaw),
              stock: stockVal,
            });
          }}
        >
          Save
        </Button>
      </Group>
    </Stack>
  );
}

export function ProductsPage() {
  const { data, isLoading, error } = useGetProductsQuery();
  const [createOpen, { open: openCreate, close: closeCreate }] =
    useDisclosure(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);

  const [createProduct, { isLoading: creating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: updating }] = useUpdateProductMutation();
  const [removeProduct, { isLoading: removing }] = useDeleteProductMutation();

  const rows = (data ?? []).map((p) => (
    <Table.Tr key={p.id}>
      <Table.Td w={72}>
        {p.images[0] ? (
          <Image
            src={p.images[0]}
            alt=""
            h={48}
            w={48}
            radius="sm"
            fit="cover"
            fallbackSrc="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
          />
        ) : (
          <Text size="xs" c="dimmed">
            —
          </Text>
        )}
      </Table.Td>
      <Table.Td>
        <Text fw={500}>{p.title}</Text>
        <Text size="xs" c="dimmed" lineClamp={2}>
          {p.description || '—'}
        </Text>
      </Table.Td>
      <Table.Td>{(p.priceCents / 100).toFixed(2)}</Table.Td>
      <Table.Td>{p.stock ?? '—'}</Table.Td>
      <Table.Td>
        <Group gap={4}>
          <ActionIcon
            variant="subtle"
            color="parfum"
            onClick={() => setEditing(p)}
            aria-label="Edit product"
          >
            <IconPencil size={18} />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            color="red"
            onClick={() => setDeleting(p)}
            aria-label="Delete product"
          >
            <IconTrash size={18} />
          </ActionIcon>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Title order={2}>Products</Title>
        <Button
          leftSection={<IconPlus size={18} />}
          color="parfum"
          onClick={openCreate}
        >
          Add product
        </Button>
      </Group>

      {error ? (
        <Alert color="red" title="Could not load products">
          Ensure you are logged in and the API is reachable.
        </Alert>
      ) : null}

      {isLoading ? (
        <Loader />
      ) : (
        <Table striped highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th> </Table.Th>
              <Table.Th>Product</Table.Th>
              <Table.Th>Price</Table.Th>
              <Table.Th>Stock</Table.Th>
              <Table.Th w={120}> </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      )}

      <Modal
        opened={createOpen}
        onClose={closeCreate}
        title="New product"
        size="lg"
      >
        <ProductFormFields
          key={createOpen ? 'create' : 'idle'}
          initial={null}
          submitting={creating}
          onCancel={closeCreate}
          onSubmit={async (values) => {
            await createProduct({
              title: values.title,
              description: values.description || undefined,
              priceCents: values.priceCents,
              images: values.images.length ? values.images : undefined,
              stock:
                values.stock === undefined || values.stock === null
                  ? undefined
                  : values.stock,
            }).unwrap();
            closeCreate();
          }}
        />
      </Modal>

      <Modal
        opened={editing !== null}
        onClose={() => setEditing(null)}
        title="Edit product"
        size="lg"
      >
        {editing ? (
          <ProductFormFields
            initial={editing}
            submitting={updating}
            onCancel={() => setEditing(null)}
            onSubmit={async (values) => {
              await updateProduct({
                id: editing.id,
                body: {
                  title: values.title,
                  description: values.description,
                  priceCents: values.priceCents,
                  images: values.images,
                  stock: values.stock ?? null,
                },
              }).unwrap();
              setEditing(null);
            }}
          />
        ) : null}
      </Modal>

      <Modal
        opened={deleting !== null}
        onClose={() => setDeleting(null)}
        title="Delete product"
      >
        <Text size="sm">
          Delete <strong>{deleting?.title}</strong>? This cannot be undone.
        </Text>
        <Group justify="flex-end" mt="lg">
          <Button variant="default" onClick={() => setDeleting(null)}>
            Cancel
          </Button>
          <Button
            color="red"
            loading={removing}
            onClick={async () => {
              if (!deleting) return;
              await removeProduct(deleting.id).unwrap();
              setDeleting(null);
            }}
          >
            Delete
          </Button>
        </Group>
      </Modal>
    </Stack>
  );
}
