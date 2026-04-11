import { Placeholder } from '@telegram-apps/telegram-ui';

export function CartPage() {
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
