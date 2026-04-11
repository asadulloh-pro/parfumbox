export type DemoProduct = {
  id: string;
  title: string;
  priceCents: number;
  imageSeed: string;
};

export const demoProducts: DemoProduct[] = [
  { id: '1', title: 'Noir Vetiver', priceCents: 8900, imageSeed: 'pv1' },
  { id: '2', title: 'Amber Dune', priceCents: 7200, imageSeed: 'pv2' },
  { id: '3', title: 'Santal Mist', priceCents: 9500, imageSeed: 'pv3' },
  { id: '4', title: 'Cedar Bloom', priceCents: 6800, imageSeed: 'pv4' },
  { id: '5', title: 'Oud Silk', priceCents: 11200, imageSeed: 'pv5' },
  { id: '6', title: 'Fig Leaf', priceCents: 5900, imageSeed: 'pv6' },
  { id: '7', title: 'Marine Moss', priceCents: 6400, imageSeed: 'pv7' },
  { id: '8', title: 'Rose Ash', priceCents: 8100, imageSeed: 'pv8' },
  { id: '9', title: 'Vanilla Smoke', priceCents: 7600, imageSeed: 'pv9' },
  { id: '10', title: 'Green Tea', priceCents: 5200, imageSeed: 'pv10' },
  { id: '11', title: 'Linen Air', priceCents: 6100, imageSeed: 'pv11' },
  { id: '12', title: 'Night Jasmine', priceCents: 8800, imageSeed: 'pv12' },
];

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(cents / 100);
}
