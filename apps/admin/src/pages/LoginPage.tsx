import { Button, Card, Form, Input, Typography, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useLoginMutation } from '@/api/adminApi';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { setToken } from '@/entities/session/model/sessionSlice';
import { useEffect } from 'react';

function formatApiError(err: unknown): string | null {
  if (!err || typeof err !== 'object' || !('data' in err)) return null;
  const data = (err as { data?: unknown }).data;
  if (!data || typeof data !== 'object') return null;
  const m = (data as { message?: unknown }).message;
  if (typeof m === 'string') return m;
  if (Array.isArray(m)) return m.filter(Boolean).join(', ');
  return null;
}

export function LoginPage() {
  const token = useAppSelector((s) => s.session.token);
  const nav = useNavigate();
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();

  useEffect(() => {
    if (token) {
      nav('/orders', { replace: true });
    }
  }, [token, nav]);

  const onFinish = async (values: { apiKey: string }) => {
    try {
      const res = await login({ apiKey: values.apiKey.trim() }).unwrap();
      dispatch(setToken(res.accessToken));
      message.success('Signed in');
      nav('/orders', { replace: true });
    } catch (err: unknown) {
      const text = formatApiError(err);
      message.error(
        text ??
          'Invalid API key or server error. Set ADMIN_API_KEY in the repo root .env (or apps/api/.env to override).',
      );
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: 'linear-gradient(160deg, #f5f5f5 0%, #e8e8e8 100%)',
      }}
    >
      <Card style={{ width: 400, maxWidth: '100%' }} title="Parfumbox admin">
        <Typography.Paragraph type="secondary">
          Enter the server <code>ADMIN_API_KEY</code> (not stored in the repo).
        </Typography.Paragraph>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="apiKey"
            label="API key"
            rules={[{ required: true, message: 'Required' }]}
          >
            <Input.Password placeholder="ADMIN_API_KEY" autoComplete="off" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={isLoading}>
              Sign in
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
