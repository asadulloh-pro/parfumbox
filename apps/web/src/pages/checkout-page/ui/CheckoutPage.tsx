import { Button, Form, Input, Radio, Typography, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { clearCart } from '@/entities/cart/model/cartSlice';
import { useCreateOrderMutation } from '@/shared/api/parfumApi';
import { getTelegramWebApp } from '@/shared/lib/telegram';
import { useEffect } from 'react';

type FormValues = {
  paymentMethod: 'cod' | 'bank_transfer';
  deliveryPhone: string;
  deliveryAddress: string;
  deliveryComment?: string;
};

export function CheckoutPage() {
  const items = useAppSelector((s) => s.cart.items);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [form] = Form.useForm<FormValues>();
  const [createOrder, { isLoading }] = useCreateOrderMutation();

  useEffect(() => {
    const twa = getTelegramWebApp();
    if (!twa || !items.length) return;
    twa.MainButton.setText('Place order');
    twa.MainButton.show();
    const onClick = () => form.submit();
    twa.MainButton.onClick(onClick);
    return () => {
      twa.MainButton.offClick(onClick);
      twa.MainButton.hide();
    };
  }, [form, items.length]);

  if (!items.length) {
    return (
      <div style={{ padding: 24 }}>
        <Typography.Paragraph>Your cart is empty.</Typography.Paragraph>
        <Button type="primary" onClick={() => navigate('/')}>
          Browse catalog
        </Button>
      </div>
    );
  }

  const onFinish = async (values: FormValues) => {
    try {
      await createOrder({
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
        paymentMethod: values.paymentMethod,
        deliveryPhone: values.deliveryPhone,
        deliveryAddress: values.deliveryAddress,
        deliveryComment: values.deliveryComment,
      }).unwrap();
      dispatch(clearCart());
      message.success('Order placed');
      navigate('/orders');
    } catch {
      message.error('Could not place order. Sign in via Telegram or try again.');
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <Typography.Title level={4}>Checkout</Typography.Title>
      <Typography.Paragraph type="secondary">
        Payment: cash on delivery or bank transfer (no online payment in this version).
      </Typography.Paragraph>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ paymentMethod: 'cod' as const }}
      >
        <Form.Item
          name="paymentMethod"
          label="Payment method"
          rules={[{ required: true }]}
        >
          <Radio.Group>
            <Radio.Button value="cod">Cash on delivery</Radio.Button>
            <Radio.Button value="bank_transfer">Bank transfer</Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          name="deliveryPhone"
          label="Phone"
          rules={[{ required: true, message: 'Phone is required' }]}
        >
          <Input placeholder="+1 …" />
        </Form.Item>
        <Form.Item
          name="deliveryAddress"
          label="Delivery address"
          rules={[{ required: true, message: 'Address is required' }]}
        >
          <Input.TextArea rows={3} />
        </Form.Item>
        <Form.Item name="deliveryComment" label="Comment (optional)">
          <Input.TextArea rows={2} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block size="large" loading={isLoading}>
            Place order
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
