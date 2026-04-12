import { Spinner } from '@telegram-apps/telegram-ui';
import { Link } from 'react-router-dom';
import { useGetProductsQuery } from '../../../app/parfumApi';
import { formatPrice } from '../../../shared/lib/money';

function productImageUrl(id: string, images: string[]): string {
  if (images.length > 0) {
    return images[0];
  }
  return `https://picsum.photos/seed/pb-${id}/400/400`;
}

export function CatalogPage() {
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
        <h1 className="page-title">Catalog</h1>
        <p className="page-placeholder">
          Could not load products. Check that the API is running and
          VITE_API_BASE_URL is correct.
        </p>
      </div>
    );
  }

  return (
    <div className="tma-page">
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
