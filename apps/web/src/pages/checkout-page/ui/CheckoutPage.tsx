import { Button, Input, Spinner } from '@telegram-apps/telegram-ui';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useCreateOrderMutation,
  useGetMeQuery,
  type UserProfile,
} from '../../../app/parfumApi';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import type { CartLine } from '../../../features/cart/cartSlice';
import { clearCart } from '../../../features/cart/cartSlice';

function toDateInputValue(iso: string | null | undefined): string {
  if (!iso) return '';
  return iso.slice(0, 10);
}

function errorMessage(err: unknown): string {
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
    return 'Network error — is the API running?';
  }
  return 'Could not place order. Try again.';
}

function CheckoutForm({
  me,
  cartItems,
}: {
  me: UserProfile;
  cartItems: CartLine[];
}) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [phone, setPhone] = useState(me.phone ?? '');
  const [firstName, setFirstName] = useState(me.firstName ?? '');
  const [lastName, setLastName] = useState(me.lastName ?? '');
  const [birthDate, setBirthDate] = useState(toDateInputValue(me.birthDate));

  const [createOrder, { isLoading: submitting, error }] =
    useCreateOrderMutation();

  const subtotal = cartItems.reduce(
    (sum, line) => sum + line.unitPriceCents * line.quantity,
    0,
  );

  return (
    <div className="tma-page">
      <h1 className="page-title">Checkout</h1>
      <p className="page-placeholder" style={{ marginBottom: 16 }}>
        Delivery details are saved to your profile when you place the order.
      </p>
      <div className="form-stack">
        <div className="form-field">
          <label htmlFor="co-phone">Phone</label>
          <Input
            id="co-phone"
            type="tel"
            placeholder="+1 …"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div className="form-field">
          <label htmlFor="co-first">First name</label>
          <Input
            id="co-first"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>
        <div className="form-field">
          <label htmlFor="co-last">Last name</label>
          <Input
            id="co-last"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
        <div className="form-field">
          <label htmlFor="co-birth">Birthday</label>
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
          {errorMessage(error)}
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
        Place order ·{' '}
        {new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          maximumFractionDigits: 0,
        }).format(subtotal / 100)}
      </Button>
    </div>
  );
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const token = useAppSelector((s) => s.auth.accessToken);
  const cartItems = useAppSelector((s) => s.cart.items);

  const { data: me, isLoading: meLoading, isError: meError } = useGetMeQuery(
    undefined,
    {
      skip: !token,
    },
  );

  if (!token) {
    return (
      <div className="tma-page">
        <h1 className="page-title">Checkout</h1>
        <p className="page-placeholder">
          Open this app inside Telegram to sign in, or set{' '}
          <code style={{ fontSize: 13 }}>VITE_DEV_JWT</code> in{' '}
          <code style={{ fontSize: 13 }}>.env.local</code> for local API
          testing.
        </p>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="tma-page">
        <h1 className="page-title">Checkout</h1>
        <p className="page-placeholder">Your cart is empty.</p>
        <Button
          mode="filled"
          size="m"
          stretched
          style={{ marginTop: 16 }}
          onClick={() => navigate('/')}
        >
          Browse catalog
        </Button>
      </div>
    );
  }

  if (meLoading && !me) {
    return (
      <div className="tma-page tma-page--centered">
        <Spinner size="l" />
      </div>
    );
  }

  if (meError || !me) {
    return (
      <div className="tma-page">
        <h1 className="page-title">Checkout</h1>
        <p className="page-placeholder">Could not load your profile.</p>
      </div>
    );
  }

  return (
    <CheckoutForm key={me.id} me={me} cartItems={cartItems} />
  );
}
