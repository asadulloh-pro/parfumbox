import { Button, Input, Spinner } from '@telegram-apps/telegram-ui';
import { initDataUser, type User as TelegramInitUser } from '@telegram-apps/sdk';
import { useSignal } from '@telegram-apps/sdk-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  useCreateOrderMutation,
  useGetMeQuery,
  type UserProfile,
} from '../../../app/parfumApi';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import type { TelegramAuthUser } from '../../../features/auth/authSlice';
import type { CartLine } from '../../../features/cart/cartSlice';
import { clearCart } from '../../../features/cart/cartSlice';
import { useTelegramSession } from '../../../features/session/telegramSessionContext';
import { LanguageSwitcher } from '../../../features/i18n/LanguageSwitcher';
import { DEFAULT_CART_SIZE_ID } from '../../../shared/lib/productSizes';
import { formatPrice } from '../../../shared/lib/money';

function toDateInputValue(iso: string | null | undefined): string {
  if (!iso) return '';
  return iso.slice(0, 10);
}

/** Prefer saved profile; fill gaps from Telegram Web App initData / auth exchange payload. */
function mergeCheckoutProfile(
  me: UserProfile | undefined,
  authUser: TelegramAuthUser | null,
  tgUser: TelegramInitUser | undefined,
): UserProfile | null {
  const tgFirst =
    tgUser?.first_name?.trim() ||
    authUser?.firstName?.trim() ||
    null;
  const tgLast =
    tgUser?.last_name?.trim() ||
    authUser?.lastName?.trim() ||
    null;
  const tgUsername =
    tgUser?.username?.trim() ||
    authUser?.telegramUsername?.trim() ||
    null;
  const telegramId =
    authUser?.telegramId ??
    (tgUser?.id != null ? String(tgUser.id) : null);

  if (me) {
    return {
      ...me,
      firstName: me.firstName?.trim() ? me.firstName : tgFirst,
      lastName: me.lastName?.trim() ? me.lastName : tgLast,
      telegramUsername: me.telegramUsername ?? tgUsername,
    };
  }

  if (!authUser?.id || !telegramId) return null;

  return {
    id: authUser.id,
    telegramId,
    telegramUsername: tgUsername,
    firstName: tgFirst,
    lastName: tgLast,
    locale: authUser.locale ?? 'uz',
    phone: null,
    birthDate: null,
    createdAt: '',
    updatedAt: '',
  };
}

function errorMessage(
  err: unknown,
  t: (key: string) => string,
): string {
  if (err && typeof err === 'object' && 'data' in err) {
    const data = err.data;
    if (data && typeof data === 'object' && 'message' in data) {
      const m = (data as { message: unknown }).message;
      if (typeof m === 'string') return m;
      if (Array.isArray(m)) return m.map(String).join(', ');
    }
  }
  if (
    err &&
    typeof err === 'object' &&
    'status' in err &&
    err.status === 'FETCH_ERROR'
  ) {
    return t('checkout.networkError');
  }
  return t('checkout.genericError');
}

