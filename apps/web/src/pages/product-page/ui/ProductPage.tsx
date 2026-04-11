import { Button } from '@telegram-apps/telegram-ui';
import { useNavigate, useParams } from 'react-router-dom';
import {
  demoProducts,
  formatPrice,
} from '../../../shared/mocks/demo-products';

export function ProductPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const product = demoProducts.find((p) => p.id === id);

  if (!product) {
    return (
      <div className="tma-page">
        <h1 className="page-title">Not found</h1>
        <p className="page-placeholder">
          This demo item does not exist. Return to Explore.
        </p>
        <Button
          mode="filled"
          size="m"
          stretched
          onClick={() => navigate('/')}
          style={{ marginTop: 16 }}
        >
          Back to Explore
        </Button>
      </div>
    );
  }

  return (
    <div className="tma-page">
      <div
        style={{
          borderRadius: 'var(--pb-radius-md)',
          overflow: 'hidden',
          marginBottom: 16,
          border: '1px solid var(--pb-border)',
        }}
      >
        <img
          src={`https://picsum.photos/seed/${product.imageSeed}/800/800`}
          alt=""
          style={{ width: '100%', display: 'block', aspectRatio: '1' }}
        />
      </div>
      <h1 className="page-title" style={{ marginBottom: 8 }}>
        {product.title}
      </h1>
      <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--pb-gold-600)' }}>
        {formatPrice(product.priceCents)}
      </p>
      <p className="page-placeholder" style={{ marginTop: 12 }}>
        Product description and stock will load from the API. Add to cart will
        connect to Redux + RTK Query in a later step.
      </p>
      <Button mode="filled" size="l" stretched style={{ marginTop: 20 }}>
        Add to cart
      </Button>
    </div>
  );
}
