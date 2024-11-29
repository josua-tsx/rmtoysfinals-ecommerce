export default function formatPrice(price) {
  return new Intl.NumberFormat().format(price);
}
