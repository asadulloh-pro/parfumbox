import {
  Button,
  Cell,
  List,
  Section,
  Spinner,
  Title,
} from '@telegram-apps/telegram-ui';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetProductQuery } from '../../../app/parfumApi';
import { useAppDispatch } from '../../../app/hooks';
import { addOrMergeLine } from '../../../features/cart/cartSlice';
import { LanguageSwitcher } from '../../../features/i18n/LanguageSwitcher';
import {
  DEFAULT_CART_SIZE_ID,
  type ProductSizeOption,
  sizeSavingsVsSmallest,
} from '../../../shared/lib/productSizes';
import { formatPrice } from '../../../shared/lib/money';

function productImageUrl(id: string, images: string[]): string {
  if (images.length > 0) {
    return images[0];
  }
  return `https://picsum.photos/seed/pb-${id}/800/800`;
}

function sortSizes(sizes: ProductSizeOption[]): ProductSizeOption[] {
  return [...sizes].sort((a, b) => a.grams - b.grams);
}

export function ProductPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading, isError } = useGetProductQuery(id ?? '', {
    skip: !id,
  });

  const sizeOptions = useMemo(
    () => (product?.sizes?.length ? sortSizes(product.sizes) : []),
    [product?.sizes],
  );

  const [selectedSizeId, setSelectedSizeId] = useState<string>('');

  useEffect(() => {
    if (sizeOptions.length > 0) {
      setSelectedSizeId(sizeOptions[0]!.id);
    } else {
      setSelectedSizeId('');
    }
  }, [product?.id, sizeOptions]);

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

  const hasSizes = sizeOptions.length > 0;
  const selected = hasSizes
    ? sizeOptions.find((s) => s.id === selectedSizeId) ?? sizeOptions[0]!
    : null;

  const displayPriceUzs = hasSizes
    ? selected!.priceUzs
    : product.priceUzs;

  const savings =
    hasSizes && selected
      ? sizeSavingsVsSmallest(selected, sizeOptions)
      : null;

  const stockCount = product.stock;
  const trackedStock = stockCount !== null && stockCount !== undefined;
  const outOfStock = trackedStock && stockCount <= 0;

  const stockLabel = !trackedStock
    ? null
    : outOfStock
      ? t('product.outOfStock')
      : t('product.inStock', { count: stockCount });

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
      <Title weight="1" style={{ marginBottom: 4 }}>
        {product.title}
      </Title>

      <div className="product-detail-stack">
        {hasSizes ? (
          <Section header={t('product.sizeLabel')}>
            <List>
              {sizeOptions.map((s) => {
                const active = s.id === selectedSizeId;
                return (
                  <Cell
                    key={s.id}
                    interactiveAnimation="background"
                    onClick={() => setSelectedSizeId(s.id)}
                    subtitle={t('product.sizeRowMeta', {
                      price: formatPrice(s.priceUzs),
                      grams: s.grams,
                    })}
                    after={
                      active ? (
                        <span style={{ fontWeight: 700, color: 'var(--tgui--link_color, #2481cc)' }}>
                          ✓
                        </span>
                      ) : null
                    }
                  >
                    {s.label}
                  </Cell>
                );
              })}
            </List>
          </Section>
        ) : null}

        <section className="product-detail-price-card" aria-labelledby="product-price-heading">
          <p id="product-price-heading" className="product-detail-price-card__label">
            {hasSizes ? t('product.selectedPriceTitle') : t('product.basePriceTitle')}
          </p>
          <Title
            level="2"
            weight="2"
            className="product-detail-price-card__amount"
            style={{ color: 'var(--pb-gold-600)' }}
          >
            {formatPrice(displayPriceUzs)}
          </Title>

          {savings ? (
            <div className="product-detail-savings">
              <p className="product-detail-savings__eyebrow">{t('product.savingsLabel')}</p>
              <ul className="product-detail-savings__list">
                <li>{t('product.savingsPerGram', { amount: formatPrice(savings.perGramUzs) })}</li>
                <li>{t('product.savingsTotal', { amount: formatPrice(savings.totalUzs) })}</li>
              </ul>
            </div>
          ) : null}
        </section>

        {stockLabel ? (
          <Section header={t('product.stockSectionTitle')}>
            <List>
              <Cell>{stockLabel}</Cell>
            </List>
          </Section>
        ) : null}

        {product.description ? (
          <Section header={t('product.descriptionTitle')}>
            <div className="product-detail-desc">{product.description}</div>
          </Section>
        ) : null}
      </div>

      <Button
        mode="filled"
        size="l"
        stretched
        disabled={outOfStock}
        style={{ marginTop: 18 }}
        onClick={() => {
          if (outOfStock) return;
          if (hasSizes && !selected) return;
          const sizeId = hasSizes && selected ? selected.id : DEFAULT_CART_SIZE_ID;
          const sizeLabel = hasSizes && selected ? selected.label : null;
          dispatch(
            addOrMergeLine({
              productId: product.id,
              sizeId,
              title: product.title,
              sizeLabel,
              unitPriceUzs: displayPriceUzs,
              imageUrl: product.images[0] ?? null,
              quantity: 1,
            }),
          );
          navigate('/cart');
        }}
      >
        {outOfStock ? t('product.unavailable') : t('product.addToCart')}
      </Button>
    </div>
  );
}
