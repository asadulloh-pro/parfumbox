import {
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Space,
  Switch,
  Table,
  Typography,
  message,
} from 'antd';
import type { TableProps } from 'antd';
import { useState } from 'react';
import {
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  type ProductRow,
} from '@/api/adminApi';
import { ImageUrlField } from '@/features/product-image/ui/ImageUrlField';

type FormValues = {
  slug: string;
  name: string;
  description?: string;
  price: string;
  currency?: string;
  imageUrl?: string;
  volumeMl?: number;
  stock?: number;
  isActive?: boolean;
};

export function ProductsPage() {
  const { data, isLoading, refetch } = useGetProductsQuery();
  const [createModal, setCreateModal] = useState(false);
  const [editRow, setEditRow] = useState<ProductRow | null>(null);
  const [formCreate] = Form.useForm<FormValues>();
  const [formEdit] = Form.useForm<FormValues>();
  const [createProduct, { isLoading: creating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: updating }] = useUpdateProductMutation();
  const [deleteProduct, { isLoading: deleting }] = useDeleteProductMutation();

  const openCreate = () => {
    formCreate.resetFields();
    formCreate.setFieldsValue({
      currency: 'USD',
      isActive: true,
    });
    setCreateModal(true);
  };

  const openEdit = (row: ProductRow) => {
    setEditRow(row);
    formEdit.setFieldsValue({
      slug: row.slug,
      name: row.name,
      description: row.description ?? undefined,
      price: row.price,
      currency: row.currency,
      imageUrl: row.imageUrl ?? undefined,
      volumeMl: row.volumeMl ?? undefined,
      stock: row.stock ?? undefined,
      isActive: row.isActive,
    });
  };

  const submitCreate = async () => {
    const v = await formCreate.validateFields();
    try {
      await createProduct({
        slug: v.slug,
        name: v.name,
        description: v.description,
        price: v.price,
        currency: v.currency,
        imageUrl: v.imageUrl,
        volumeMl: v.volumeMl,
        stock: v.stock,
        isActive: v.isActive,
      }).unwrap();
      message.success('Product created');
      setCreateModal(false);
      void refetch();
    } catch {
      message.error('Create failed');
    }
  };

  const submitEdit = async () => {
    if (!editRow) return;
    const v = await formEdit.validateFields();
    try {
      await updateProduct({
        id: editRow.id,
        patch: {
          slug: v.slug,
          name: v.name,
          description: v.description,
          price: v.price,
          currency: v.currency,
          imageUrl: v.imageUrl,
          volumeMl: v.volumeMl,
          stock: v.stock,
          isActive: v.isActive,
        },
      }).unwrap();
      message.success('Saved');
      setEditRow(null);
      void refetch();
    } catch {
      message.error('Update failed');
    }
  };

  const onDelete = (row: ProductRow) => {
    Modal.confirm({
      title: 'Deactivate product?',
      content: 'This sets isActive to false (soft delete).',
      okText: 'Deactivate',
      okButtonProps: { danger: true, loading: deleting },
      onOk: async () => {
        await deleteProduct(row.id).unwrap();
        message.success('Deactivated');
        void refetch();
      },
    });
  };

  const columns: TableProps<ProductRow>['columns'] = [
    { title: 'Slug', dataIndex: 'slug', width: 200, ellipsis: true },
    {
      title: 'Image',
      key: 'img',
      width: 72,
      render: (_, row) =>
        row.imageUrl ? (
          <img
            src={row.imageUrl}
            alt=""
            style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 4 }}
          />
        ) : (
          '—'
        ),
    },
    { title: 'Name', dataIndex: 'name', ellipsis: true },
    {
      title: 'Price',
      key: 'price',
      width: 120,
      render: (_, row) => `${row.currency} ${row.price}`,
    },
    { title: 'Stock', dataIndex: 'stock', width: 80 },
    {
      title: 'Active',
      dataIndex: 'isActive',
      width: 80,
      render: (v: boolean) => (v ? 'Yes' : 'No'),
    },
    {
      title: 'Actions',
      key: 'a',
      width: 180,
      render: (_, row) => (
        <Space>
          <Button type="link" size="small" onClick={() => openEdit(row)}>
            Edit
          </Button>
          <Button type="link" size="small" danger onClick={() => onDelete(row)}>
            Deactivate
          </Button>
        </Space>
      ),
    },
  ];

  const productFormCreate = (
    <Form form={formCreate} layout="vertical">
      <Form.Item name="slug" label="Slug" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="name" label="Name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="description" label="Description">
        <Input.TextArea rows={3} />
      </Form.Item>
      <Form.Item name="price" label="Price" rules={[{ required: true }]}>
        <Input placeholder="49.99" />
      </Form.Item>
      <Form.Item name="currency" label="Currency">
        <Input placeholder="USD" />
      </Form.Item>
      <ImageUrlField form={formCreate} />
      <Form.Item name="volumeMl" label="Volume (ml)">
        <InputNumber min={0} style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item name="stock" label="Stock">
        <InputNumber min={0} style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item name="isActive" label="Active" valuePropName="checked">
        <Switch />
      </Form.Item>
    </Form>
  );

  const productFormEdit = (
    <Form form={formEdit} layout="vertical">
      <Form.Item name="slug" label="Slug" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="name" label="Name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="description" label="Description">
        <Input.TextArea rows={3} />
      </Form.Item>
      <Form.Item name="price" label="Price" rules={[{ required: true }]}>
        <Input placeholder="49.99" />
      </Form.Item>
      <Form.Item name="currency" label="Currency">
        <Input placeholder="USD" />
      </Form.Item>
      <ImageUrlField form={formEdit} />
      <Form.Item name="volumeMl" label="Volume (ml)">
        <InputNumber min={0} style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item name="stock" label="Stock">
        <InputNumber min={0} style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item name="isActive" label="Active" valuePropName="checked">
        <Switch />
      </Form.Item>
    </Form>
  );

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Typography.Title level={4} style={{ margin: 0 }}>
          Products
        </Typography.Title>
        <Button type="primary" onClick={openCreate}>
          Add product
        </Button>
      </Space>
      <Table<ProductRow>
        rowKey="id"
        loading={isLoading}
        columns={columns}
        dataSource={data}
        scroll={{ x: true }}
      />

      <Modal
        title="New product"
        open={createModal}
        onCancel={() => setCreateModal(false)}
        onOk={submitCreate}
        confirmLoading={creating}
        destroyOnClose
        width={560}
      >
        {productFormCreate}
      </Modal>

      <Modal
        title="Edit product"
        open={!!editRow}
        onCancel={() => setEditRow(null)}
        onOk={submitEdit}
        confirmLoading={updating}
        destroyOnClose
        width={560}
      >
        {productFormEdit}
      </Modal>
    </div>
  );
}
