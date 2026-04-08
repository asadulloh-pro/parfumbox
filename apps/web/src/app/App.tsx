import { Layout } from 'antd';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppHeader } from '@/widgets/app-header/ui/AppHeader';
import { CatalogPage } from '@/pages/catalog-page/ui/CatalogPage';
import { ProductPage } from '@/pages/product-page/ui/ProductPage';
import { CartPage } from '@/pages/cart-page/ui/CartPage';
import { CheckoutPage } from '@/pages/checkout-page/ui/CheckoutPage';
import { OrdersPage } from '@/pages/orders-page/ui/OrdersPage';

export function App() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AppHeader />
      <Layout.Content style={{ maxWidth: 960, margin: '0 auto', width: '100%' }}>
        <Routes>
          <Route path="/" element={<CatalogPage />} />
          <Route path="/product/:slug" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout.Content>
    </Layout>
  );
}
