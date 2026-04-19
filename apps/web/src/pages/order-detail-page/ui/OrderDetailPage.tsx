import { Button, Spinner } from '@telegram-apps/telegram-ui';
import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetOrderQuery } from '../../../app/parfumApi';
import { useAppSelector } from '../../../app/hooks';
import { intlLocaleForLanguage } from '../../../i18n';
import { LanguageSwitcher } from '../../../features/i18n/LanguageSwitcher';
import { formatPrice } from '../../../shared/lib/money';

function formatWhen(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(new Date(iso));
}

export function OrderDetailPage() {
  const { t, i18n } = useTranslation();
  const locale = intlLocaleForLanguage(i18n.language);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const token = useAppSelector((s) => s.auth.accessToken);
  const { data: order, isLoading, isError } = useGetOrderQuery(id ?? '', {
    skip: !token || !id,
  });

  if (!token) {
    return (
      <div className="tma-page">
        <div style={{ marginBottom: 12 }}>
          <LanguageSwitcher />
        </div>
        <h1 className="page-title">{t('orderDetail.title')}</h1>
        <p className="page-placeholder">{t('orderDetail.needSignIn')}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="tma-page tma-page--centered">
        <Spinner size="l" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="tma-page">
        <div style={{ marginBottom: 12 }}>
          <LanguageSwitcher />
        </div>
        <h1 className="page-title">{t('orderDetail.title')}</h1>
        <p className="page-placeholder">{t('orderDetail.notFound')}</p>
        <Button
          mode="filled"
          size="m"
          stretched
          style={{ marginTop: 16 }}
          onClick={() => navigate('/orders')}
        >
          {t('orderDetail.backToOrders')}
        </Button>
      </div>
    );
  }

  return (
    <div className="tma-page">
      <div style={{ marginBottom: 12 }}>
        <LanguageSwitcher />
      </div>
      <p className="page-placeholder" style={{ marginBottom: 4 }}>
        {formatWhen(order.createdAt, locale)}
      </p>
      <h1 className="page-title" style={{ marginBottom: 8 }}>
        {t(`orderStatus.${order.status}`)}
      </h1>
      <p style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>
        {formatPrice(order.totalCents)}
      </p>
      {(order.deliveryPhone ||
        order.deliveryFirstName ||
        order.deliveryLastName) && (
        <SectionBlock title={t('orderDetail.delivery')}>
          {order.deliveryFirstName || order.deliveryLastName ? (
            <p style={{ margin: '0 0 8px' }}>
              {[order.deliveryFirstName, order.deliveryLastName]
                .filter(Boolean)
                .join(' ')}
            </p>
          ) : null}
          {order.deliveryPhone ? (
            <p style={{ margin: 0 }}>{order.deliveryPhone}</p>
          ) : null}
        </SectionBlock>
      )}
      <SectionBlock title={t('orderDetail.items')}>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {order.items.map((it) => (
            <li key={it.id} style={{ marginBottom: 8 }}>
              {it.titleSnapshot} × {it.quantity} —{' '}
              {formatPrice(it.unitPriceCents * it.quantity)}
            </li>
          ))}
        </ul>
      </SectionBlock>
      <Button
        mode="bezeled"
        size="m"
        stretched
        style={{ marginTop: 20 }}
        onClick={() => navigate('/orders')}
      >
        {t('orderDetail.allOrders')}
      </Button>
    </div>
  );
}

function SectionBlock({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section style={{ marginBottom: 20 }}>
      <h2
        style={{
          fontSize: 13,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: 'var(--pb-text-muted)',
          margin: '0 0 8px',
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}
