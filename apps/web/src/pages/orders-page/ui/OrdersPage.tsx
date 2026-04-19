import { Spinner } from '@telegram-apps/telegram-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useListOrdersQuery } from '../../../app/parfumApi';
import { useAppSelector } from '../../../app/hooks';
import { intlLocaleForLanguage } from '../../../i18n';
import { LanguageSwitcher } from '../../../features/i18n/LanguageSwitcher';
import { formatPrice } from '../../../shared/lib/money';

function formatWhen(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso));
}

export function OrdersPage() {
  const { t, i18n } = useTranslation();
  const locale = intlLocaleForLanguage(i18n.language);
  const token = useAppSelector((s) => s.auth.accessToken);
  const { data: orders, isLoading, isError } = useListOrdersQuery(undefined, {
    skip: !token,
  });

  if (!token) {
    return (
      <div className="tma-page">
        <div style={{ marginBottom: 12 }}>
          <LanguageSwitcher />
        </div>
        <h1 className="page-title">{t('orders.title')}</h1>
        <p className="page-placeholder">{t('orders.needTelegram')}</p>
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

  if (isError || !orders) {
    return (
      <div className="tma-page">
        <div style={{ marginBottom: 12 }}>
          <LanguageSwitcher />
        </div>
        <h1 className="page-title">{t('orders.title')}</h1>
        <p className="page-placeholder">{t('orders.loadError')}</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="tma-page">
        <div style={{ marginBottom: 12 }}>
          <LanguageSwitcher />
        </div>
        <h1 className="page-title">{t('orders.title')}</h1>
        <p className="page-placeholder">{t('orders.empty')}</p>
      </div>
    );
  }

  return (
    <div className="tma-page">
      <div style={{ marginBottom: 12 }}>
        <LanguageSwitcher />
      </div>
      <h1 className="page-title">{t('orders.title')}</h1>
      <ul className="orders-list">
        {orders.map((o) => (
          <li key={o.id}>
            <Link to={`/orders/${o.id}`} className="orders-row">
              <div className="orders-row__meta">
                <span className="orders-row__id">{formatWhen(o.createdAt, locale)}</span>
                <span className="order-status">
                  {t(`orderStatus.${o.status}`)}
                </span>
              </div>
              <div style={{ marginTop: 8, fontWeight: 600 }}>
                {formatPrice(o.totalCents)}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
