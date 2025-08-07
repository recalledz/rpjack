export function formatNumber(num) {
  return Number.isFinite(num) ? num.toLocaleString() : String(num);
}
