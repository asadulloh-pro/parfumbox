import { Spinner } from '@telegram-apps/telegram-ui';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import type { Product } from '../../../app/parfumApi';
import {
  getParfumApiBaseUrl,
  useGetProductsQuery,
} from '../../../app/parfumApi';
import { LanguageSwitcher } from '../../../features/i18n/LanguageSwitcher';
import { catalogListingDisplay } from '../../../shared/lib/productSizes';
import { formatPrice } from '../../../shared/lib/money';

const PAGE_SIZE = 20;

function productImageUrl(id: string, images: string[] | undefined): string {
  if (images?.length) {
    return images[0];
  }
  return `https://picsum.photos/seed/pb-${id}/400/400`;
}

export function CatalogPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Product[]>([]);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const { data, isLoading, isError, isFetching } = useGetProductsQuery({
    page,
    pageSize: PAGE_SIZE,
  });

  useLayoutEffect(() => {
    if (!data) return;
    const pageItems = data.items ?? [];
    setItems((prev) =>
      page === 1 ? pageItems : [...(prev ?? []), ...pageItems],
    );
  }, [data, page]);

  const catalogItems = items ?? [];
  const hasMore = (data?.total ?? 0) > catalogItems.length;
  const showInitialLoader = isLoading && catalogItems.length === 0;

  const loadMore = useCallback(() => {
    if (!hasMore || isFetching) return;
    setPage((p) => p + 1);
  }, [hasMore, isFetching]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const ob = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: '280px' },
    );
    ob.observe(el);
    return () => ob.disconnect();
  }, [loadMore]);

  if (showInitialLoader) {
    return (
      <div className="tma-page tma-page--centered">
        <Spinner size="l" />
      </div>
    );
  }

  if (isError || !data) {
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

  if ((data.total ?? 0) === 0 && data.items.length === 0) {
    return (
      <div className="tma-page">
        <div style={{ marginBottom: 12 }}>
          <LanguageSwitcher />
        </div>
        <p className="page-placeholder">{t('catalog.empty')}</p>
      </div>
    );
  }

  return (
    <div className="tma-page">
      <div style={{ marginBottom: 12 }}>
        <LanguageSwitcher />
      </div>
      <div className="explore-grid">
        {catalogItems.map((p) => {
          const list = catalogListingDisplay(p.priceUzs, p.sizes);
          return (
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
                  {list.showFromPrefix ? (
                    <>
                      {t('catalog.from')}{' '}
                      <span style={{ whiteSpace: 'nowrap' }}>
                        {formatPrice(list.displayPrice)}
                      </span>
                    </>
                  ) : (
                    formatPrice(list.displayPrice)
                  )}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
      {hasMore ? (
        <div
          ref={sentinelRef}
          className="tma-page--centered"
          style={{ padding: '16px 0', minHeight: 1 }}
          aria-hidden
        />
      ) : null}
      {isFetching && catalogItems.length > 0 ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 16 }}>
          <Spinner size="m" />
        </div>
      ) : null}
    </div>
  );
}
