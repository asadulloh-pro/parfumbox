import { demoProducts, formatPrice } from '../../../shared/mocks/demo-products';
import { Link } from 'react-router-dom';

export function CatalogPage() {
  return (
    <div className="tma-page">
      <p
        className="page-placeholder"
        style={{ marginBottom: 16, fontSize: 14 }}
      >
        Image-forward catalog — tap a card for details (API wiring in a later
        step).
      </p>
      <div className="explore-grid">
        {demoProducts.map((p) => (
          <Link key={p.id} to={`/product/${p.id}`} className="explore-card">
            <div className="explore-card__media">
              <img
                src={`https://picsum.photos/seed/${p.imageSeed}/400/400`}
                alt=""
                loading="lazy"
              />
            </div>
            <div className="explore-card__meta">
              <span className="explore-card__title">{p.title}</span>
              <span className="explore-card__price">
                {formatPrice(p.priceCents)}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
