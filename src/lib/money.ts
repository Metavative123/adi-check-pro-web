// Amounts arrive in the smallest unit (1900 = GBP 19.00).
export function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currency.toUpperCase(),
    // Whole pounds read better on a pricing card; keep pence when there are any.
    minimumFractionDigits: amount % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount / 100);
}
