import {
  ActionIcon,
  Alert,
  Button,
  Checkbox,
  Divider,
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
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  type Product,
  type SizePreset,
  useCreateProductMutation,
  useDeleteProductMutation,
  useGetProductsQuery,
  useGetSizePresetsQuery,
  useUpdateProductMutation,
} from '../app/parfumApi';
import { formatPrice } from '../shared/lib/money';
import { useListSearchParams } from '../shared/lib/useListSearchParams';
import { paginationFromTotal } from '../shared/lib/serverPagination';
import { TablePaginationFooter } from '../shared/ui/TablePaginationFooter';

function parseImageList(raw: string): string[] {
  return raw
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function formatProductPriceColumn(p: Product): string {
  if (p.sizes && p.sizes.length > 0) {
    const prices = p.sizes.map((s) => s.priceUzs);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    if (min === max) {
      return formatPrice(min);
    }
    return `${formatPrice(min)} – ${formatPrice(max)}`;
  }
  return formatPrice(p.priceUzs);
}

function variantCountLabel(p: Product, dash: string): string {
  const n = p.sizes?.length ?? 0;
  return n > 0 ? String(n) : dash;
}

function coerceSizeNumber(v: string | number | undefined): number | '' {
  if (v === '' || v === undefined) return '';
  if (typeof v === 'number') return v;
  const n = Number(v);
  return Number.isFinite(n) ? n : '';
}

function ProductFormFields({
  presets,
  initial,
  onCancel,
  onSubmit,
  submitting,
}: {
  presets: SizePreset[];
  initial: Product | null;
  submitting: boolean;
  onCancel: () => void;
  onSubmit: (values: {
    title: string;
    description: string;
    priceUzs: number;
    sizes: Array<{ presetId: string; priceUzs: number }>;
    images: string[];
    stock: number | null | undefined;
  }) => void;
}) {
  const { t } = useTranslation();
  const [formTitle, setFormTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [priceUzs, setPriceUzs] = useState<number | string>(initial?.priceUzs ?? '');
  const [imagesRaw, setImagesRaw] = useState((initial?.images ?? []).join('\n'));
  const [stock, setStock] = useState<number | string | ''>(initial?.stock ?? '');
  const [included, setIncluded] = useState<Record<string, boolean>>({});
  const [priceByPreset, setPriceByPreset] = useState<Record<string, number | ''>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const presetIdsKey = useMemo(() => presets.map((p) => p.id).join(','), [presets]);

  useEffect(() => {
    setFormTitle(initial?.title ?? '');
    setDescription(initial?.description ?? '');
    setPriceUzs(initial?.priceUzs ?? '');
    setImagesRaw((initial?.images ?? []).join('\n'));
    setStock(initial?.stock ?? '');
    setFormError(null);

    const inc: Record<string, boolean> = {};
    const pr: Record<string, number | ''> = {};
    for (const p of presets) {
      inc[p.id] = false;
      pr[p.id] = '';
    }
    if (initial?.sizes?.length) {
      for (const s of initial.sizes) {
        inc[s.presetId] = true;
        pr[s.presetId] = s.priceUzs;
      }
    }
    setIncluded(inc);
    setPriceByPreset(pr);
  }, [initial, presetIdsKey, presets]);

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
      <Divider label={t('products.sizesSection')} labelPosition="center" />
      <Text size="sm" c="dimmed">
        {t('products.sizesFromPresetsHint')}
      </Text>
      {presets.length === 0 ? (
        <Text size="sm" c="orange">
          {t('products.noPresetsWarning')}
        </Text>
      ) : (
        <Table withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th w={48} />
              <Table.Th>{t('products.sizeLabelCol')}</Table.Th>
              <Table.Th>{t('products.sizeGrams')}</Table.Th>
              <Table.Th miw={160}>{t('products.priceUzs')}</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {presets.map((preset) => (
              <Table.Tr key={preset.id}>
                <Table.Td>
                  <Checkbox
                    checked={included[preset.id] ?? false}
                    onChange={(e) => {
                      const next = e.currentTarget.checked;
                      setIncluded((prev) => ({
                        ...prev,
                        [preset.id]: next,
                      }));
                    }}
                  />
                </Table.Td>
                <Table.Td>
                  <Text size="sm" fw={500}>
                    {preset.label}{' '}
                    <Text span size="xs" c="dimmed">
                      ({preset.slug})
                    </Text>
                  </Text>
                </Table.Td>
                <Table.Td>{preset.grams}</Table.Td>
                <Table.Td>
                  <NumberInput
                    size="xs"
                    disabled={!included[preset.id]}
                    value={priceByPreset[preset.id] ?? ''}
                    onChange={(v) =>
                      setPriceByPreset((prev) => ({
                        ...prev,
                        [preset.id]: coerceSizeNumber(v),
                      }))
                    }
                    min={0}
                    allowDecimal={false}
                    thousandSeparator=" "
                  />
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}
      <NumberInput
        label={t('products.formPrice')}
        description={t('products.formPriceHintUzs')}
        value={priceUzs}
        onChange={(v) => setPriceUzs(v)}
        min={0}
        allowDecimal={false}
        thousandSeparator=" "
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
      {formError ? (
        <Text size="sm" c="red">
          {formError}
        </Text>
      ) : null}
      <Group justify="flex-end" mt="md">
        <Button variant="default" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button
          color="parfum"
          loading={submitting}
          onClick={() => {
            setFormError(null);
            if (!formTitle.trim()) return;

            const lines: Array<{ presetId: string; priceUzs: number }> = [];
            for (const preset of presets) {
              if (!included[preset.id]) continue;
              const raw = priceByPreset[preset.id];
              const pu =
                typeof raw === 'number' ? raw : raw === '' ? NaN : Number(raw);
              if (!Number.isFinite(pu) || pu < 0) {
                setFormError(t('products.priceRequiredForSelectedSizes'));
                return;
              }
              lines.push({ presetId: preset.id, priceUzs: Math.round(pu) });
            }

            const pcBase =
              typeof priceUzs === 'number' ? priceUzs : Number(priceUzs);
            if (lines.length === 0) {
              if (Number.isNaN(pcBase) || pcBase < 0) return;
            }
            const listing =
              lines.length > 0 ? Math.min(...lines.map((l) => l.priceUzs)) : pcBase;

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
              priceUzs: listing,
              sizes: lines,
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
  const { page, setPage, pageSize, setPageSize } = useListSearchParams(25);
  const { data, isLoading, error } = useGetProductsQuery({ page, pageSize });
  const { data: presetsData } = useGetSizePresetsQuery({ page: 1, pageSize: 100 });
  const presetList = presetsData?.items ?? [];
  const [createOpen, { open: openCreate, close: closeCreate }] = useDisclosure(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);

  const [createProduct, { isLoading: creating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: updating }] = useUpdateProductMutation();
  const [removeProduct, { isLoading: removing }] = useDeleteProductMutation();

  const total = data?.total ?? 0;
  const { totalPages, rangeStart, rangeEnd, effectivePage } = paginationFromTotal(
    total,
    page,
    pageSize,
  );

  useEffect(() => {
    if (page !== effectivePage) {
      setPage(effectivePage);
    }
  }, [page, effectivePage, setPage]);

  const rows = (data?.items ?? []).map((p) => (
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
      <Table.Td>{formatProductPriceColumn(p)}</Table.Td>
      <Table.Td>{variantCountLabel(p, t('common.dash'))}</Table.Td>
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
        <Button leftSection={<IconPlus size={18} />} color="parfum" onClick={openCreate}>
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
        <>
          <Table striped highlightOnHover withTableBorder>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>{t('products.colThumb')}</Table.Th>
                <Table.Th>{t('products.colProduct')}</Table.Th>
                <Table.Th>{t('products.colPrice')}</Table.Th>
                <Table.Th>{t('products.colVariants')}</Table.Th>
                <Table.Th>{t('products.colStock')}</Table.Th>
                <Table.Th w={120}>{t('products.colActions')}</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows}</Table.Tbody>
          </Table>
          {total > 0 ? (
            <TablePaginationFooter
              page={effectivePage}
              totalPages={totalPages}
              onPageChange={setPage}
              pageSize={pageSize}
              onPageSizeChange={setPageSize}
              rangeStart={rangeStart}
              rangeEnd={rangeEnd}
              totalItems={total}
            />
          ) : null}
        </>
      )}

      <Modal opened={createOpen} onClose={closeCreate} title={t('products.modalNew')} size="xl">
        <ProductFormFields
          key={createOpen ? 'create' : 'idle'}
          presets={presetList}
          initial={null}
          submitting={creating}
          onCancel={closeCreate}
          onSubmit={async (values) => {
            await createProduct({
              title: values.title,
              description: values.description || undefined,
              priceUzs: values.priceUzs,
              ...(values.sizes.length > 0 ? { sizes: values.sizes } : {}),
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

      <Modal opened={editing !== null} onClose={() => setEditing(null)} title={t('products.modalEdit')} size="xl">
        {editing ? (
          <ProductFormFields
            presets={presetList}
            initial={editing}
            submitting={updating}
            onCancel={() => setEditing(null)}
            onSubmit={async (values) => {
              await updateProduct({
                id: editing.id,
                body: {
                  title: values.title,
                  description: values.description,
                  priceUzs: values.priceUzs,
                  sizes: values.sizes.length > 0 ? values.sizes : [],
                  images: values.images,
                  stock: values.stock ?? null,
                },
              }).unwrap();
              setEditing(null);
            }}
          />
        ) : null}
      </Modal>

      <Modal opened={deleting !== null} onClose={() => setDeleting(null)} title={t('products.modalDelete')}>
        <Text size="sm">{t('products.deleteConfirm', { title: deleting?.title ?? '' })}</Text>
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
