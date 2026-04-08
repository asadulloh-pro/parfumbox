import { Button, Descriptions, Space, Spin, Typography } from 'antd';
import { useParams } from 'react-router-dom';
import { useGetProductBySlugQuery } from '@/shared/api/parfumApi';
import { useAppDispatch } from '@/app/hooks';
import { addOne } from '@/entities/cart/model/cartSlice';
import { getTelegramWebApp } from '@/shared/lib/telegram';
import { useEffect } from 'react';

export function ProductPage() {
  const { slug = '' } = useParams();
  const { data, isLoading, isError } = useGetProductBySlugQuery(slug);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const twa = getTelegramWebApp();
    if (!data || !twa) return;
    twa.MainButton.setText('Add to cart');
    twa.MainButton.show();
    const onClick = () => {
      dispatch(
        addOne({
          productId: data.id,
          slug: data.slug,
          name: data.name,
          price: data.price,
          imageUrl: data.imageUrl,
          quantity: 1,
        }),
      );
      twa.MainButton.hideProgress();
    };
    twa.MainButton.onClick(onClick);
    return () => {
      twa.MainButton.offClick(onClick);
      twa.MainButton.hide();
    };
  }, [data, dispatch]);

  if (isLoading) {
    return (
      <div style={{ padding: 48, textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <Typography.Paragraph type="danger" style={{ padding: 24 }}>
        Product not found.
      </Typography.Paragraph>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      {data.imageUrl && (
        <img
          src={data.imageUrl}
          alt=""
          style={{ width: '100%', maxHeight: 320, objectFit: 'cover', borderRadius: 8 }}
        />
      )}
      <Typography.Title level={3}>{data.name}</Typography.Title>
      <Typography.Paragraph>{data.description}</Typography.Paragraph>
      <Descriptions column={1} size="small" bordered style={{ marginBottom: 16 }}>
        <Descriptions.Item label="Price">
          {data.currency} {data.price}
        </Descriptions.Item>
        {data.volumeMl != null && (
          <Descriptions.Item label="Volume">{data.volumeMl} ml</Descriptions.Item>
        )}
      </Descriptions>
      <Space>
        <Button
          type="primary"
          size="large"
          block
          onClick={() =>
            dispatch(
              addOne({
                productId: data.id,
                slug: data.slug,
                name: data.name,
                price: data.price,
                imageUrl: data.imageUrl,
                quantity: 1,
              }),
            )
          }
        >
          Add to cart
        </Button>
      </Space>
    </div>
  );
}
