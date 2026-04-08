import { Button, Empty, InputNumber, List, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { removeLine, setQuantity } from '@/entities/cart/model/cartSlice';
import { getTelegramWebApp } from '@/shared/lib/telegram';
import { useEffect } from 'react';

export function CartPage() {
  const items = useAppSelector((s) => s.cart.items);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const twa = getTelegramWebApp();
    if (!twa) return;
    if (items.length > 0) {
      twa.MainButton.setText('Checkout');
      twa.MainButton.show();
      const onClick = () => navigate('/checkout');
      twa.MainButton.onClick(onClick);
      return () => {
        twa.MainButton.offClick(onClick);
        twa.MainButton.hide();
      };
    }
    twa.MainButton.hide();
    return undefined;
  }, [items.length, navigate]);

  if (!items.length) {
    return (
      <div style={{ padding: 24 }}>
        <Empty description="Cart is empty" />
      </div>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      <Typography.Title level={4}>Cart</Typography.Title>
      <List
        itemLayout="vertical"
        dataSource={items}
        renderItem={(item) => (
          <List.Item
            key={item.productId}
            extra={
              item.imageUrl ? (
                <img width={80} alt="" src={item.imageUrl} style={{ borderRadius: 8 }} />
              ) : null
            }
          >
            <List.Item.Meta
              title={item.name}
              description={
                <>
                  <div>
                    {item.price} ×{' '}
                    <InputNumber
                      min={1}
                      max={99}
                      value={item.quantity}
                      onChange={(v) =>
                        dispatch(
                          setQuantity({
                            productId: item.productId,
                            quantity: typeof v === 'number' ? v : 1,
                          }),
                        )
                      }
                    />
                  </div>
                  <Button danger type="link" onClick={() => dispatch(removeLine(item.productId))}>
                    Remove
                  </Button>
                </>
              }
            />
          </List.Item>
        )}
      />
      <Button type="primary" block size="large" onClick={() => navigate('/checkout')}>
        Checkout
      </Button>
    </div>
  );
}