function CheckoutForm({
  me,
  cartItems,
}: {
  me: UserProfile;
  cartItems: CartLine[];
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [phone, setPhone] = useState(me.phone ?? '');
  const [firstName, setFirstName] = useState(me.firstName ?? '');
  const [lastName, setLastName] = useState(me.lastName ?? '');
  const [birthDate, setBirthDate] = useState(toDateInputValue(me.birthDate));

  const [createOrder, { isLoading: submitting, error }] =
    useCreateOrderMutation();

  const subtotal = cartItems.reduce(
    (sum, line) => sum + line.unitPriceUzs * line.quantity,
    0,
  );

  return (
    <div className="tma-page">
      <div style={{ marginBottom: 12 }}>
        <LanguageSwitcher />
      </div>
      <h1 className="page-title">{t('checkout.title')}</h1>
      <p className="page-placeholder" style={{ marginBottom: 16 }}>
        {t('checkout.hint')}
      </p>
      <div className="form-stack">
        <div className="form-field">
          <label htmlFor="co-phone">{t('checkout.phone')}</label>
          <Input
            id="co-phone"
            type="tel"
            placeholder={t('checkout.phonePlaceholder')}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div className="form-field">
          <label htmlFor="co-first">{t('checkout.firstName')}</label>
          <Input
            id="co-first"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>
        <div className="form-field">
          <label htmlFor="co-last">{t('checkout.lastName')}</label>
          <Input
            id="co-last"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
        <div className="form-field">
          <label htmlFor="co-birth">{t('checkout.birthday')}</label>
          <Input
            id="co-birth"
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
          />
        </div>
      </div>
      {error ? (
        <p className="page-placeholder" style={{ color: 'var(--pb-danger, #b42318)' }}>
          {errorMessage(error, t)}
        </p>
      ) : null}
      <Button
        mode="filled"
        size="l"
        stretched
        loading={submitting}
        disabled={submitting}
        onClick={() => {
          void (async () => {
            try {
              const res = await createOrder({
                items: cartItems.map((l) => ({
                  productId: l.productId,
                  quantity: l.quantity,
                  ...(l.sizeId !== DEFAULT_CART_SIZE_ID
                    ? { sizeId: l.sizeId }
                    : {}),
                })),
                deliveryPhone: phone.trim() || undefined,
                deliveryFirstName: firstName.trim() || undefined,
                deliveryLastName: lastName.trim() || undefined,
                birthDate: birthDate.trim() || undefined,
              }).unwrap();
              dispatch(clearCart());
              navigate(`/orders/${res.id}`);
            } catch {
              /* mutation error surface via `error` */
            }
          })();
        }}
      >
        {t('checkout.placeOrder')} · {formatPrice(subtotal)}
      </Button>
    </div>
  );
}

export function CheckoutPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const token = useAppSelector((s) => s.auth.accessToken);
  const authUser = useAppSelector((s) => s.auth.user);
  const cartItems = useAppSelector((s) => s.cart.items);
  const { isTelegramAuthPending, telegramSignInError } = useTelegramSession();
  const tgSdkUser = useSignal(initDataUser);

  const { data: me, isLoading: meLoading } = useGetMeQuery(undefined, {
    skip: !token,
  });

  const checkoutProfile = useMemo(
    () => mergeCheckoutProfile(me, authUser, tgSdkUser ?? undefined),
    [me, authUser, tgSdkUser],
  );

  if (!token) {
    if (isTelegramAuthPending) {
      return (
        <div className="tma-page tma-page--centered">
          <Spinner size="l" />
        </div>
      );
    }
    return (
      <div className="tma-page">
        <div style={{ marginBottom: 12 }}>
          <LanguageSwitcher />
        </div>
        <h1 className="page-title">{t('checkout.title')}</h1>
        {telegramSignInError ? (
          <p
            className="page-placeholder"
            style={{ color: 'var(--pb-danger, #b42318)', marginBottom: 12 }}
          >
            {telegramSignInError}
          </p>
        ) : null}
        <p className="page-placeholder">{t('checkout.needTelegram')}</p>
        <p className="page-placeholder">{t('checkout.devHint')}</p>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="tma-page">
        <div style={{ marginBottom: 12 }}>
          <LanguageSwitcher />
        </div>
        <h1 className="page-title">{t('checkout.title')}</h1>
        <p className="page-placeholder">{t('checkout.cartEmpty')}</p>
        <Button
          mode="filled"
          size="m"
          stretched
          style={{ marginTop: 16 }}
          onClick={() => navigate('/')}
        >
          {t('checkout.browseCatalog')}
        </Button>
      </div>
    );
  }

  if (meLoading && !checkoutProfile) {
    return (
      <div className="tma-page tma-page--centered">
        <Spinner size="l" />
      </div>
    );
  }

  if (!checkoutProfile) {
    return (
      <div className="tma-page">
        <div style={{ marginBottom: 12 }}>
          <LanguageSwitcher />
        </div>
        <h1 className="page-title">{t('checkout.title')}</h1>
        <p className="page-placeholder">{t('checkout.profileLoadError')}</p>
      </div>
    );
  }

  return (
    <CheckoutForm
      key={me ? `${me.id}:${me.updatedAt}` : `${checkoutProfile.id}:telegram`}
      me={checkoutProfile}
      cartItems={cartItems}
    />
  );
}
