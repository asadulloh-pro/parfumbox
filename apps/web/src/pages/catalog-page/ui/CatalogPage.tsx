import { Spinner } from '@telegram-apps/telegram-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  getParfumApiBaseUrl,
  useGetProductsQuery,
} from '../../../app/parfumApi';
import { LanguageSwitcher } from '../../../features/i18n/LanguageSwitcher';
import { formatPrice } from '../../../shared/lib/money';

function productImageUrl(id: string, images: string[]): string {
  if (images.length > 0) {
    return images[0];
  }
  return `https://picsum.photos/seed/pb-${id}/400/400`;
}

export function CatalogPage() {
  const { t } = useTranslation();
  const { data: products, isLoading, isError } = useGetProductsQuery();

  if (isLoading) {
    return (
      <div className="tma-page tma-page--centered">
        <Spinner size="l" />
      </div>
    );
  }

  if (isError || !products) {
    return (
      <div className="tma-page">
        <div style={{ marginBottom: 12 }}>
          <LanguageSwitcher />
        </div>
        <h1 className="page-title">{t('catalog.loadErrorTitle')}</h1>
        <p className="page-placeholder">
          {t('catalog.loadError', { url: getParfumApiBaseUrl() })}
        </p>
      </div>
    );
  }

  return (
    <div className="tma-page">
      <div style={{ marginBottom: 12 }}>
        <LanguageSwitcher />
      </div>
      <div className="explore-grid">
        {products.map((p) => (
          <Link key={p.id} to={`/product/${p.id}`} className="explore-card">
            <div className="explore-card__media">
              <img
                src={productImageUrl(p.id, p.images)}
                alt=""
                loading="lazy"
              />
            </div>
            <div className="explore-card__meta">
              <span className="explore-card__title">{p.title}</span>
              <span className="explore-card__price">
                {formatPrice(p.priceCents)}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
