import { UploadOutlined } from '@ant-design/icons';
import { Button, Form, Input, Space, Upload, message } from 'antd';
import type { FormInstance } from 'antd/es/form';
import { useAppSelector } from '@/app/hooks';

type Props = {
  form: FormInstance;
};

export function ImageUrlField({ form }: Props) {
  const token = useAppSelector((s) => s.session.token);

  return (
    <Form.Item label="Image">
      <Space direction="vertical" style={{ width: '100%' }}>
        <Upload
          maxCount={1}
          accept="image/jpeg,image/png,image/webp,image/gif"
          showUploadList={false}
          beforeUpload={() => false}
          customRequest={async ({ file, onSuccess, onError }) => {
            if (!token) {
              message.error('Not signed in');
              onError?.(new Error('no token'));
              return;
            }
            const fd = new FormData();
            fd.append('file', file as File);
            try {
              const base = import.meta.env.VITE_API_URL ?? '';
              const res = await fetch(`${base}/api/admin/upload`, {
                method: 'POST',
                headers: { authorization: `Bearer ${token}` },
                body: fd,
              });
              if (!res.ok) {
                const err = (await res.json().catch(() => null)) as {
                  message?: string | string[];
                } | null;
                const msg = Array.isArray(err?.message)
                  ? err.message.join(', ')
                  : err?.message ?? res.statusText;
                throw new Error(msg);
              }
              const data = (await res.json()) as { url: string };
              form.setFieldValue('imageUrl', data.url);
              message.success('Image uploaded');
              onSuccess?.(data);
            } catch (e) {
              message.error(e instanceof Error ? e.message : 'Upload failed');
              onError?.(e instanceof Error ? e : new Error('Upload failed'));
            }
          }}
        >
          <Button icon={<UploadOutlined />}>Upload image</Button>
        </Upload>
        <TypographyHint />
        <Form.Item name="imageUrl" noStyle>
          <Input placeholder="https://… or upload above (max 5 MB)" />
        </Form.Item>
        <Form.Item shouldUpdate noStyle>
          {() => {
            const url = form.getFieldValue('imageUrl') as string | undefined;
            return url ? (
              <img
                src={url}
                alt=""
                style={{
                  maxWidth: '100%',
                  maxHeight: 140,
                  objectFit: 'contain',
                  borderRadius: 8,
                }}
              />
            ) : null;
          }}
        </Form.Item>
      </Space>
    </Form.Item>
  );
}

function TypographyHint() {
  return (
    <span style={{ fontSize: 12, color: 'var(--ant-color-text-secondary)' }}>
      JPEG, PNG, WebP, or GIF. You can still paste an external URL instead.
    </span>
  );
}
