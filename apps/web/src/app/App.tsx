import { Navigate, Route, Routes } from 'react-router-dom';
import { AppHeader } from '../widgets/app-header/ui/AppHeader';
import { CartPage } from '../pages/cart-page/ui/CartPage';
import { CatalogPage } from '../pages/catalog-page/ui/CatalogPage';
import { CheckoutPage } from '../pages/checkout-page/ui/CheckoutPage';
import { OrdersPage } from '../pages/orders-page/ui/OrdersPage';
import { ProductPage } from '../pages/product-page/ui/ProductPage';
import { ProfilePage } from '../pages/profile-page/ui/ProfilePage';

export default function App() {
  return (
    <div className="tma-shell">
      <AppHeader />
      <Routes>
        <Route path="/" element={<CatalogPage />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
