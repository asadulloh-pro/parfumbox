import { Button, Placeholder } from '@telegram-apps/telegram-ui';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import {
  removeLine,
  setLineQuantity,
} from '../../../features/cart/cartSlice';
import { formatPrice } from '../../../shared/lib/money';

export function CartPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const items = useAppSelector((s) => s.cart.items);

  const subtotal = items.reduce(
    (sum, line) => sum + line.unitPriceCents * line.quantity,
    0,
  );

  if (items.length === 0) {
    return (
      <div className="tma-page">
        <h1 className="page-title">Cart</h1>
        <Placeholder
          header="Cart is empty"
          description="Items you add from product pages will appear here."
        />
      </div>
    );
  }

  return (
    <div className="tma-page">
      <h1 className="page-title">Cart</h1>
      <ul className="cart-list">
        {items.map((line) => (
          <li key={line.productId} className="cart-line">
            <div className="cart-line__media">
              {line.imageUrl ? (
                <img src={line.imageUrl} alt="" />
              ) : (
                <div className="cart-line__placeholder" aria-hidden />
              )}
            </div>
            <div className="cart-line__body">
              <span className="cart-line__title">{line.title}</span>
              <span className="cart-line__price">
                {formatPrice(line.unitPriceCents * line.quantity)}
              </span>
              <div className="cart-line__qty">
                <button
                  type="button"
                  className="cart-qty-btn"
                  onClick={() =>
                    dispatch(
                      setLineQuantity({
                        productId: line.productId,
                        quantity: line.quantity - 1,
                      }),
                    )
                  }
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="cart-qty-value">{line.quantity}</span>
                <button
                  type="button"
                  className="cart-qty-btn"
                  onClick={() =>
                    dispatch(
                      setLineQuantity({
                        productId: line.productId,
                        quantity: line.quantity + 1,
                      }),
                    )
                  }
                  aria-label="Increase quantity"
                >
                  +
                </button>
                <button
                  type="button"
                  className="cart-line__remove"
                  onClick={() => dispatch(removeLine(line.productId))}
                >
                  Remove
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <div className="cart-subtotal">
        <span>Subtotal</span>
        <strong>{formatPrice(subtotal)}</strong>
      </div>
      <Button
        mode="filled"
        size="l"
        stretched
        onClick={() => navigate('/checkout')}
      >
        Checkout
      </Button>
    </div>
  );
}
