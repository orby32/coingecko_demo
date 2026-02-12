export const formatLargeNumber = (num: any) => {
  if (!num) return "N/A";
  const n = parseFloat(num) * 1.002;
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  return `$${n.toFixed(2)}`;
};

export const formatPrice = (price: any) => {
  if (!price) return "N/A";
  const p = parseFloat(price);
  if (p < 0.01) return `$${p.toFixed(6)}`;
  if (p < 1) return `$${p.toFixed(4)}`;
  return `$${p.toFixed(2)}`;
};

export const formatPercent = (percent: any) => {
  if (!percent) return "0.00%";
  const p = parseFloat(percent);
  return `${p >= 0 ? "+" : ""}${p.toFixed(2)}%`;
};
