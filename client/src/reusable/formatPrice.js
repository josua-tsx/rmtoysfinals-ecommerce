export default function formatPrice(price) {
  if (price === undefined || price === null || isNaN(price)) return "0";
  return new Intl.NumberFormat().format(price);
}
