import { Navigate, Route, Routes } from 'react-router-dom';
import { AppBottomNav } from '../widgets/app-bottom-nav/ui/AppBottomNav';
import { CartPage } from '../pages/cart-page/ui/CartPage';
import { CatalogPage } from '../pages/catalog-page/ui/CatalogPage';
import { CheckoutPage } from '../pages/checkout-page/ui/CheckoutPage';
import { OrderDetailPage } from '../pages/order-detail-page/ui/OrderDetailPage';
import { OrdersPage } from '../pages/orders-page/ui/OrdersPage';
import { ProductPage } from '../pages/product-page/ui/ProductPage';
import { ProfilePage } from '../pages/profile-page/ui/ProfilePage';

export default function App() {
  return (
    <div className="tma-shell">
      <main className="tma-main">
        <Routes>
          <Route path="/" element={<CatalogPage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders/:id" element={<OrderDetailPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <AppBottomNav />
    </div>
  );
}
