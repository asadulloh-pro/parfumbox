import { Card, List, Spin, Typography } from 'antd';
import { useGetProductsQuery } from '@/shared/api/parfumApi';
import { Link } from 'react-router-dom';

const { Meta } = Card;
const { Paragraph } = Typography;

export function CatalogPage() {
  const { data, isLoading, isError } = useGetProductsQuery();

  if (isLoading) {
    return (
      <div style={{ padding: 48, textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (isError || !data?.length) {
    return (
      <Paragraph type="danger" style={{ padding: 24 }}>
        Could not load catalog. Try again later.
      </Paragraph>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      <Typography.Title level={3} style={{ marginTop: 0 }}>
        Shop
      </Typography.Title>
      <List
        grid={{ gutter: 16, xs: 1, sm: 2, md: 2 }}
        dataSource={data}
        renderItem={(p) => (
          <List.Item key={p.id}>
            <Link to={`/product/${encodeURIComponent(p.slug)}`}>
              <Card hoverable cover={p.imageUrl ? <img alt="" src={p.imageUrl} style={{ height: 200, objectFit: 'cover' }} /> : undefined}>
                <Meta
                  title={p.name}
                  description={
                    <>
                      <Paragraph ellipsis={{ rows: 2 }} style={{ marginBottom: 8 }}>
                        {p.description}
                      </Paragraph>
                      <strong>
                        {p.currency} {p.price}
                      </strong>
                    </>
                  }
                />
              </Card>
            </Link>
          </List.Item>
        )}
      />
    </div>
  );
}
