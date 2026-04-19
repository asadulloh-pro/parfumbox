import { Button, Spinner } from '@telegram-apps/telegram-ui';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetProductQuery } from '../../../app/parfumApi';
import { useAppDispatch } from '../../../app/hooks';
import { addOrMergeLine } from '../../../features/cart/cartSlice';
import { LanguageSwitcher } from '../../../features/i18n/LanguageSwitcher';
import { formatPrice } from '../../../shared/lib/money';

function productImageUrl(id: string, images: string[]): string {
  if (images.length > 0) {
    return images[0];
  }
  return `https://picsum.photos/seed/pb-${id}/800/800`;
}

export function ProductPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading, isError } = useGetProductQuery(id ?? '', {
    skip: !id,
  });

  if (isLoading) {
    return (
      <div className="tma-page tma-page--centered">
        <Spinner size="l" />
      </div>
    );
  }

  if (isError || !product || !id) {
    return (
      <div className="tma-page">
        <div style={{ marginBottom: 12 }}>
          <LanguageSwitcher />
        </div>
        <h1 className="page-title">{t('product.notFoundTitle')}</h1>
        <p className="page-placeholder">{t('product.notFoundBody')}</p>
        <Button
          mode="filled"
          size="m"
          stretched
          onClick={() => navigate('/')}
          style={{ marginTop: 16 }}
        >
          {t('product.backExplore')}
        </Button>
      </div>
    );
  }

  const stockLabel =
    product.stock === null || product.stock === undefined
      ? null
      : t('product.inStock', { count: product.stock });

  return (
    <div className="tma-page">
      <div style={{ marginBottom: 12 }}>
        <LanguageSwitcher />
      </div>
      <div
        style={{
          borderRadius: 'var(--pb-radius-md)',
          overflow: 'hidden',
          marginBottom: 16,
          border: '1px solid var(--pb-border)',
        }}
      >
        <img
          src={productImageUrl(product.id, product.images)}
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
      {stockLabel ? (
        <p className="page-placeholder" style={{ marginTop: 8 }}>
          {stockLabel}
        </p>
      ) : null}
      {product.description ? (
        <p style={{ marginTop: 12, lineHeight: 1.5 }}>{product.description}</p>
      ) : null}
      <Button
        mode="filled"
        size="l"
        stretched
        style={{ marginTop: 20 }}
        onClick={() => {
          dispatch(
            addOrMergeLine({
              productId: product.id,
              title: product.title,
              unitPriceCents: product.priceCents,
              imageUrl: product.images[0] ?? null,
              quantity: 1,
            }),
          );
          navigate('/cart');
        }}
      >
        {t('product.addToCart')}
      </Button>
    </div>
  );
}
