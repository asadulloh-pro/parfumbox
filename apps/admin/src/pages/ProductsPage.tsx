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
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
        label={t('products.formTitle')}
        value={formTitle}
        onChange={(e) => setFormTitle(e.currentTarget.value)}
        required
      />
      <Textarea
        label={t('products.formDescription')}
        value={description}
        onChange={(e) => setDescription(e.currentTarget.value)}
        minRows={3}
      />
      <NumberInput
        label={t('products.formPrice')}
        value={priceCents}
        onChange={(v) => setPriceCents(v)}
        min={0}
        required
      />
      <Textarea
        label={t('products.formImages')}
        description={t('products.formImagesHint')}
        value={imagesRaw}
        onChange={(e) => setImagesRaw(e.currentTarget.value)}
        minRows={2}
      />
      <NumberInput
        label={t('products.formStock')}
        description={t('products.formStockHint')}
        value={stock}
        onChange={(v) => setStock(v === '' ? '' : v)}
        min={0}
        allowDecimal={false}
      />
      <Group justify="flex-end" mt="md">
        <Button variant="default" onClick={onCancel}>
          {t('common.cancel')}
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
          {t('common.save')}
        </Button>
      </Group>
    </Stack>
  );
}

export function ProductsPage() {
  const { t } = useTranslation();
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
            aria-label={t('products.editAria')}
          >
            <IconPencil size={18} />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            color="red"
            onClick={() => setDeleting(p)}
            aria-label={t('products.deleteAria')}
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
        <Title order={2}>{t('products.title')}</Title>
        <Button
          leftSection={<IconPlus size={18} />}
          color="parfum"
          onClick={openCreate}
        >
          {t('products.addProduct')}
        </Button>
      </Group>

      {error ? (
        <Alert color="red" title={t('products.loadErrorTitle')}>
          {t('products.loadErrorBody')}
        </Alert>
      ) : null}

      {isLoading ? (
        <Loader />
      ) : (
        <Table striped highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>{t('products.colThumb')}</Table.Th>
              <Table.Th>{t('products.colProduct')}</Table.Th>
              <Table.Th>{t('products.colPrice')}</Table.Th>
              <Table.Th>{t('products.colStock')}</Table.Th>
              <Table.Th w={120}>{t('products.colActions')}</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      )}

      <Modal
        opened={createOpen}
        onClose={closeCreate}
        title={t('products.modalNew')}
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
        title={t('products.modalEdit')}
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
        title={t('products.modalDelete')}
      >
        <Text size="sm">
          {t('products.deleteConfirm', { title: deleting?.title ?? '' })}
        </Text>
        <Group justify="flex-end" mt="lg">
          <Button variant="default" onClick={() => setDeleting(null)}>
            {t('common.cancel')}
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
            {t('common.delete')}
          </Button>
        </Group>
      </Modal>
    </Stack>
  );
}
